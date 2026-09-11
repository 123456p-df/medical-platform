<script setup lang="ts">
import { useWorkflowStore } from '@/stores/workflow'
import { computed, ref, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ScanLine, Box, CheckCircle2, RotateCcw, Sparkles, Columns2 } from 'lucide-vue-next'
import { usePatientStore } from '@/stores/patients'
import RemoteSliceViewer from '@/components/medical/RemoteSliceViewer.vue'
import StudyComparisonViewer from '@/components/medical/StudyComparisonViewer.vue'
import MultiStudyUpload from '@/components/medical/MultiStudyUpload.vue'
import { api } from '@/api/client'
import { analysisApi, type AnalysisStatus, type AnalysisTask } from '@/api/analysis'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { localPreview } from '@/utils/runtime'
import { t } from '@/i18n'
import type { Examination } from '@/types'
const route = useRoute(), store = usePatientStore(), workflow = useWorkflowStore()
const reviewBusy = ref(false)
const patientId = computed(() => String(route.params.id))
const selected = ref(String(route.query.exam || ''))
const viewerMode = ref<'compare' | 'mpr'>('compare')
const active = computed(() => store.examinations.find(i => i.id === selected.value) || store.examinations[0])
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
  catch (e) { error.value = e instanceof Error ? e.message : t('Review confirmation failed.') }
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
    if (segmentationTask.value.status === 'failed') error.value = segmentationTask.value.error_message || t('Segmentation failed.')
    if (['queued','running'].includes(segmentationTask.value.status) && !disposed) segmentationTimer = setTimeout(poll,1500)
  } catch (reason) { error.value = reason instanceof Error ? reason.message : t('Task lookup failed.') }
}
async function segment() {
  if (!active.value) return
  busy.value = true; error.value = ''; segmentationTask.value = null
  try {
    segmentationTask.value = await api('/medical-images/' + active.value.id + '/segmentation', { method:'POST', body:JSON.stringify({ organ_id:active.value.organId }) })
    await poll()
  } catch (reason) { error.value = reason instanceof Error ? reason.message : t('Segmentation failed.') }
  finally { busy.value = false }
}
async function loadAnalysisStatus() {
  if (localPreview) return
  try { analysisStatus.value = await analysisApi.getStatus() }
  catch (reason) { error.value = reason instanceof Error ? reason.message : t('Model status could not be read.') }
}
async function pollAnalysis() {
  if (!analysisTask.value || disposed) return
  const expectedTask = analysisTask.value.task_id
  try {
    const updated = await analysisApi.getTask(expectedTask)
    if (disposed || analysisTask.value?.task_id !== expectedTask) return
    analysisTask.value = updated
    if (updated.status === 'completed') await store.loadPatientContext(patientId.value)
    else if (updated.status === 'failed') error.value = updated.error_message || t('Lung nodule detection failed.')
    else if (!disposed) analysisTimer = setTimeout(pollAnalysis, 1500)
  } catch (reason) { error.value = reason instanceof Error ? reason.message : t('Detection task lookup failed.') }
}
async function analyzeLungNodules() {
  if (!active.value || localPreview || analysisBusy.value) return
  analysisBusy.value = true; error.value = ''; analysisTask.value = null
  try {
    analysisTask.value = await analysisApi.create(active.value.id)
    await pollAnalysis()
  } catch (reason) { error.value = reason instanceof Error ? reason.message : t('Lung nodule detection could not start.') }
  finally { analysisBusy.value = false }
}
function selectStudy(id: string) {
  const changed = selected.value !== id
  selected.value = id
  if (store.examinations.find(item => item.id === id)?.type !== 'CT') viewerMode.value = 'mpr'
  if (changed) {
    segmentationTask.value = null
    analysisTask.value = null
    error.value = ''
  }
}
function setViewerMode(mode: 'compare' | 'mpr') {
  viewerMode.value = mode
  if (mode === 'compare' && active.value?.type !== 'CT') {
    const firstCt = store.examinations.find(item => item.type === 'CT')
    if (firstCt) selectStudy(firstCt.id)
  }
}
async function handleUploaded(studies: Examination[]) {
  await store.loadPatientContext(patientId.value)
  const latest = studies.at(-1)
  if (latest) selected.value = latest.id
  viewerMode.value = 'compare'
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
          <span class="review-kicker">{{ $t('Imaging review') }}</span>
          <div class="review-title"><h2>{{ active.type }} · {{ active.organ }}</h2><StatusBadge :status="reviewed ? 'Reviewed' : 'Pending Review'" /></div>
          <p>{{ active.date }} · {{ active.sliceCount }} {{ $t('slices') }} · {{ reviewed ? $t('This image has been reviewed and can be reopened.') : $t('Review the image and AI findings, then confirm completion.') }}</p>
        </div>
        <div class="review-actions">
          <RouterLink class="btn btn-secondary" :to="{name:'doctor-patient-ai',params:{id:patientId},query:{exam:active.id}}"><Sparkles :size="16" /> {{ $t('View AI findings') }}</RouterLink>
          <button class="btn" :class="reviewed ? 'btn-secondary' : 'btn-primary'" :disabled="reviewBusy" @click="review">
            <RotateCcw v-if="reviewed" :size="16" /><CheckCircle2 v-else :size="16" />
            {{ reviewBusy ? $t('Processing…') : reviewed ? $t('Reopen review') : $t('Confirm review') }}
          </button>
        </div>
      </div>
      <div v-if="active" class="viewer-mode-bar card">
        <div><strong>{{ $t('Imaging display') }}</strong><span>{{ $t('Compare multiple CT studies in one, two, or four panes.') }}</span></div>
        <div>
          <button class="btn btn-sm" :class="viewerMode === 'compare' ? 'btn-primary' : 'btn-secondary'" @click="setViewerMode('compare')"><Columns2 :size="15" /> {{ $t('Side-by-side comparison') }}</button>
          <button class="btn btn-sm" :class="viewerMode === 'mpr' ? 'btn-primary' : 'btn-secondary'" @click="setViewerMode('mpr')"><ScanLine :size="15" /> {{ $t('MPR three-plane') }}</button>
          <RouterLink
            v-if="active && active.type === 'CT'"
            class="btn btn-sm btn-secondary"
            :to="{ path: '/viewer/study/' + patientId, query: { image: active.id } }"
            target="_blank"
          >
            <Box :size="15" /> {{ $t('3D panoramic reconstruction') }}
          </RouterLink>
        </div>
      </div>
      <StudyComparisonViewer
        v-if="active && viewerMode === 'compare'"
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
          <div><h3>{{ $t('Organ segmentation') }}</h3><p class="muted">{{ $t('CT uses the configured segmentation model; MRI currently supports viewing.') }}</p></div>
          <button class="btn btn-primary" :disabled="active.type !== 'CT' || ['eye','other'].includes(active.organId || '') || busy || ['queued','running'].includes(segmentationTask?.status || '')" @click="segment"><ScanLine :size="16" /> {{ $t('Start segmentation') }}</button>
          <p v-if="segmentationTask">{{ $t('Task: {status} · {progress}%', { status: segmentationTask.status, progress: segmentationTask.progress || 0 }) }}</p>
          <RouterLink v-if="segmentationTask?.status === 'completed'" class="btn btn-secondary" :to="'/doctor/patients/' + patientId + '/3d'"><Box :size="16" /> {{ $t('View 3D result') }}</RouterLink>
        </div>
        <div class="card task-card analysis-card">
          <div>
            <h3><Sparkles :size="17" /> {{ $t('Lung nodule candidate detection') }}</h3>
            <p v-if="localPreview" class="muted">{{ $t('This is synthetic preview data; start backend mode for real model tasks.') }}</p>
            <p v-else-if="analysisStatus?.configured" class="muted">{{ $t('{model} · Candidate boxes require physician review.', { model: analysisStatus.model_name }) }}</p>
            <p v-else class="muted">{{ $t('The model interface is ready and waiting for a model service URL.') }}</p>
          </div>
          <button
            class="btn btn-primary"
            :disabled="localPreview || !analysisStatus?.configured || active.type !== 'CT' || active.organId !== 'lung' || analysisBusy || ['queued','running'].includes(analysisTask?.status || '')"
            @click="analyzeLungNodules"
          ><Sparkles :size="16" /> {{ analysisBusy ? $t('Starting…') : $t('Start lung nodule detection') }}</button>
          <p v-if="analysisTask">{{ $t('Task: {status} · {progress}%', { status: analysisTask.status, progress: analysisTask.progress || 0 }) }}</p>
          <p v-else-if="activeFindings.length" class="finding-summary">{{ $t('This image has {count} candidate findings', { count: activeFindings.length }) }}</p>
          <RouterLink
            v-if="analysisTask?.status === 'completed' || activeFindings.length"
            class="btn btn-secondary"
            :to="{name:'doctor-patient-ai',params:{id:patientId},query:{exam:active.id}}"
          >{{ $t('Review {count} results', { count: analysisTask?.result?.findings_count ?? activeFindings.length }) }}</RouterLink>
        </div>
      </div>
    </section>
    <aside class="stack">
      <section class="card">
        <div class="card-header"><h3>{{ $t('Imaging studies') }}</h3><span class="muted">{{ store.examinations.length }}</span></div>
        <div class="study-list">
          <button v-for="image in store.examinations" :key="image.id" class="study-item" :class="{ active:image.id === active?.id }" @click="selectStudy(image.id)">
            <strong>{{ image.type }} · {{ image.organ }}</strong><span>{{ image.date }} · {{ image.sliceCount }} {{ $t('slices') }}</span>
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
.integration-error{padding:14px;background:#fbeded;color:#a24e50;border-radius:8px}
@media(max-width:1050px){.imaging-layout{grid-template-columns:1fr}}@media(max-width:760px){.review-bar,.review-actions,.viewer-mode-bar,.viewer-mode-bar>div{align-items:stretch;flex-direction:column}.review-actions .btn{width:100%}.task-grid{grid-template-columns:1fr}}
</style>
