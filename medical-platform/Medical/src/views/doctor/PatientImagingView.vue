<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { Upload, ScanLine, Box } from 'lucide-vue-next'
import { usePatientStore } from '@/stores/patients'
import RemoteSliceViewer from '@/components/medical/RemoteSliceViewer.vue'
import { api } from '@/api/client'
import { organNames } from '@/api/mappers'
const route = useRoute(), store = usePatientStore()
const patientId = computed(() => String(route.params.id))
const selected = ref(String(route.query.exam || ''))
const active = computed(() => store.examinations.find(i => i.id === selected.value) || store.examinations[0])
const file = ref<File | null>(null), organ = ref('lung'), imageType = ref('CT'), busy = ref(false), error = ref('')
const task = ref<{ task_id: string; status: string; progress?: number; error_message?: string; result?: { model_id:string } } | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined, disposed = false
function selectFile(event: Event) { file.value = (event.target as HTMLInputElement).files?.[0] || null }
async function upload() {
  if (!file.value || busy.value) return
  busy.value = true; error.value = ''
  const form = new FormData(); form.append('file',file.value); form.append('organ_id',organ.value); form.append('image_type',imageType.value)
  try {
    const image = await api<{ image_id: string }>('/patients/' + patientId.value + '/medical-images', { method:'POST', body:form })
    await store.loadPatientContext(patientId.value); selected.value = image.image_id; file.value = null
  } catch (reason) { error.value = reason instanceof Error ? reason.message : '上传失败' }
  finally { busy.value = false }
}
async function poll() {
  if (!task.value || disposed) return
  const expectedTask = task.value.task_id
  try {
    const updated = await api<NonNullable<typeof task.value>>('/segmentation/tasks/' + expectedTask)
    if (disposed || task.value?.task_id !== expectedTask) return
    task.value = updated
    if (task.value.status === 'failed') error.value = task.value.error_message || '分割失败'
    if (['queued','running'].includes(task.value.status) && !disposed) timer = setTimeout(poll,1500)
  } catch (reason) { error.value = reason instanceof Error ? reason.message : '查询任务失败' }
}
async function segment() {
  if (!active.value) return
  busy.value = true; error.value = ''; task.value = null
  try {
    task.value = await api('/medical-images/' + active.value.id + '/segmentation', { method:'POST', body:JSON.stringify({ organ_id:active.value.organId }) })
    await poll()
  } catch (reason) { error.value = reason instanceof Error ? reason.message : '分割失败' }
  finally { busy.value = false }
}
onBeforeUnmount(() => { disposed=true; if(timer) clearTimeout(timer) })
</script>
<template>
  <div class="imaging-layout">
    <section>
      <RemoteSliceViewer v-if="active" :key="active.id" :examination="active" />
      <div v-else class="card empty-state">No medical images uploaded yet.</div>
      <p v-if="error" class="integration-error" role="alert">{{ error }}</p>
      <div v-if="active" class="card task-card">
        <div><h3>Organ segmentation</h3><p class="muted">Create a background task using the configured model.</p></div>
        <button class="btn btn-primary" :disabled="busy || ['queued','running'].includes(task?.status || '')" @click="segment"><ScanLine :size="16" /> Start segmentation</button>
        <p v-if="task">Task: {{ task.status }} · {{ task.progress || 0 }}%</p>
        <RouterLink v-if="task?.status === 'completed'" class="btn btn-secondary" :to="'/doctor/patients/' + patientId + '/3d'"><Box :size="16" /> View 3D result</RouterLink>
      </div>
    </section>
    <aside class="stack">
      <section class="card">
        <div class="card-header"><h3>Imaging studies</h3><span class="muted">{{ store.examinations.length }}</span></div>
        <div class="study-list">
          <button v-for="image in store.examinations" :key="image.id" class="study-item" :class="{ active:image.id === active?.id }" @click="selected=image.id; task=null">
            <strong>{{ image.type }} · {{ image.organ }}</strong><span>{{ image.date }} · {{ image.sliceCount }} slices</span>
          </button>
        </div>
      </section>
      <form class="card upload-card" @submit.prevent="upload">
        <h3>Upload medical image</h3>
        <label class="label">Organ<select v-model="organ" class="select"><option v-for="(name,id) in organNames" :key="id" :value="id">{{ name }}</option></select></label>
        <label class="label">Modality<select v-model="imageType" class="select"><option>CT</option><option>MRI</option></select></label>
        <input type="file" accept=".nii,.nii.gz" aria-label="NIfTI image file" @change="selectFile" />
        <p class="muted">3D NIfTI (.nii / .nii.gz). Convert DICOM series before uploading.</p>
        <button class="btn btn-primary" :disabled="busy || !file"><Upload :size="16" /> {{ busy ? 'Processing…' : 'Upload image' }}</button>
      </form>
    </aside>
  </div>
</template>
<style scoped>
.imaging-layout{display:grid;grid-template-columns:minmax(0,1fr) 310px;gap:18px;align-items:start}
.task-card{margin-top:16px;padding:18px;display:flex;flex-wrap:wrap;align-items:center;gap:14px}.task-card>div{flex:1}
.study-list{padding:8px}.study-item{width:100%;display:grid;text-align:left;gap:5px;padding:13px;border:1px solid transparent;background:transparent;border-radius:6px;color:var(--text)}.study-item span{font-size:11px;color:var(--text-muted)}.study-item.active{background:#e7f3f2;border-color:#b9d9d5}
.upload-card{padding:18px;display:grid;gap:14px}.upload-card .label{display:grid;gap:7px}.upload-card input{max-width:100%}.upload-card p{font-size:11px}.integration-error{padding:14px;background:#fbeded;color:#a24e50;border-radius:8px}
@media(max-width:1050px){.imaging-layout{grid-template-columns:1fr}}
</style>
