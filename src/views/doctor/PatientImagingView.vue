<script setup lang="ts">
import { useWorkflowStore } from '@/stores/workflow'
import { computed, ref, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ScanLine, Box, CheckCircle2, RotateCcw, Sparkles, Columns2 } from 'lucide-vue-next'
import { usePatientStore } from '@/stores/patients'
import RemoteSliceViewer from '@/components/medical/RemoteSliceViewer.vue'
import UploadedStudyViewer from '@/components/medical/UploadedStudyViewer.vue'
import StudyComparisonViewer from '@/components/medical/StudyComparisonViewer.vue'
import MultiStudyUpload from '@/components/medical/MultiStudyUpload.vue'
import { api } from '@/api/client'
import { analysisApi, type AnalysisStatus, type AnalysisTask } from '@/api/analysis'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { localPreview } from '@/utils/runtime'
import type { Examination } from '@/types'
import { isLocalUpload } from '@/api/localUploads'
const route = useRoute(), store = usePatientStore(), workflow = useWorkflowStore()
const reviewBusy = ref(false)
const patientId = computed(() => String(route.params.id))
const selected = ref(String(route.query.exam || ''))
const viewerMode = ref<'compare' | 'mpr'>('compare')
const active = computed(() => store.examinations.find(i => i.id === selected.value) || store.examinations[0])
const isLocalActive = computed(() => isLocalUpload(active.value))
const activeFindings = computed(() => store.findings.filter(item => item.examinationId === active.value?.id))
watch(() => route.query.exam, value => { selected.value = String(value || '') })
const reviewItem = computed(() => workflow.items.find(i => i.image_id === active.value?.id))
const reviewed = computed(() => reviewItem.value ? !!reviewItem.value.completed_at : active.value?.status !== 'Pending Review')
async function review() {
  if (!active.value || reviewBusy.value) return
  reviewBusy.value = true; error.value = ''
  try {
    const completed = !reviewed.value
    await workflow.complete(active.value.id, completed)
    store.updateExaminationReview(active.value.id, completed)
  }
  catch (e) { error.value = e instanceof Error ? e.message : '确认失败' }
  finally { reviewBusy.value = false }
}
const busy = ref(false), error = ref('')
const segmentationTask = ref<{ task_id: string; status: string; progress?: number; error_message?: string; result?: { model_id:string } } | null>(null)
const analysisStatus = ref<AnalysisStatus | null>(null)
const analysisTask = ref<AnalysisTask | null>(null)
const analysisBusy = ref(false)
let segmentationTimer: ReturnType<typeof setTimeout> | undefined
let analysisTimer: ReturnType<typeof setTimeout> | undefined
let disposed = false
async function poll() {
  if (!segmentationTask.value || disposed) return
  const expectedTask = segmentationTask.value.task_id
  try {
    const updated = await api<NonNullable<typeof segmentationTask.value>>('/segmentation/tasks/' + expectedTask)
    if (disposed || segmentationTask.value?.task_id !== expectedTask) return
    segmentationTask.value = updated
    if (segmentationTask.value.status === 'failed') error.value = segmentationTask.value.error_message || '分割失败'
    if (['queued','running'].includes(segmentationTask.value.status) && !disposed) segmentationTimer = setTimeout(poll,1500)
  } catch (reason) { error.value = reason instanceof Error ? reason.message : '查询任务失败' }
}
async function segment() {
  if (!active.value) return
  busy.value = true; error.value = ''; segmentationTask.value = null
  try {
    segmentationTask.value = await api('/medical-images/' + active.value.id + '/segmentation', { method:'POST', body:JSON.stringify({ organ_id:active.value.organId }) })
    await poll()
  } catch (reason) { error.value = reason instanceof Error ? reason.message : '分割失败' }
  finally { busy.value = false }
}
async function loadAnalysisStatus() {
  if (localPreview) return
  try { analysisStatus.value = await analysisApi.getStatus() }
  catch (reason) { error.value = reason instanceof Error ? reason.message : '读取模型状态失败' }
}
async function pollAnalysis() {
  if (!analysisTask.value || disposed) return
  const expectedTask = analysisTask.value.task_id
  try {
    const updated = await analysisApi.getTask(expectedTask)
    if (disposed || analysisTask.value?.task_id !== expectedTask) return
    analysisTask.value = updated
    if (updated.status === 'completed') await store.loadPatientContext(patientId.value)
    else if (updated.status === 'failed') error.value = updated.error_message || '肺结节检测失败'
    else if (!disposed) analysisTimer = setTimeout(pollAnalysis, 1500)
  } catch (reason) { error.value = reason instanceof Error ? reason.message : '查询检测任务失败' }
}
async function analyzeLungNodules() {
  if (!active.value || localPreview || analysisBusy.value) return
  analysisBusy.value = true; error.value = ''; analysisTask.value = null
  try {
    analysisTask.value = await analysisApi.create(active.value.id)
    await pollAnalysis()
  } catch (reason) { error.value = reason instanceof Error ? reason.message : '肺结节检测启动失败' }
  finally { analysisBusy.value = false }
}
function selectStudy(id: string) {
  const changed = selected.value !== id
  selected.value = id
  const examination = store.examinations.find(item => item.id === id)
  if (examination && !isLocalUpload(examination) && examination.type !== 'CT') viewerMode.value = 'mpr'
  if (changed) {
    segmentationTask.value = null
    analysisTask.value = null
    error.value = ''
  }
}
function setViewerMode(mode: 'compare' | 'mpr') {
  viewerMode.value = mode
  if (mode === 'compare' && active.value?.type !== 'CT') {
    const firstCt = store.examinations.find(item => item.type === 'CT' && !isLocalUpload(item))
    if (firstCt) selectStudy(firstCt.id)
  }
}
async function handleUploaded(studies: Examination[]) {
  await store.loadPatientContext(patientId.value)
  const latest = studies.at(-1)
  if (latest) selected.value = latest.id
  viewerMode.value = 'mpr'
  await Promise.all([workflow.load(), store.loadPatients()])
}
onBeforeUnmount(() => {
  disposed = true
  if (segmentationTimer) clearTimeout(segmentationTimer)
  if (analysisTimer) clearTimeout(analysisTimer)
})
onMounted(() => { workflow.load(); loadAnalysisStatus() })
</script>
<template>
  <div class="imaging-layout">
    <section>
      <div v-if="active" class="card review-bar" :class="{complete:reviewed}">
        <div class="review-copy">
          <span class="review-kicker">IMAGING REVIEW</span>
          <div class="review-title"><h2>{{ active.type }} · {{ active.organ }}</h2><StatusBadge :status="reviewed ? 'Reviewed' : 'Pending Review'" /></div>
          <p>{{ active.date }} · {{ active.sliceCount }} slices · {{ reviewed ? '该影像已完成审核，可重新打开。' : '请浏览影像并核对 AI Findings，完成后确认审核。' }}</p>
        </div>
        <div class="review-actions">
          <RouterLink class="btn btn-secondary" :to="{name:'doctor-patient-ai',params:{id:patientId},query:{exam:active.id}}"><Sparkles :size="16" /> 查看 AI Findings</RouterLink>
          <button class="btn" :class="reviewed ? 'btn-secondary' : 'btn-primary'" :disabled="reviewBusy" @click="review">
            <RotateCcw v-if="reviewed" :size="16" /><CheckCircle2 v-else :size="16" />
            {{ reviewBusy ? '处理中…' : reviewed ? '重新打开审核' : '确认审核完成' }}
          </button>
        </div>
      </div>
      <div v-if="active && !isLocalActive" class="viewer-mode-bar card">
        <div><strong>影像显示</strong><span>多期 CT 可选择单屏、二分屏或四分屏比较</span></div>
        <div>
          <button class="btn btn-sm" :class="viewerMode === 'compare' ? 'btn-primary' : 'btn-secondary'" @click="setViewerMode('compare')"><Columns2 :size="15" /> 同屏比较</button>
          <button class="btn btn-sm" :class="viewerMode === 'mpr' ? 'btn-primary' : 'btn-secondary'" @click="setViewerMode('mpr')"><ScanLine :size="15" /> MPR 三平面</button>
          <RouterLink
            v-if="active && active.type === 'CT'"
            class="btn btn-sm btn-secondary"
            :to="{ path: '/viewer/study/' + patientId, query: { image: active.id } }"
            target="_blank"
          >
            <Box :size="15" /> 3D 全景重构
          </RouterLink>
        </div>
      </div>
      <UploadedStudyViewer v-if="active && isLocalActive" :key="active.id" :examination="active" />
      <StudyComparisonViewer
        v-else-if="active && viewerMode === 'compare'"
        :examinations="store.examinations"
        :findings="store.findings"
        :initial-id="active.id"
        @select-study="selectStudy"
      />
      <RemoteSliceViewer
        v-else-if="active"
        :key="active.id"
        :examination="active"
        :findings="activeFindings"
      />
      <div v-else class="card empty-state">No medical images uploaded yet.</div>
      <p v-if="error" class="integration-error" role="alert">{{ error }}</p>
      <div v-if="active" class="task-grid">
        <div class="card task-card">
          <div><h3>Organ segmentation</h3><p class="muted">{{ isLocalActive ? '本地影像可直接阅片；分割需先通过后端模式上传。' : 'CT 使用已配置的模型分割；MRI 当前支持浏览。' }}</p></div>
          <button class="btn btn-primary" :disabled="isLocalActive || active.type !== 'CT' || ['eye','other'].includes(active.organId || '') || busy || ['queued','running'].includes(segmentationTask?.status || '')" @click="segment"><ScanLine :size="16" /> {{ isLocalActive ? '后端上传后可分割' : 'Start segmentation' }}</button>
          <p v-if="segmentationTask">Task: {{ segmentationTask.status }} · {{ segmentationTask.progress || 0 }}%</p>
          <RouterLink v-if="segmentationTask?.status === 'completed'" class="btn btn-secondary" :to="'/doctor/patients/' + patientId + '/3d'"><Box :size="16" /> View 3D result</RouterLink>
        </div>
        <div class="card task-card analysis-card">
          <div>
            <h3><Sparkles :size="17" /> 肺结节候选检测</h3>
            <p v-if="localPreview" class="muted">当前为合成数据预览；真实模型任务需启动后端模式。</p>
            <p v-else-if="analysisStatus?.configured" class="muted">{{ analysisStatus.model_name }} · 输出候选框，需医生审核。</p>
            <p v-else class="muted">模型接口已就绪，等待配置模型服务地址。</p>
          </div>
          <button
            class="btn btn-primary"
            :disabled="localPreview || !analysisStatus?.configured || active.type !== 'CT' || active.organId !== 'lung' || analysisBusy || ['queued','running'].includes(analysisTask?.status || '')"
            @click="analyzeLungNodules"
          ><Sparkles :size="16" /> {{ analysisBusy ? '正在启动…' : '开始肺结节检测' }}</button>
          <p v-if="analysisTask">任务：{{ analysisTask.status }} · {{ analysisTask.progress || 0 }}%</p>
          <p v-else-if="activeFindings.length" class="finding-summary">当前影像有 {{ activeFindings.length }} 个候选 finding</p>
          <RouterLink
            v-if="analysisTask?.status === 'completed' || activeFindings.length"
            class="btn btn-secondary"
            :to="{name:'doctor-patient-ai',params:{id:patientId},query:{exam:active.id}}"
          >查看并审核 {{ analysisTask?.result?.findings_count ?? activeFindings.length }} 个结果</RouterLink>
        </div>
      </div>
    </section>
    <aside class="stack">
      <section class="card">
        <div class="card-header"><h3>Imaging studies</h3><span class="muted">{{ store.examinations.length }}</span></div>
        <div class="study-list">
          <button v-for="image in store.examinations" :key="image.id" class="study-item" :class="{ active:image.id === active?.id }" @click="selectStudy(image.id)">
            <strong>{{ image.type }} · {{ image.organ }}<em v-if="isLocalUpload(image)">本地</em></strong><span>{{ image.date }} · {{ image.sliceCount }} slices</span>
          </button>
        </div>
      </section>
      <MultiStudyUpload class="card" :patient-id="patientId" @complete="handleUploaded" />
    </aside>
  </div>
