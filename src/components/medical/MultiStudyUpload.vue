<script setup lang="ts">
import { computed, ref } from 'vue'
import { CalendarDays, Upload, X } from 'lucide-vue-next'
import { examinationApi } from '@/api/examinations'
import { organNames } from '@/api/mappers'
import type { Examination } from '@/types'
import { localPreview } from '@/utils/runtime'
import LocalStudyUpload from './LocalStudyUpload.vue'

interface UploadEntry {
  id: string
  file: File
  studyDate: string
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
const completed = ref(0)
const error = ref('')
const dragging = ref(false)
const fileInput = ref<HTMLInputElement>()
const today = (() => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
})()
const effectiveType = computed<'CT' | 'MRI'>(() => props.ctOnly ? 'CT' : imageType.value)

function inferredDate(file: File) {
  const match = file.name.match(/(20\d{2})[-_]?([01]\d)[-_]?([0-3]\d)/)
  if (!match) return today
  const value = `${match[1]}-${match[2]}-${match[3]}`
  const parsed = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsed.getTime()) || value > today ? today : value
}

function addFiles(files: File[]) {
  error.value = ''
  const accepted = files.filter(file => /\.nii(?:\.gz)?$/i.test(file.name))
  const rejected = files.filter(file => !/\.nii(?:\.gz)?$/i.test(file.name))
  if (rejected.length) error.value = `已忽略不支持的文件：${rejected.map(file => file.name).join('、')}`
  const known = new Set(entries.value.map(entry => entry.id))
  const additions = accepted
    .map(file => ({ id: `${file.name}-${file.size}-${file.lastModified}`, file, studyDate: inferredDate(file) }))
    .filter(entry => !known.has(entry.id))
  entries.value = [...entries.value, ...additions]
  if (accepted.length && !additions.length) error.value = '所选文件已在上传列表中。'
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

async function uploadAll() {
  if (!entries.value.length || busy.value) return
  busy.value = true
  completed.value = 0
  error.value = ''
  const uploaded: Examination[] = []
  const failed = new Set<string>()
  for (const entry of entries.value) {
    try {
      uploaded.push(await examinationApi.uploadStudy(
        props.patientId,
        entry.file,
        organ.value,
        effectiveType.value,
        entry.studyDate,
      ))
    } catch (reason) {
      failed.add(entry.id)
      const message = reason instanceof Error ? reason.message : '上传失败'
      error.value += `${error.value ? '；' : ''}${entry.file.name}：${message}`
    } finally {
      completed.value += 1
    }
  }
  entries.value = entries.value.filter(item => failed.has(item.id))
  busy.value = false
  if (uploaded.length) emit('complete', uploaded)
}
</script>

<template>
  <LocalStudyUpload v-if="localPreview" :patient-id="patientId" :ct-only="ctOnly" @complete="emit('complete', $event)" />
  <form v-else class="multi-upload" @submit.prevent="uploadAll">
    <div class="upload-heading">
      <div><h3>{{ ctOnly ? '批量上传 CT' : '批量上传 CT / MRI' }}</h3><p>可一次选择或拖入多份 NIfTI，并为每份设置检查日期。</p></div>
      <Upload :size="18" />
    </div>
    <div class="upload-options">
      <label class="label">Organ<select v-model="organ" class="select"><option v-for="(name,id) in organNames" :key="id" :value="id">{{ name }}</option></select></label>
      <label v-if="!ctOnly" class="label">Modality<select v-model="imageType" class="select"><option value="CT">CT</option><option value="MRI">MRI</option></select></label>
      <label v-else class="label">Modality<input class="input" value="CT" disabled /></label>
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
      <span><strong>{{ dragging ? '松开即可加入上传列表' : '拖放 .nii / .nii.gz 文件到这里' }}</strong><small>或点击选择，可分多次继续添加</small></span>
      <input ref="fileInput" type="file" accept=".nii,.nii.gz" multiple :disabled="busy" @change="selectFiles" />
    </label>
    <p v-if="entries.length" class="file-count" role="status">已选择 {{ entries.length }} 份检查</p>
    <div v-if="entries.length" class="upload-queue">
      <div v-for="entry in entries" :key="entry.id" class="upload-row">
        <div><strong>{{ entry.file.name }}</strong><small>{{ (entry.file.size / 1024 / 1024).toFixed(1) }} MB</small></div>
        <label><CalendarDays :size="14" /><span>检查日期</span><input v-model="entry.studyDate" type="date" :max="today" required :disabled="busy" /></label>
        <button type="button" aria-label="从上传列表移除" :disabled="busy" @click="removeEntry(entry.id)"><X :size="15" /></button>
      </div>
    </div>
    <p v-if="busy" class="progress-note">正在上传 {{ completed + 1 }} / {{ entries.length }}，请保持页面打开…</p>
    <p v-if="error" class="upload-error" role="alert">{{ error }}</p>
    <button class="btn btn-primary" :disabled="busy || !entries.length">
      <Upload :size="16" /> {{ busy ? `已完成 ${completed} / ${entries.length}` : `上传 ${entries.length || ''} 份检查` }}
    </button>
  </form>
</template>

<style scoped>
.multi-upload{display:grid;gap:13px;padding:18px}.upload-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.upload-heading h3{margin:0 0 5px;font-size:15px}.upload-heading p{margin:0;color:var(--text-muted);font-size:11px;line-height:1.5}.upload-heading>svg{color:var(--accent)}.upload-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.upload-options .label{display:grid;gap:6px;margin:0}.file-picker{display:flex;min-height:92px;align-items:center;justify-content:center;gap:10px;border:1px dashed var(--border-strong);border-radius:8px;background:var(--surface-2);color:var(--accent-strong);font-size:12px;font-weight:650;cursor:pointer;transition:border-color 150ms ease,background 150ms ease,box-shadow 150ms ease}.file-picker>span{display:grid;gap:4px}.file-picker small{color:var(--text-muted);font-size:10px;font-weight:500}.file-picker:hover,.file-picker.dragging{border-color:var(--accent);background:var(--accent-soft);box-shadow:0 0 0 4px rgb(47 143 146 / 10%)}.file-picker.disabled{cursor:default;opacity:.6}.file-picker input{position:absolute;width:1px;height:1px;overflow:hidden;opacity:0}.file-count{margin:0;color:var(--accent-strong);font-size:11px;font-weight:650}.upload-queue{display:grid;gap:7px;max-height:260px;overflow:auto}.upload-row{display:grid;grid-template-columns:minmax(0,1fr) auto 28px;align-items:center;gap:10px;padding:9px;border:1px solid var(--border);border-radius:7px;background:var(--surface)}.upload-row>div{display:grid;min-width:0;gap:3px}.upload-row strong{overflow:hidden;text-overflow:ellipsis;font-size:11px;white-space:nowrap}.upload-row small{color:var(--text-muted);font-size:9px}.upload-row label{display:flex;align-items:center;gap:5px;color:var(--text-muted);font-size:9px}.upload-row label span{display:none}.upload-row input{width:126px;padding:5px;border:1px solid var(--border);border-radius:5px;background:var(--surface);color:var(--text);font-size:10px}.upload-row>button{display:grid;width:28px;height:28px;place-items:center;border:0;background:transparent;color:var(--text-muted)}.upload-row>button:hover{color:var(--red)}.preview-note,.progress-note,.upload-error{margin:0;font-size:11px;line-height:1.5}.preview-note{color:#8a682d}.progress-note{color:var(--accent-strong)}.upload-error{color:var(--red)}@media(max-width:520px){.upload-options{grid-template-columns:1fr}.upload-row{grid-template-columns:1fr 28px}.upload-row label{grid-column:1}.upload-row>button{grid-column:2;grid-row:1}}
</style>
