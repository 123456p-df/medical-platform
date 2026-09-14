<script setup lang="ts">
import { computed, ref } from 'vue'
import { CalendarDays, FileImage, FolderOpen, Images, Upload, X } from 'lucide-vue-next'
import { organNames } from '@/api/mappers'
import { estimateLocalStorage, saveLocalUpload } from '@/api/localStudyRepository'
import { analyzeDicomFiles, detectModalityFromFiles, isRasterFile, isSupportedFile, type DicomSeriesGroup } from '@/utils/studyLoader'
import type { Examination, ExaminationType } from '@/types'
import { localCalendarDate } from '@/utils/dates'
import { t } from '@/i18n'

const props = withDefaults(defineProps<{
  patientId: string
  ctOnly?: boolean
}>(), {
  ctOnly: false,
})

const emit = defineEmits<{
  complete: [studies: Examination[]]
}>()

const files = ref<File[]>([])
const organ = ref('lung')
const manualModality = ref<'auto' | ExaminationType>('auto')
const detectedModality = ref<ExaminationType | null>(null)
const dicomGroups = ref<DicomSeriesGroup[]>([])
const confirmPatientAssociation = ref(false)
const today = localCalendarDate()
const studyDate = ref(today)
const busy = ref(false)
const detecting = ref(false)
const dragging = ref(false)
const error = ref('')
const notice = ref('')
const fileInput = ref<HTMLInputElement>()
const folderInput = ref<HTMLInputElement>()
let detectionVersion = 0

const effectiveModality = computed<ExaminationType | null>(() => {
  if (props.ctOnly) return 'CT'
  if (dicomGroups.value.length) return detectedModality.value
  return manualModality.value === 'auto' ? detectedModality.value : manualModality.value
})
const mismatchedPatientIds = computed(() => [...new Set(dicomGroups.value
  .map(group => group.patientId)
  .filter(patientId => patientId && patientId !== props.patientId))])

const totalSize = computed(() => files.value.reduce((sum, file) => sum + file.size, 0))
const fileKind = computed(() => files.value.length && files.value.every(isRasterFile) ? t('ui.upload.rasterSeries') : t('ui.upload.dicomSeries'))
const naturalOrder = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

function fileKey(file: File) {
  return `${file.webkitRelativePath || file.name}-${file.size}-${file.lastModified}`
}

function sortFiles(items: File[]) {
  return [...items].sort((left, right) => naturalOrder.compare(
    left.webkitRelativePath || left.name,
    right.webkitRelativePath || right.name,
  ))
}

async function validateAndDetect() {
  const version = ++detectionVersion
  error.value = ''
  detectedModality.value = null
  dicomGroups.value = []
  confirmPatientAssociation.value = false
  if (!files.value.length) return
  const hasRaster = files.value.some(isRasterFile)
  const hasDicom = files.value.some(file => !isRasterFile(file))
  if (hasRaster && hasDicom) {
    error.value = t('ui.upload.mixedKinds')
    return
  }
  detecting.value = true
  try {
    const groups = hasDicom ? await analyzeDicomFiles(files.value) : []
    const modality = hasDicom
      ? (() => {
          const modalities = new Set(groups.map(group => group.modality))
          if (modalities.size > 1) throw new Error(t('ui.upload.mixedModalities'))
          return groups[0]?.modality || null
        })()
      : await detectModalityFromFiles(files.value)
    if (version !== detectionVersion) return
    dicomGroups.value = groups
    detectedModality.value = modality
    if (props.ctOnly && modality && modality !== 'CT') {
      error.value = t('ui.upload.ctOnlyDetected', { modality })
    }
  } catch (reason) {
    if (version === detectionVersion) {
      error.value = reason instanceof Error ? reason.message : t('ui.upload.detectFailed')
    }
  } finally {
    if (version === detectionVersion) detecting.value = false
  }
}