</template>
<style scoped>
.imaging-layout{display:grid;grid-template-columns:minmax(0,1fr) 310px;gap:18px;align-items:start}
.review-bar{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:16px;padding:18px 20px;border-left:4px solid var(--amber);background:linear-gradient(100deg,#fffaf1 0%,#fff 72%)}.review-bar.complete{border-left-color:var(--green);background:linear-gradient(100deg,#f1f8f4 0%,#fff 72%)}.review-copy{min-width:0}.review-kicker{display:block;margin-bottom:5px;color:var(--amber);font-size:10px;font-weight:750;letter-spacing:.14em}.review-bar.complete .review-kicker{color:var(--green)}.review-title{display:flex;align-items:center;gap:10px}.review-title h2{margin:0;font-size:18px}.review-copy p{margin:7px 0 0;color:var(--text-muted);font-size:12px}.review-actions{display:flex;flex:0 0 auto;gap:9px}
.viewer-mode-bar{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:10px;padding:12px 14px}.viewer-mode-bar>div{display:flex;align-items:center;gap:9px}.viewer-mode-bar span{color:var(--text-muted);font-size:10px}.viewer-mode-bar .btn{min-height:32px}
.task-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:16px}.task-card{padding:18px;display:flex;flex-wrap:wrap;align-items:center;gap:14px}.task-card>div{flex:1;min-width:210px}.task-card h3{display:flex;align-items:center;gap:7px}.analysis-card{border-color:#b9d9d5;background:linear-gradient(130deg,#f1f8f7,#fff 70%)}.finding-summary{color:var(--accent-strong);font-weight:650}
.study-list{padding:8px}.study-item{width:100%;display:grid;text-align:left;gap:5px;padding:13px;border:1px solid transparent;background:transparent;border-radius:6px;color:var(--text)}.study-item span{font-size:11px;color:var(--text-muted)}.study-item.active{background:#e7f3f2;border-color:#b9d9d5}
.study-item em{display:inline-block;margin-left:4px;padding:2px 5px;border-radius:4px;background:#dcefed;color:var(--accent-strong);font-size:8px;font-style:normal;vertical-align:1px}
.integration-error{padding:14px;background:#fbeded;color:#a24e50;border-radius:8px}
@media(max-width:1050px){.imaging-layout{grid-template-columns:1fr}}@media(max-width:760px){.review-bar,.review-actions,.viewer-mode-bar,.viewer-mode-bar>div{align-items:stretch;flex-direction:column}.review-actions .btn{width:100%}.task-grid{grid-template-columns:1fr}}
</style>
