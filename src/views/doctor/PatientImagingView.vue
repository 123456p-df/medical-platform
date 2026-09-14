<script setup lang="ts">
import { useWorkflowStore } from '@/stores/workflow'
import { computed, ref, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ScanLine, Box, CheckCircle2, RotateCcw, Sparkles, Columns2 } from 'lucide-vue-next'
import { usePatientStore } from '@/stores/patients'
import RemoteSliceViewer from '@/components/medical/RemoteSliceViewer.vue'
import UploadedStudyViewer from '@/components/medical/UploadedStudyViewer.vue'
import StudyComparisonViewer from '@/components/medical/StudyComparisonViewer.vue'
import MultiStudyUpload from '@/components/medical/MultiStudyUpload.vue'
import { api } from '@/api/client'
import { analysisApi, type AnalysisStatus, type AnalysisTask } from '@/api/analysis'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import { localPreview } from '@/utils/runtime'
import type { Examination } from '@/types'
import { isLocalUpload } from '@/api/localStudyRepository'
import { capabilityForStudy } from '@/utils/capabilities'
import { useAuthStore } from '@/stores/auth'
import { t } from '@/i18n'
const route = useRoute(), router = useRouter(), store = usePatientStore(), workflow = useWorkflowStore(), auth = useAuthStore()
const reviewBusy = ref(false)
const patientId = computed(() => String(route.params.id))
const selected = ref(String(route.query.exam || ''))
const viewerMode = ref<'compare' | 'mpr'>('compare')
const active = computed(() => store.examinations.find(i => i.id === selected.value) || store.examinations[0])
watch(() => active.value?.id, () => {
  if (active.value && active.value.type !== 'CT') viewerMode.value = 'mpr'
}, { immediate: true })
const capabilities = computed(() => capabilityForStudy(active.value, auth.portal))
const isLocalActive = computed(() => isLocalUpload(active.value))
const activeFindings = computed(() => store.findings.filter(item => item.examinationId === active.value?.id))
watch(() => route.query.exam, value => { selected.value = String(value || '') })
const reviewItem = computed(() => workflow.items.find(i => i.image_id === active.value?.id))
const reviewed = computed(() => reviewItem.value
  ? Boolean(reviewItem.value.completed_at)
  : ['Reviewed', 'Completed'].includes(active.value?.status || 'Unknown'))
async function review() {
  if (!active.value || reviewBusy.value) return
  reviewBusy.value = true; error.value = ''
  try {
    const completed = !reviewed.value
    await workflow.complete(active.value.id, completed)
  }
  catch (e) { error.value = e instanceof Error ? e.message : t('ui.imaging.reviewFailed') }
  finally { reviewBusy.value = false }
}
const busy = ref(false), error = ref('')
type SegmentationTask = { task_id: string; status: string; progress?: number; error_message?: string; result?: { model_id:string } }
type PersistedTasks = Record<string, { segmentation: SegmentationTask | null; analysis: AnalysisTask | null }>
const segmentationTask = ref<SegmentationTask | null>(null)
const analysisStatus = ref<AnalysisStatus | null>(null)
const analysisTask = ref<AnalysisTask | null>(null)
const analysisBusy = ref(false)
let segmentationTimer: ReturnType<typeof setTimeout> | undefined
let analysisTimer: ReturnType<typeof setTimeout> | undefined
let disposed = false
const taskStorageKey = computed(() => `pulmolink-ai-tasks-v1:${auth.session?.role || 'unknown'}:${auth.session?.id || 'unknown'}`)

function readPersistedTasks(): PersistedTasks {
  try { return JSON.parse(localStorage.getItem(taskStorageKey.value) || '{}') }
  catch { return {} }
}

function persistTasks() {
  if (!active.value) return
  const tasks = readPersistedTasks()
  tasks[active.value.id] = { segmentation: segmentationTask.value, analysis: analysisTask.value }
  localStorage.setItem(taskStorageKey.value, JSON.stringify(tasks))
}

function restoreTasks() {
  if (segmentationTimer) clearTimeout(segmentationTimer)
  if (analysisTimer) clearTimeout(analysisTimer)
  const saved = active.value ? readPersistedTasks()[active.value.id] : undefined
  segmentationTask.value = saved?.segmentation || null
  analysisTask.value = saved?.analysis || null
  if (['queued', 'running'].includes(segmentationTask.value?.status || '')) void poll()
  if (['queued', 'running'].includes(analysisTask.value?.status || '')) void pollAnalysis()
}

