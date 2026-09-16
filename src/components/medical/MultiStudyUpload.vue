<script setup lang="ts">
import { computed, ref } from 'vue'
import { Ban, CalendarDays, RotateCcw, Upload, X } from 'lucide-vue-next'
import { examinationApi } from '@/api/examinations'
import { organNames } from '@/api/mappers'
import type { Examination } from '@/types'
import { localPreview } from '@/utils/runtime'
import LocalStudyUpload from './LocalStudyUpload.vue'
import { dateFromFilename, localCalendarDate } from '@/utils/dates'
import { t } from '@/i18n'

interface UploadEntry {
  id: string
  file: File
  studyDate: string
  status: 'queued' | 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled'
  progress: number
  error?: string
  elapsedMs?: number
}

const props = withDefaults(defineProps<{
  patientId: string
  ctOnly?: boolean
}>(), {
  ctOnly: false,
})

const emit = defineEmits<{
  complete: [studies: Examination[]]
}>()

const entries = ref<UploadEntry[]>([])
const organ = ref('lung')
const imageType = ref<'CT' | 'MRI'>('CT')
const busy = ref(false)
const error = ref('')
const dragging = ref(false)
const fileInput = ref<HTMLInputElement>()
const today = localCalendarDate()
const effectiveType = computed<'CT' | 'MRI'>(() => props.ctOnly ? 'CT' : imageType.value)
const finishedCount = computed(() => entries.value.filter(entry => entry.status === 'completed').length)
const retryableCount = computed(() => entries.value.filter(entry => ['failed', 'cancelled'].includes(entry.status)).length)
const pendingCount = computed(() => entries.value.filter(entry => entry.status !== 'completed').length)
const currentEntry = computed(() => entries.value.find(entry => ['uploading', 'processing'].includes(entry.status)))
let activeController: AbortController | undefined
let cancelPendingRequested = false

function inferredDate(file: File) {
  return dateFromFilename(file.name, today)
}

function addFiles(files: File[]) {
  error.value = ''
  const accepted = files.filter(file => /\.nii(?:\.gz)?$/i.test(file.name))
  const rejected = files.filter(file => !/\.nii(?:\.gz)?$/i.test(file.name))
  if (rejected.length) error.value = t('ui.upload.rejectedFiles', { names: rejected.map(file => file.name).join(', ') })
  const known = new Set(entries.value.map(entry => entry.id))
  const additions = accepted
    .map(file => ({ id: `${file.name}-${file.size}-${file.lastModified}`, file, studyDate: inferredDate(file), status: 'queued' as const, progress: 0 }))
    .filter(entry => !known.has(entry.id))
  entries.value = [...entries.value, ...additions]
  if (accepted.length && !additions.length) error.value = t('ui.upload.duplicates')
}

function selectFiles(event: Event) {
  const input = event.target as HTMLInputElement
  addFiles(Array.from(input.files || []))
  input.value = ''
}

function setDragging(value: boolean) {
  if (!busy.value) dragging.value = value
}

function dropFiles(event: DragEvent) {
  dragging.value = false
  if (busy.value) return
  addFiles(Array.from(event.dataTransfer?.files || []))
}

function removeEntry(id: string) {
  if (busy.value) return
  entries.value = entries.value.filter(item => item.id !== id)
}

function statusLabel(entry: UploadEntry) {
  if (entry.status === 'uploading') return t('ui.upload.progressPercent', { percent: entry.progress })
  if (entry.status === 'processing') return t('ui.upload.processing')
  if (entry.status === 'completed') return entry.elapsedMs
    ? t('ui.upload.completedIn', { seconds: (entry.elapsedMs / 1000).toFixed(1) })
    : t('ui.upload.completed')
  if (entry.status === 'failed') return t('ui.upload.failed')
  if (entry.status === 'cancelled') return t('ui.upload.cancelled')
  return t('ui.upload.waiting')
}

function cancelCurrent() {
  activeController?.abort()
}

function cancelPending() {
  cancelPendingRequested = true
  entries.value.forEach(entry => {
    if (entry.status === 'queued') entry.status = 'cancelled'
  })
}