function addFiles(incoming: File[]) {
  if (busy.value) return
  error.value = ''
  notice.value = ''
  const supported = incoming.filter(file => isSupportedFile(file) && !/^DICOMDIR$/i.test(file.name))
  const ignored = incoming.filter(file => !supported.includes(file))
  if (ignored.length) {
    const preview = ignored.slice(0, 3).map(file => file.name).join('、')
    notice.value = t('ui.upload.ignoredFiles', { count: ignored.length, preview })
  }
  if (!supported.length) {
    error.value = t('ui.upload.invalidSelection')
    return
  }
  const merged = new Map(files.value.map(file => [fileKey(file), file]))
  supported.forEach(file => merged.set(fileKey(file), file))
  files.value = sortFiles([...merged.values()])
  manualModality.value = 'auto'
  void validateAndDetect()
}

function selectFiles(event: Event) {
  const input = event.target as HTMLInputElement
  addFiles(Array.from(input.files ?? []))
  input.value = ''
}

function dropFiles(event: DragEvent) {
  dragging.value = false
  addFiles(Array.from(event.dataTransfer?.files ?? []))
}

function clearFiles(force = false) {
  if (busy.value && !force) return
  detectionVersion += 1
  files.value = []
  detecting.value = false
  detectedModality.value = null
  dicomGroups.value = []
  confirmPatientAssociation.value = false
  manualModality.value = 'auto'
  error.value = ''
  notice.value = ''
}

function removeFile(file: File) {
  if (busy.value) return
  files.value = files.value.filter(item => fileKey(item) !== fileKey(file))
  void validateAndDetect()
}