watch([segmentationTask, analysisTask], persistTasks, { deep: true })
watch(() => active.value?.id, restoreTasks, { immediate: true })

async function poll() {
  if (!segmentationTask.value || disposed) return
  const expectedTask = segmentationTask.value.task_id
  try {
    const updated = await api<NonNullable<typeof segmentationTask.value>>('/segmentation/tasks/' + expectedTask)
    if (disposed || segmentationTask.value?.task_id !== expectedTask) return
    segmentationTask.value = updated
    if (segmentationTask.value.status === 'failed') error.value = segmentationTask.value.error_message || t('ui.imaging.segmentationFailed')
    if (['queued','running'].includes(segmentationTask.value.status) && !disposed) segmentationTimer = setTimeout(poll,1500)
  } catch {
    if (!disposed && segmentationTask.value?.task_id === expectedTask) {
      error.value = t('ui.imaging.segmentationReconnecting')
      segmentationTimer = setTimeout(poll, 5000)
    }
  }
}
async function segment() {
  if (!active.value || !capabilities.value.segmentation.enabled) {
    error.value = capabilities.value.segmentation.reason
    return
  }
  busy.value = true; error.value = ''; segmentationTask.value = null
  try {
    segmentationTask.value = await api('/medical-images/' + active.value.id + '/segmentation', { method:'POST', body:JSON.stringify({ organ_id:active.value.organId }) })
    await poll()
  } catch (reason) { error.value = reason instanceof Error ? reason.message : t('ui.imaging.segmentationFailed') }
  finally { busy.value = false }
}
async function loadAnalysisStatus() {
  if (localPreview) return
  try { analysisStatus.value = await analysisApi.getStatus() }
  catch (reason) { error.value = reason instanceof Error ? reason.message : t('ui.imaging.modelStatusFailed') }
}
async function pollAnalysis() {
  if (!analysisTask.value || disposed) return
  const expectedTask = analysisTask.value.task_id
  try {
    const updated = await analysisApi.getTask(expectedTask)
    if (disposed || analysisTask.value?.task_id !== expectedTask) return
    analysisTask.value = updated
    if (updated.status === 'completed') await store.loadPatientContext(patientId.value)
    else if (updated.status === 'failed') error.value = updated.error_message || t('ui.imaging.detectionFailed')
    else if (!disposed) analysisTimer = setTimeout(pollAnalysis, 1500)
  } catch {
    if (!disposed && analysisTask.value?.task_id === expectedTask) {
      error.value = t('ui.imaging.detectionReconnecting')
      analysisTimer = setTimeout(pollAnalysis, 5000)
    }
  }
}
async function analyzeLungNodules() {
  if (!active.value || !capabilities.value.lungAnalysis.enabled || analysisBusy.value) {
    if (!capabilities.value.lungAnalysis.enabled) error.value = capabilities.value.lungAnalysis.reason
    return
  }
  analysisBusy.value = true; error.value = ''; analysisTask.value = null
  try {
    analysisTask.value = await analysisApi.create(active.value.id)
    await pollAnalysis()
  } catch (reason) { error.value = reason instanceof Error ? reason.message : t('ui.imaging.detectionStartFailed') }
  finally { analysisBusy.value = false }
}
function selectStudy(id: string) {
  const changed = selected.value !== id
  selected.value = id
  if (String(route.query.exam || '') !== id) {
    void router.replace({ query: { ...route.query, exam: id } })
  }
  const examination = store.examinations.find(item => item.id === id)
  if (examination && !isLocalUpload(examination) && examination.type !== 'CT') viewerMode.value = 'mpr'
  if (changed) {
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
  if (latest) selectStudy(latest.id)
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
          <p>{{ active.date }} · {{ active.sliceCount }} slices · {{ $t(reviewed ? 'ui.imaging.reviewCompleteHelp' : 'ui.imaging.reviewPendingHelp') }}</p>
        </div>
        <div class="review-actions">
          <RouterLink class="btn btn-secondary" :to="{name:'doctor-patient-ai',params:{id:patientId},query:{exam:active.id}}"><Sparkles :size="16" /> {{ $t('ui.imaging.viewFindings') }}</RouterLink>
          <button class="btn" :class="reviewed ? 'btn-secondary' : 'btn-primary'" :disabled="reviewBusy" @click="review">
            <RotateCcw v-if="reviewed" :size="16" /><CheckCircle2 v-else :size="16" />
            {{ $t(reviewBusy ? 'ui.imaging.processing' : reviewed ? 'ui.imaging.reopenReview' : 'ui.imaging.confirmReview') }}
          </button>
        </div>
      </div>
      <div v-if="active && !isLocalActive" class="viewer-mode-bar card">
        <div><strong>{{ $t('ui.imaging.display') }}</strong><span>{{ $t(active.type === 'CT' ? 'ui.imaging.ctHelp' : active.type === 'MRI' ? 'ui.imaging.mriHelp' : 'ui.imaging.xrayHelp') }}</span></div>
        <div>
          <button v-if="active.type === 'CT'" class="btn btn-sm" :class="viewerMode === 'compare' ? 'btn-primary' : 'btn-secondary'" @click="setViewerMode('compare')"><Columns2 :size="15" /> {{ $t('ui.imaging.compare') }}</button>
          <button class="btn btn-sm" :class="viewerMode === 'mpr' ? 'btn-primary' : 'btn-secondary'" @click="setViewerMode('mpr')"><ScanLine :size="15" /> {{ $t(active.type === 'X-Ray' ? 'ui.imaging.projection' : 'ui.imaging.mpr') }}</button>
          <RouterLink
            v-if="capabilities.reconstruction3d.enabled"
            class="btn btn-sm btn-secondary"
            :to="{ path: '/viewer/study/' + patientId, query: { image: active.id } }"
            target="_blank"
          >
            <Box :size="15" /> {{ $t('ui.imaging.threeD') }}
          </RouterLink>
          <button v-else class="btn btn-sm btn-secondary" type="button" disabled :title="capabilities.reconstruction3d.reason"><Box :size="15" /> {{ $t('ui.imaging.threeDUnavailable') }}</button>
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
      <StatePanel v-else kind="empty" :message="$t('No medical images uploaded yet.')" />
      <p v-if="error" class="integration-error" role="alert">{{ error }}</p>
      <div v-if="active" class="task-grid">
        <div class="card task-card">
          <div><h3>{{ $t('ui.imaging.segmentation') }}</h3><p class="muted">{{ capabilities.segmentation.enabled ? $t('ui.imaging.segmentationHelp') : capabilities.segmentation.reason }}</p></div>
          <button class="btn btn-primary" :disabled="!capabilities.segmentation.enabled || busy || ['queued','running'].includes(segmentationTask?.status || '')" :title="capabilities.segmentation.reason" @click="segment"><ScanLine :size="16" /> {{ capabilities.segmentation.enabled ? $t('ui.imaging.startSegmentation') : $t('ui.imaging.segmentationUnavailable') }}</button>
          <p v-if="segmentationTask">Task: {{ segmentationTask.status }} · {{ segmentationTask.progress || 0 }}%</p>
          <RouterLink v-if="segmentationTask?.status === 'completed'" class="btn btn-secondary" :to="'/doctor/patients/' + patientId + '/3d'"><Box :size="16" /> {{ $t('View 3D') }}</RouterLink>
        </div>
        <div class="card task-card analysis-card">
          <div>
            <h3><Sparkles :size="17" /> {{ $t('ui.imaging.noduleDetection') }}</h3>
            <p v-if="!capabilities.lungAnalysis.enabled" class="muted">{{ capabilities.lungAnalysis.reason }}</p>
            <p v-else-if="analysisStatus?.configured" class="muted">{{ analysisStatus.model_name }} · {{ $t('ui.imaging.detectionConfiguredHelp') }}</p>
            <p v-else class="muted">{{ $t('ui.imaging.detectionAwaitingConfig') }}</p>
          </div>
          <button
            class="btn btn-primary"
            :disabled="!capabilities.lungAnalysis.enabled || !analysisStatus?.configured || analysisBusy || ['queued','running'].includes(analysisTask?.status || '')"
            :title="capabilities.lungAnalysis.reason"
            @click="analyzeLungNodules"
          ><Sparkles :size="16" /> {{ $t(analysisBusy ? 'ui.imaging.starting' : 'ui.imaging.startDetection') }}</button>
          <p v-if="analysisTask">{{ $t('ui.imaging.taskProgress', { status: analysisTask.status, progress: analysisTask.progress || 0 }) }}</p>
          <p v-else-if="activeFindings.length" class="finding-summary">{{ $t('ui.imaging.findingCount', { count: activeFindings.length }) }}</p>
          <RouterLink
            v-if="analysisTask?.status === 'completed' || activeFindings.length"
            class="btn btn-secondary"
            :to="{name:'doctor-patient-ai',params:{id:patientId},query:{exam:active.id}}"
          >{{ $t('ui.imaging.reviewResultCount', { count: analysisTask?.result?.findings_count ?? activeFindings.length }) }}</RouterLink>
        </div>
      </div>
    </section>
    <aside class="stack">
      <details class="card side-panel" open>
        <summary><strong>{{ $t('ui.imaging.studyList') }}</strong><span class="muted">{{ store.examinations.length }}</span></summary>
        <div class="study-list">
          <button v-for="image in store.examinations" :key="image.id" class="study-item" :class="{ active:image.id === active?.id }" @click="selectStudy(image.id)">
            <strong>{{ image.type }} · {{ image.organ }}<em v-if="isLocalUpload(image)">{{ $t('ui.imaging.local') }}</em></strong><span>{{ image.date }} · {{ image.sliceCount }} slices</span>
          </button>
        </div>
      </details>
      <details class="card side-panel">
        <summary><strong>{{ $t('ui.imaging.uploadImport') }}</strong><span class="muted">{{ $t('ui.imaging.expandAsNeeded') }}</span></summary>
        <MultiStudyUpload :patient-id="patientId" @complete="handleUploaded" />
      </details>
    </aside>
  </div>
</template>
<style scoped>
.imaging-layout{display:grid;grid-template-columns:minmax(0,1fr) 310px;gap:18px;align-items:start}
.review-bar{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:9px;padding:10px 12px;border-left:4px solid var(--amber);background:linear-gradient(100deg,#fffaf1 0%,#fff 72%)}.review-bar.complete{border-left-color:var(--green);background:linear-gradient(100deg,#f1f8f4 0%,#fff 72%)}.review-copy{min-width:0}.review-kicker{display:block;margin-bottom:3px;color:var(--amber);font-size:9px;font-weight:750;letter-spacing:.14em}.review-bar.complete .review-kicker{color:var(--green)}.review-title{display:flex;align-items:center;gap:8px}.review-title h2{margin:0;font-size:15px}.review-copy p{margin:4px 0 0;color:var(--text-muted);font-size:10px}.review-actions{display:flex;flex:0 0 auto;gap:7px}.review-actions .btn{min-height:32px}
.viewer-mode-bar{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:10px;padding:12px 14px}.viewer-mode-bar>div{display:flex;align-items:center;gap:9px}.viewer-mode-bar span{color:var(--text-muted);font-size:10px}.viewer-mode-bar .btn{min-height:32px}
.task-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:16px}.task-card{padding:18px;display:flex;flex-wrap:wrap;align-items:center;gap:14px}.task-card>div{flex:1;min-width:210px}.task-card h3{display:flex;align-items:center;gap:7px}.analysis-card{border-color:#b9d9d5;background:linear-gradient(130deg,#f1f8f7,#fff 70%)}.finding-summary{color:var(--accent-strong);font-weight:650}
.study-list{padding:8px}.study-item{width:100%;display:grid;text-align:left;gap:5px;padding:13px;border:1px solid transparent;background:transparent;border-radius:6px;color:var(--text)}.study-item span{font-size:11px;color:var(--text-muted)}.study-item.active{background:#e7f3f2;border-color:#b9d9d5}
.study-item em{display:inline-block;margin-left:4px;padding:2px 5px;border-radius:4px;background:#dcefed;color:var(--accent-strong);font-size:8px;font-style:normal;vertical-align:1px}
.side-panel{overflow:hidden}.side-panel>summary{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 14px;cursor:pointer;list-style:none}.side-panel>summary::-webkit-details-marker{display:none}.side-panel>summary::after{content:'+';color:var(--accent-strong);font-size:17px}.side-panel[open]>summary::after{content:'−'}.side-panel[open]>summary{border-bottom:1px solid var(--border)}
.integration-error{padding:14px;background:#fbeded;color:#a24e50;border-radius:8px}
@media(max-width:1050px){.imaging-layout{grid-template-columns:1fr}}@media(max-width:760px){.review-bar,.review-actions,.viewer-mode-bar,.viewer-mode-bar>div{align-items:stretch;flex-direction:column}.review-actions .btn{width:100%}.task-grid{grid-template-columns:1fr}}
</style>