async function uploadAll(retryOnly = false) {
  if (!entries.value.length || busy.value) return
  const targets = entries.value.filter(entry => retryOnly
    ? ['failed', 'cancelled'].includes(entry.status)
    : entry.status !== 'completed')
  if (!targets.length) return
  busy.value = true
  cancelPendingRequested = false
  error.value = ''
  const batch = {
    patientId: props.patientId,
    organId: organ.value,
    imageType: effectiveType.value,
    entries: targets.map(entry => ({ ...entry, status: 'queued' as const, progress: 0, error: undefined })),
  }
  const uploaded: Examination[] = []
  for (const entry of batch.entries) {
    const liveEntry = entries.value.find(item => item.id === entry.id)
    if (!liveEntry) continue
    if (cancelPendingRequested) {
      liveEntry.status = 'cancelled'
      continue
    }
    const startedAt = performance.now()
    liveEntry.status = 'uploading'
    liveEntry.progress = 0
    liveEntry.error = undefined
    activeController = new AbortController()
    try {
      uploaded.push(await examinationApi.uploadStudy(
        batch.patientId,
        entry.file,
        batch.organId,
        batch.imageType,
        entry.studyDate,
        {
          signal: activeController.signal,
          onProgress: progress => {
            liveEntry.status = progress.phase
            liveEntry.progress = progress.percent
          },
        },
      ))
      liveEntry.status = 'completed'
      liveEntry.progress = 100
    } catch (reason) {
      const cancelled = reason instanceof DOMException && reason.name === 'AbortError'
      liveEntry.status = cancelled ? 'cancelled' : 'failed'
      liveEntry.error = cancelled ? t('ui.upload.cancelledRetry') : reason instanceof Error ? reason.message : t('ui.upload.failed')
    } finally {
      liveEntry.elapsedMs = performance.now() - startedAt
      activeController = undefined
    }
  }
  busy.value = false
  const failures = entries.value.filter(entry => entry.status === 'failed').length
  const cancelled = entries.value.filter(entry => entry.status === 'cancelled').length
  if (failures || cancelled) error.value = t('ui.upload.partialSummary', { uploaded: uploaded.length, failures, cancelled })
  if (uploaded.length) emit('complete', uploaded)
}
</script>

<template>
  <LocalStudyUpload v-if="localPreview" :patient-id="patientId" :ct-only="ctOnly" @complete="emit('complete', $event)" />
  <form v-else class="multi-upload" @submit.prevent="uploadAll(false)">
    <div class="upload-heading">
      <div><h3>{{ $t(ctOnly ? 'ui.upload.batchCtTitle' : 'ui.upload.batchTitle') }}</h3><p>{{ $t('ui.upload.batchHelp') }}</p></div>
      <Upload :size="18" />
    </div>
    <div class="upload-options">
      <label class="label">{{ $t('Organ') }}<select v-model="organ" class="select" :disabled="busy"><option v-for="(name,id) in organNames" :key="id" :value="id">{{ $t(name) }}</option></select></label>
      <label v-if="!ctOnly" class="label">{{ $t('Modality') }}<select v-model="imageType" class="select" :disabled="busy"><option value="CT">CT</option><option value="MRI">MRI</option></select></label>
      <label v-else class="label">{{ $t('Modality') }}<input class="input" value="CT" disabled /></label>
    </div>
    <label
      class="file-picker"
      :class="{ disabled: busy, dragging }"
      @dragenter.prevent="setDragging(true)"
      @dragover.prevent="setDragging(true)"
      @dragleave.prevent="setDragging(false)"
      @drop.prevent.stop="dropFiles"
    >
      <Upload :size="19" />
      <span><strong>{{ $t(dragging ? 'ui.upload.dropReady' : 'ui.upload.dropFiles') }}</strong><small>{{ $t('ui.upload.clickToAdd') }}</small></span>
      <input ref="fileInput" type="file" accept=".nii,.nii.gz" multiple :disabled="busy" @change="selectFiles" />
    </label>
    <p v-if="entries.length" class="file-count" role="status">{{ $t('ui.upload.selectedCount', { count: entries.length }) }}</p>
    <div v-if="entries.length" class="upload-queue">
      <div v-for="entry in entries" :key="entry.id" class="upload-row" :class="`is-${entry.status}`">
        <div class="upload-file"><strong>{{ entry.file.name }}</strong><small>{{ (entry.file.size / 1024 / 1024).toFixed(1) }} MB · {{ statusLabel(entry) }}</small><progress v-if="entry.status === 'uploading'" :value="entry.progress" max="100" /></div>
        <label><CalendarDays :size="14" /><span>{{ $t('ui.upload.studyDate') }}</span><input v-model="entry.studyDate" type="date" :max="today" required :disabled="busy" /></label>
        <button type="button" :aria-label="$t('ui.upload.removeEntry')" :disabled="busy" @click="removeEntry(entry.id)"><X :size="15" /></button>
        <p v-if="entry.error" class="entry-error">{{ entry.error }}</p>
      </div>
    </div>
    <div v-if="busy" class="queue-actions"><span class="progress-note">{{ $t('ui.upload.progressSummary', { finished: finishedCount, total: entries.length }) }}</span><button v-if="currentEntry" type="button" class="text-action" @click="cancelCurrent"><Ban :size="13" /> {{ $t('ui.upload.cancelCurrent') }}</button><button type="button" class="text-action" @click="cancelPending">{{ $t('ui.upload.cancelPending') }}</button></div>
    <p v-if="error" class="upload-error" role="alert">{{ error }}</p>
    <div class="submit-actions"><button v-if="retryableCount && !busy" type="button" class="btn btn-secondary" @click="uploadAll(true)"><RotateCcw :size="16" /> {{ $t('ui.upload.retryCount', { count: retryableCount }) }}</button><button class="btn btn-primary" :disabled="busy || !pendingCount"><Upload :size="16" /> {{ busy ? $t('ui.upload.progressSummary', { finished: finishedCount, total: entries.length }) : pendingCount ? $t('ui.upload.uploadCount', { count: pendingCount }) : $t('ui.upload.batchComplete') }}</button></div>
  </form>
