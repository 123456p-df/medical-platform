<script setup lang="ts">
import { computed, ref } from 'vue'
import { CalendarDays, FileImage, FolderOpen, Images, Upload, X } from 'lucide-vue-next'
import { organNames } from '@/api/mappers'
import { saveLocalUpload } from '@/api/localUploads'
import { detectModalityFromFiles, isRasterFile, isSupportedFile } from '@/utils/studyLoader'
import type { Examination, ExaminationType } from '@/types'

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
const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
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
  return manualModality.value === 'auto' ? detectedModality.value : manualModality.value
})

const totalSize = computed(() => files.value.reduce((sum, file) => sum + file.size, 0))
const fileKind = computed(() => files.value.length && files.value.every(isRasterFile) ? '普通图片序列' : 'DICOM 序列')
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

function sampledFiles(items: File[]) {
  if (items.length <= 32) return items
  const selected = new Set<number>([0, items.length - 1])
  for (let index = 1; index < 30; index += 1) {
    selected.add(Math.round(index * (items.length - 1) / 30))
  }
  return [...selected].sort((a, b) => a - b).map(index => items[index])
}

async function validateAndDetect() {
  const version = ++detectionVersion
  error.value = ''
  detectedModality.value = null
  if (!files.value.length) return
  const hasRaster = files.value.some(isRasterFile)
  const hasDicom = files.value.some(file => !isRasterFile(file))
  if (hasRaster && hasDicom) {
    error.value = 'DICOM 与 PNG/JPG 图片需要分开导入为不同检查。'
    return
  }
  detecting.value = true
  try {
    const modality = await detectModalityFromFiles(sampledFiles(files.value))
    if (version !== detectionVersion) return
    detectedModality.value = modality
    if (props.ctOnly && modality && modality !== 'CT') {
      error.value = `此处只接收 CT，检测到的是 ${modality}。`
    }
  } catch (reason) {
    if (version === detectionVersion) {
      error.value = reason instanceof Error ? reason.message : '读取影像信息失败。'
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
    notice.value = `已忽略 ${ignored.length} 个非影像文件${preview ? `：${preview}` : ''}`
  }
  if (!supported.length) {
    error.value = '请选择 DICOM、PNG、JPEG、WebP 或 BMP 影像文件。'
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
  detectedModality.value = null
  manualModality.value = 'auto'
  error.value = ''
  notice.value = ''
}

async function importStudy() {
  if (!files.value.length || !effectiveModality.value || detecting.value || busy.value || error.value) return
  busy.value = true
  error.value = ''
  const modality = effectiveModality.value
  const firstFile = files.value[0]
  const examination: Examination = {
    id: `LOCAL-STUDY-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
    patientId: props.patientId,
    type: modality,
    organId: organ.value,
    organ: organNames[organ.value] || organ.value,
    bodyPart: organNames[organ.value] || organ.value,
    date: studyDate.value,
    status: 'Pending Review',
    description: `本地导入：${firstFile.name}${files.value.length > 1 ? ` 等 ${files.value.length} 张影像` : ''}`,
    sliceCount: files.value.length,
    source: 'local-upload',
  }
  try {
    await saveLocalUpload({ examination, files: [...files.value], importedAt: new Date().toISOString() })
    clearFiles(true)
    emit('complete', [examination])
  } catch (reason) {
    error.value = reason instanceof DOMException && reason.name === 'QuotaExceededError'
      ? '浏览器存储空间不足，请减少本次影像数量或文件大小。'
      : '导入失败，请检查浏览器是否允许本地存储后重试。'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <form class="local-study-upload" @submit.prevent="importStudy">
    <div class="upload-heading">
      <div>
        <h3>{{ ctOnly ? '导入本地 CT' : '导入本地 CT / MRI' }}</h3>
        <p>支持真实 DICOM 序列和 PNG/JPG 等图片；文件只保存在当前浏览器。</p>
      </div>
      <Images :size="19" />
    </div>

    <div class="upload-options">
      <label class="label">部位
        <select v-model="organ" class="select" :disabled="busy">
          <option v-for="(name, id) in organNames" :key="id" :value="id">{{ name }}</option>
        </select>
      </label>
      <label class="label">影像类型
        <select v-if="!ctOnly" v-model="manualModality" class="select" :disabled="busy || detecting">
          <option value="auto">自动识别</option>
          <option value="CT">CT</option>
          <option value="MRI">MRI</option>
          <option value="X-Ray">X-Ray</option>
        </select>
        <input v-else class="input" value="CT" disabled />
      </label>
      <label class="label date-option">检查日期
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
      <strong>{{ dragging ? '松开即可导入这些影像' : '拖放 DICOM 或图片到这里' }}</strong>
      <small>同一次 CT/MRI 序列请一起选择；也可以继续补充文件</small>
      <div class="picker-actions">
        <button type="button" class="btn btn-secondary btn-sm" :disabled="busy" @click="fileInput?.click()"><FileImage :size="14" /> 选择文件</button>
        <button type="button" class="btn btn-secondary btn-sm" :disabled="busy" @click="folderInput?.click()"><FolderOpen :size="14" /> 选择文件夹</button>
      </div>
      <input ref="fileInput" class="hidden-file-input" type="file" accept=".dcm,application/dicom,image/png,image/jpeg,image/webp,image/bmp" multiple :disabled="busy" @change="selectFiles" />
      <input ref="folderInput" class="hidden-file-input" type="file" multiple webkitdirectory directory :disabled="busy" @change="selectFiles" />
    </div>

    <div v-if="files.length" class="selection-summary" role="status">
      <div>
        <strong>{{ files.length }} 张 · {{ fileKind }}</strong>
        <span>{{ (totalSize / 1024 / 1024).toFixed(1) }} MB · {{ detecting ? '正在识别类型…' : detectedModality ? `识别为 ${detectedModality}` : '请手动选择 CT 或 MRI' }}</span>
      </div>
      <button type="button" :disabled="busy" aria-label="清空已选影像" @click="clearFiles(false)"><X :size="16" /></button>
    </div>

    <div v-if="files.length" class="file-preview">
      <span v-for="file in files.slice(0, 5)" :key="fileKey(file)">{{ file.name }}</span>
      <span v-if="files.length > 5">另有 {{ files.length - 5 }} 张</span>
    </div>
    <p v-if="notice" class="upload-notice">{{ notice }}</p>
    <p v-if="error" class="upload-error" role="alert">{{ error }}</p>
    <p class="privacy-note">DICOM/图片不会上传到服务器；刷新页面后仍可在此浏览器中打开。</p>
    <button class="btn btn-primary" :disabled="busy || detecting || !files.length || !effectiveModality || !!error">
      <Upload :size="16" /> {{ busy ? '正在导入…' : files.length ? `导入 ${files.length} 张影像` : '请先选择影像' }}
    </button>
  </form>
</template>

<style scoped>
.local-study-upload{display:grid;gap:13px;padding:18px}.upload-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.upload-heading h3{margin:0 0 5px;font-size:15px}.upload-heading p{margin:0;color:var(--text-muted);font-size:11px;line-height:1.5}.upload-heading>svg{flex:0 0 auto;color:var(--accent)}.upload-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.upload-options .label{display:grid;gap:6px;margin:0}.date-option{grid-column:1/-1}.date-option>span{display:flex;align-items:center;gap:7px}.date-option input{min-width:0;width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--surface);color:var(--text)}.file-picker{position:relative;display:flex;min-height:142px;align-items:center;justify-content:center;flex-direction:column;gap:7px;padding:15px;border:1px dashed var(--border-strong);border-radius:8px;background:var(--surface-2);color:var(--accent-strong);text-align:center;transition:border-color 150ms ease,background 150ms ease,box-shadow 150ms ease}.file-picker>small{color:var(--text-muted);font-size:10px;font-weight:500}.file-picker.dragging{border-color:var(--accent);background:var(--accent-soft);box-shadow:0 0 0 4px rgb(47 143 146 / 10%)}.file-picker.disabled{opacity:.6}.picker-actions{display:flex;gap:7px;margin-top:4px}.hidden-file-input{display:none}.selection-summary{display:flex;align-items:center;justify-content:space-between;gap:9px;padding:10px;border:1px solid #b9d9d5;border-radius:7px;background:#f1f8f7}.selection-summary>div{display:grid;min-width:0;gap:3px}.selection-summary strong{font-size:11px}.selection-summary span{color:var(--text-muted);font-size:9px}.selection-summary button{display:grid;width:27px;height:27px;flex:0 0 auto;place-items:center;border:0;background:transparent;color:var(--text-muted)}.selection-summary button:hover{color:var(--red)}.file-preview{display:grid;gap:4px;max-height:92px;overflow:auto;color:var(--text-muted);font-size:9px}.file-preview span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.privacy-note,.upload-notice,.upload-error{margin:0;font-size:10px;line-height:1.5}.privacy-note{color:var(--text-muted)}.upload-notice{color:#8a682d}.upload-error{color:var(--red)}@media(max-width:520px){.upload-options{grid-template-columns:1fr}.date-option{grid-column:auto}.picker-actions{width:100%;flex-direction:column}.picker-actions .btn{width:100%}}
</style>