async function importStudy() {
  if (!files.value.length || !effectiveModality.value || detecting.value || busy.value || error.value) return
  if (mismatchedPatientIds.value.length && !confirmPatientAssociation.value) {
    error.value = t('ui.upload.confirmPatientAssociation')
    return
  }
  busy.value = true
  error.value = ''
  try {
    const storage = await estimateLocalStorage()
    if (storage.quota && storage.usage + totalSize.value > storage.quota * 0.95) {
      throw new Error(t('ui.upload.storageQuota'))
    }
    const importedAt = new Date().toISOString()
    const sourceGroups = dicomGroups.value.length
      ? dicomGroups.value
      : [{ files: [...files.value], modality: effectiveModality.value, studyDate: studyDate.value }]
    const examinations: Examination[] = []
    for (const group of sourceGroups) {
      const dicomGroup = 'seriesInstanceUID' in group ? group : null
      const groupFiles = group.files
      const modality = group.modality || effectiveModality.value
      const firstFile = groupFiles[0]
      const examination: Examination = {
        id: `LOCAL-STUDY-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
        patientId: props.patientId,
        type: modality,
        organId: organ.value,
        organ: organNames[organ.value] || organ.value,
        bodyPart: organNames[organ.value] || organ.value,
        date: dicomGroup?.studyDate || studyDate.value,
        status: 'Pending Review',
        description: dicomGroup?.seriesDescription
          ? t('ui.upload.dicomDescription', { description: dicomGroup.seriesDescription, frames: dicomGroup.totalFrames })
          : t('ui.upload.localDescription', { name: firstFile.name, count: groupFiles.length }),
        sliceCount: dicomGroup?.totalFrames || groupFiles.length,
        shape: dicomGroup?.columns && dicomGroup.rows ? [dicomGroup.columns, dicomGroup.rows, dicomGroup.totalFrames] : undefined,
        spacing: dicomGroup?.pixelSpacing ? [dicomGroup.pixelSpacing[1], dicomGroup.pixelSpacing[0], dicomGroup.sliceSpacing || 1] : undefined,
        acquisition: dicomGroup ? {
          studyInstanceUID: dicomGroup.studyInstanceUID,
          seriesInstanceUID: dicomGroup.seriesInstanceUID,
          dicomPatientId: dicomGroup.patientId,
          transferSyntaxUIDs: dicomGroup.transferSyntaxUIDs,
          imageOrientationPatient: dicomGroup.metadata[0]?.imageOrientationPatient,
          framesPerFile: dicomGroup.metadata.map(item => item.numberOfFrames),
        } : undefined,
        source: 'local-upload',
      }
      await saveLocalUpload({ examination, files: groupFiles, importedAt })
      examinations.push(examination)
    }
    clearFiles(true)
    emit('complete', examinations)
  } catch (reason) {
    error.value = reason instanceof Error
      ? reason.message
      : t('ui.upload.importFailed')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <form class="local-study-upload" @submit.prevent="importStudy">
    <div class="upload-heading">
      <div>
        <h3>{{ $t(ctOnly ? 'ui.upload.localCtTitle' : 'ui.upload.localTitle') }}</h3>
        <p>{{ $t('ui.upload.localHelp') }}</p>
      </div>
      <Images :size="19" />
    </div>

    <div class="upload-options">
      <label class="label">{{ $t('ui.upload.bodyRegion') }}
        <select v-model="organ" class="select" :disabled="busy">
          <option v-for="(name, id) in organNames" :key="id" :value="id">{{ $t(name) }}</option>
        </select>
      </label>
      <label class="label">{{ $t('Imaging type') }}
        <select v-if="!ctOnly" v-model="manualModality" class="select" :disabled="busy || detecting || !!dicomGroups.length">
          <option value="auto">{{ $t('Auto-detect') }}</option>
          <option value="CT">CT</option>
          <option value="MRI">MRI</option>
          <option value="X-Ray">X-Ray</option>
        </select>
        <input v-else class="input" value="CT" disabled />
      </label>
      <label class="label date-option">{{ $t('ui.upload.studyDate') }}
        <span><CalendarDays :size="14" /><input v-model="studyDate" type="date" :max="today" :disabled="busy" required /></span>
      </label>
    </div>

    <div
      class="file-picker"
      :class="{ disabled: busy, dragging }"
      @dragenter.prevent="!busy && (dragging = true)"
      @dragover.prevent="!busy && (dragging = true)"
      @dragleave.prevent="dragging = false"
      @drop.prevent.stop="dropFiles"
    >
      <Upload :size="23" />
      <strong>{{ $t(dragging ? 'ui.upload.dropReady' : 'ui.upload.dropImages') }}</strong>
      <small>{{ $t('ui.upload.seriesHint') }}</small>
      <div class="picker-actions">
        <button type="button" class="btn btn-secondary btn-sm" :disabled="busy" @click="fileInput?.click()"><FileImage :size="14" /> {{ $t('Choose files') }}</button>
        <button type="button" class="btn btn-secondary btn-sm" :disabled="busy" @click="folderInput?.click()"><FolderOpen :size="14" /> {{ $t('ui.upload.chooseFolder') }}</button>
      </div>
      <input ref="fileInput" class="hidden-file-input" type="file" accept=".dcm,application/dicom,image/png,image/jpeg,image/webp,image/bmp" multiple :disabled="busy" @change="selectFiles" />
      <input ref="folderInput" class="hidden-file-input" type="file" multiple webkitdirectory directory :disabled="busy" @change="selectFiles" />
    </div>

    <div v-if="files.length" class="selection-summary" role="status">
      <div>
        <strong>{{ $t('ui.upload.fileSummary', { count: files.length, kind: fileKind }) }}</strong>
        <span>{{ (totalSize / 1024 / 1024).toFixed(1) }} MB · {{ detecting ? $t('Detecting...') : detectedModality ? $t('ui.upload.detectedAs', { modality: detectedModality }) : $t('ui.upload.selectModality') }}</span>
      </div>
      <button type="button" :disabled="busy" :aria-label="$t('ui.upload.clearSelection')" @click="clearFiles(false)"><X :size="16" /></button>
    </div>

    <div v-if="files.length" class="file-preview" :aria-label="$t('ui.upload.selectedFiles')">
      <span v-for="file in files" :key="fileKey(file)"><span>{{ file.name }}</span><button type="button" :disabled="busy" :aria-label="$t('ui.upload.excludeFile', { name: file.name })" @click="removeFile(file)"><X :size="12" /></button></span>
    </div>
    <div v-if="dicomGroups.length" class="series-summary">
      <strong>{{ $t('ui.upload.dicomSeriesCount', { count: dicomGroups.length }) }}</strong>
      <span v-for="group in dicomGroups" :key="group.key">
        {{ $t('ui.upload.dicomSeriesDetail', { modality: group.modality, description: group.seriesDescription || group.seriesInstanceUID, files: group.files.length, frames: group.totalFrames }) }}
      </span>
    </div>
    <label v-if="mismatchedPatientIds.length" class="patient-warning">
      <input v-model="confirmPatientAssociation" type="checkbox" :disabled="busy" />
      {{ $t('ui.upload.patientIdMismatch', { dicom: mismatchedPatientIds.join(', '), patient: patientId }) }}
    </label>
    <p v-if="notice" class="upload-notice">{{ notice }}</p>
    <p v-if="error" class="upload-error" role="alert">{{ error }}</p>
    <p class="privacy-note">{{ $t('ui.upload.privacyNote') }}</p>
    <button class="btn btn-primary" :disabled="busy || detecting || !files.length || !effectiveModality || !!error || (!!mismatchedPatientIds.length && !confirmPatientAssociation)">
      <Upload :size="16" /> {{ busy ? $t('Importing...') : files.length ? $t('ui.upload.importSummary', { studies: dicomGroups.length || 1, images: files.length }) : $t('ui.upload.selectFirst') }}
    </button>
  </form>
</template>

<style scoped>
.local-study-upload{display:grid;gap:13px;padding:18px}.upload-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.upload-heading h3{margin:0 0 5px;font-size:15px}.upload-heading p{margin:0;color:var(--text-muted);font-size:11px;line-height:1.5}.upload-heading>svg{flex:0 0 auto;color:var(--accent)}.upload-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.upload-options .label{display:grid;gap:6px;margin:0}.date-option{grid-column:1/-1}.date-option>span{display:flex;align-items:center;gap:7px}.date-option input{min-width:0;width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--surface);color:var(--text)}.file-picker{position:relative;display:flex;min-height:142px;align-items:center;justify-content:center;flex-direction:column;gap:7px;padding:15px;border:1px dashed var(--border-strong);border-radius:8px;background:var(--surface-2);color:var(--accent-strong);text-align:center;transition:border-color 150ms ease,background 150ms ease,box-shadow 150ms ease}.file-picker>small{color:var(--text-muted);font-size:10px;font-weight:500}.file-picker.dragging{border-color:var(--accent);background:var(--accent-soft);box-shadow:0 0 0 4px rgb(47 143 146 / 10%)}.file-picker.disabled{opacity:.6}.picker-actions{display:flex;gap:7px;margin-top:4px}.hidden-file-input{display:none}.selection-summary{display:flex;align-items:center;justify-content:space-between;gap:9px;padding:10px;border:1px solid #b9d9d5;border-radius:7px;background:#f1f8f7}.selection-summary>div{display:grid;min-width:0;gap:3px}.selection-summary strong{font-size:11px}.selection-summary span{color:var(--text-muted);font-size:9px}.selection-summary button{display:grid;width:27px;height:27px;flex:0 0 auto;place-items:center;border:0;background:transparent;color:var(--text-muted)}.selection-summary button:hover{color:var(--red)}.file-preview,.series-summary{display:grid;gap:4px;max-height:150px;overflow:auto;color:var(--text-muted);font-size:9px}.file-preview>span{display:flex;align-items:center;gap:6px}.file-preview>span>span{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.file-preview button{display:grid;width:20px;height:20px;flex:0 0 auto;place-items:center;border:0;border-radius:4px;background:transparent;color:var(--text-muted)}.file-preview button:hover{background:#fee;color:var(--red)}.series-summary{padding:9px;border-radius:7px;background:var(--surface-2)}.series-summary strong{color:var(--text-soft);font-size:10px}.patient-warning{display:flex;align-items:flex-start;gap:8px;padding:10px;border:1px solid #dfc58e;border-radius:7px;background:#fff8e8;color:#765b27;font-size:10px;line-height:1.5}.patient-warning input{margin-top:2px}.privacy-note,.upload-notice,.upload-error{margin:0;font-size:10px;line-height:1.5}.privacy-note{color:var(--text-muted)}.upload-notice{color:#8a682d}.upload-error{color:var(--red)}@media(max-width:520px){.upload-options{grid-template-columns:1fr}.date-option{grid-column:auto}.picker-actions{width:100%;flex-direction:column}.picker-actions .btn{width:100%}}
</style>