</template>

<style scoped>
.multi-upload{display:grid;gap:13px;padding:18px}.upload-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.upload-heading h3{margin:0 0 5px;font-size:15px}.upload-heading p{margin:0;color:var(--text-muted);font-size:11px;line-height:1.5}.upload-heading>svg{color:var(--accent)}.upload-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.upload-options .label{display:grid;gap:6px;margin:0}.file-picker{display:flex;min-height:92px;align-items:center;justify-content:center;gap:10px;border:1px dashed var(--border-strong);border-radius:8px;background:var(--surface-2);color:var(--accent-strong);font-size:12px;font-weight:650;cursor:pointer;transition:border-color 150ms ease,background 150ms ease,box-shadow 150ms ease}.file-picker>span{display:grid;gap:4px}.file-picker small{color:var(--text-muted);font-size:10px;font-weight:500}.file-picker:hover,.file-picker.dragging{border-color:var(--accent);background:var(--accent-soft);box-shadow:0 0 0 4px rgb(47 143 146 / 10%)}.file-picker.disabled{cursor:default;opacity:.6}.file-picker input{position:absolute;width:1px;height:1px;overflow:hidden;opacity:0}.file-count{margin:0;color:var(--accent-strong);font-size:11px;font-weight:650}.upload-queue{display:grid;gap:7px;max-height:300px;overflow:auto}.upload-row{display:grid;grid-template-columns:minmax(0,1fr) auto 28px;align-items:center;gap:10px;padding:9px;border:1px solid var(--border);border-radius:7px;background:var(--surface)}.upload-row.is-failed{border-color:#e7b5b5}.upload-row.is-completed{border-color:#a9d8c5;background:#f3fbf7}.upload-row>div{display:grid;min-width:0;gap:3px}.upload-row strong{overflow:hidden;text-overflow:ellipsis;font-size:11px;white-space:nowrap}.upload-row small{color:var(--text-muted);font-size:9px}.upload-file progress{width:100%;height:5px}.upload-row label{display:flex;align-items:center;gap:5px;color:var(--text-muted);font-size:9px}.upload-row label span{display:none}.upload-row input{width:126px;padding:5px;border:1px solid var(--border);border-radius:5px;background:var(--surface);color:var(--text);font-size:10px}.upload-row>button{display:grid;width:28px;height:28px;place-items:center;border:0;background:transparent;color:var(--text-muted)}.upload-row>button:hover{color:var(--red)}.entry-error{grid-column:1/-1;margin:0;color:var(--red);font-size:9px}.queue-actions,.submit-actions{display:flex;align-items:center;gap:9px;flex-wrap:wrap}.queue-actions .progress-note{margin-right:auto}.text-action{display:inline-flex;align-items:center;gap:4px;border:0;background:transparent;color:var(--accent-strong);font-size:10px;cursor:pointer}.submit-actions .btn-primary{flex:1}.preview-note,.progress-note,.upload-error{margin:0;font-size:11px;line-height:1.5}.preview-note{color:#8a682d}.progress-note{color:var(--accent-strong)}.upload-error{color:var(--red)}@media(max-width:520px){.upload-options{grid-template-columns:1fr}.upload-row{grid-template-columns:1fr 28px}.upload-row label{grid-column:1}.upload-row>button{grid-column:2;grid-row:1}}
</style>
