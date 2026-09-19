<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { Check, FileCheck2, MessageSquarePlus, PenLine, RotateCcw, Save, X } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { usePatientStore } from '@/stores/patients'
import { useReportDraftStore } from '@/stores/reportDrafts'
import { useProfileStore } from '@/stores/profile'
import { useStudyWorkspaceStore } from '@/stores/studyWorkspace'
import ReportCard from '@/components/medical/ReportCard.vue'
import { locale, t } from '@/i18n'
import type { AIInvocation, Report, ReportStatus } from '@/types'
import { aiApi } from '@/api/ai'
import { reportApi } from '@/api/reports'
import { useAIChatStore } from '@/stores/aiChat'
import { localPreview } from '@/utils/runtime'
import { localCalendarDate } from '@/utils/dates'

const auth = useAuthStore()
const store = usePatientStore()
const drafts = useReportDraftStore()
const profile = useProfileStore()
const workspace = useStudyWorkspaceStore()
const ai = useAIChatStore()
const authorName = computed(() => profile.data?.display_name || auth.session?.name || '')
const activeExamination = computed(() =>
  store.examinations.find(examination => examination.id === (workspace.context.examinationId || store.activeExamId)) || store.examinations[0],
)
const reportsForExamination = computed(() =>
  store.reports.filter(report => report.examinationId === activeExamination.value?.id),
)
const selectedReportId = ref('')
const currentReport = computed(() =>
  reportsForExamination.value.find(report => report.id === selectedReportId.value)
    || reportsForExamination.value[0],
)
const activeReportTask = computed(() =>
  store.reportTasks.find(task => task.examinationId === activeExamination.value?.id),
)
const taskStatusKey = computed(() => ({
  pending_draft: 'ui.report.task.pendingDraft',
  drafting: 'ui.report.task.drafting',
  in_review: 'ui.report.task.inReview',
  signed: 'ui.report.task.signed',
  cancelled: 'ui.report.task.cancelled',
}[activeReportTask.value?.status || 'pending_draft']))
const form = reactive({ diagnosis: '', description: '', recommendation: '' })
const baseline = reactive({ diagnosis: '', description: '', recommendation: '' })
const addendum = reactive({ reason: '', content: '' })
const busy = ref(false)
const workflowBusy = ref(false)
const addendumBusy = ref(false)
const signConfirm = ref(false)
const cancelOpen = ref(false)
const cancelReason = ref('')
const addendumOpen = ref(false)
const candidatePreview = ref('')
const descriptionBeforeCandidate = ref('')
const aiDraftBusy = ref(false)
const aiDraftInvocation = ref<AIInvocation | null>(null)
const aiDraftError = ref('')
const message = ref('')
const error = ref('')
let hydrating = false
const dirty = computed(() =>
  form.diagnosis !== baseline.diagnosis ||
  form.description !== baseline.description ||
  form.recommendation !== baseline.recommendation,
)
const reportStatus = computed<ReportStatus>(() =>
  currentReport.value?.status || (currentReport.value?.reviewed ? 'signed' : 'draft'),
)
const signed = computed(() => reportStatus.value === 'signed')
const editable = computed(() => reportStatus.value === 'draft')
const aiDraftCapability = computed(() =>
  ai.capabilities.some(capability => capability.purpose === 'report_draft' && capability.available),
)
const acceptedFindings = computed(() => store.findings.filter(finding =>
  finding.examinationId === activeExamination.value?.id && ['confirmed', 'modified'].includes(finding.status),
))
const preview = computed<Report>(() => ({
  id: currentReport.value?.id || '',
  patientId: store.selectedPatientId || '',
  examinationId: activeExamination.value?.id || '',
  organId: activeExamination.value?.organId || 'other',
  organIds: [activeExamination.value?.organId || 'other'],
  diagnosis: form.diagnosis,
  description: form.description,
  recommendation: form.recommendation,
  doctor: currentReport.value?.doctor || authorName.value,
  date: currentReport.value?.date || localCalendarDate(),
  reviewed: signed.value,
  signedAt: currentReport.value?.signedAt,
  addenda: currentReport.value?.addenda,
}))

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function eventActionKey(action: string) {
  return ({
    created: 'ui.report.event.created',
    draft_saved: 'ui.report.event.draftSaved',
    submitted: 'ui.report.event.submitted',
    signed: 'ui.report.event.signed',
    reopened: 'ui.report.event.reopened',
    cancelled: 'ui.report.event.cancelled',
  }[action] || 'ui.report.event.changed')
}

function fillForm(report?: Report) {
  hydrating = true
  clearCandidatePreview()
  const savedFields = {
    diagnosis: report?.diagnosis || '',
    description: report?.description || '',
    recommendation: report?.recommendation || '',
  }
  Object.assign(baseline, savedFields)
  const patientId = store.selectedPatientId || ''
  const examinationId = activeExamination.value?.id || ''
  const storedDraft = patientId && examinationId ? drafts.get(patientId, examinationId) : undefined
  const canRestore = storedDraft && storedDraft.reportId === (report?.id || '')
  Object.assign(form, canRestore ? storedDraft.fields : savedFields)
  signConfirm.value = false
  addendumOpen.value = false
  message.value = canRestore ? t('ui.report.draftRestored', { time: new Date(storedDraft.updatedAt).toLocaleString() }) : ''
  error.value = ''
  nextTick(() => { hydrating = false })
}

watch([currentReport, activeExamination], () => fillForm(currentReport.value), { immediate: true })
watch([activeExamination, reportsForExamination], () => {
  if (!reportsForExamination.value.some(report => report.id === selectedReportId.value)) {
    selectedReportId.value = reportsForExamination.value[0]?.id || ''
  }
}, { immediate: true })
watch(currentReport, report => {
  if (report?.id) void store.loadReportEvents(report.id)
}, { immediate: true })
watch([activeExamination], () => {
  if (!localPreview && activeExamination.value?.organId) {
    void ai.loadCapabilities(activeExamination.value.organId, activeExamination.value.id)
  }
}, { immediate: true })
watch(locale, () => { if (!dirty.value) fillForm(currentReport.value) })
watch(form, () => {
  if (hydrating || signed.value) return
  const patientId = store.selectedPatientId
  const examinationId = activeExamination.value?.id
  if (!patientId || !examinationId) return
  if (!dirty.value) {
    drafts.clear(patientId, examinationId)
    return
  }
  drafts.save({
    patientId,
    examinationId,
    reportId: currentReport.value?.id || '',
    fields: { ...form },
    updatedAt: new Date().toISOString(),
  })
}, { deep: true })

function warnBeforeUnload(event: BeforeUnloadEvent) {
  if (!dirty.value) return
  event.preventDefault()
}

onMounted(async () => {
  window.addEventListener('beforeunload', warnBeforeUnload)
  if (localPreview) await ai.loadCapabilities('lung')
})
onBeforeUnmount(() => window.removeEventListener('beforeunload', warnBeforeUnload))
onBeforeRouteLeave(() => {
  if (!dirty.value) return true
  return window.confirm(t('ui.report.leaveDraftConfirm'))
})

function resetForm() {
  const patientId = store.selectedPatientId
  const examinationId = activeExamination.value?.id
  if (patientId && examinationId) drafts.clear(patientId, examinationId)
  fillForm(currentReport.value)
  message.value = currentReport.value ? 'Restored the last saved report.' : 'Draft cleared.'
}

function includeFindings() {
  if (!editable.value) return
  descriptionBeforeCandidate.value = form.description
  candidatePreview.value = acceptedFindings.value
    .map(finding => `${finding.label}：${finding.description}`)
    .join('\n\n')
  message.value = ''
  error.value = ''
}

async function generateAIDraft() {
  if (!editable.value || aiDraftBusy.value || !activeExamination.value || !store.selectedPatientId) return
  aiDraftBusy.value = true
  aiDraftError.value = ''
  error.value = ''
  aiDraftInvocation.value = null
  if (localPreview) {
    descriptionBeforeCandidate.value = form.description
    candidatePreview.value = [
      ...acceptedFindings.value.map(finding => `${finding.label}：${finding.description}`),
      currentReport.value?.diagnosis || '',
    ].filter(Boolean).join('\n\n') || '本地演示 AI 草稿：请根据已签署报告继续完善影像所见。'
    message.value = 'AI report candidate generated. Review before applying.'
    aiDraftBusy.value = false
    return
  }
  try {
    const invocation = await aiApi.createInvocation({
      patientId: store.selectedPatientId,
      organId: activeExamination.value.organId || 'lung',
      examinationId: activeExamination.value.id,
      purpose: 'report_draft',
      baseRevision: currentReport.value?.revision || 1,
      idempotencyKey: `report-draft:${store.selectedPatientId}:${activeExamination.value.id}`,
    })
    aiDraftInvocation.value = invocation
    for (let attempt = 0; attempt < 60; attempt += 1) {
      const updated = await aiApi.getInvocation(invocation.id)
      aiDraftInvocation.value = updated
      if (updated.status === 'completed' || updated.status === 'failed' || updated.status === 'cancelled') break
      await new Promise(resolve => setTimeout(resolve, 250))
    }
    const final = aiDraftInvocation.value
    if (final?.status !== 'completed') {
      throw new Error(final?.errorMessage || 'AI report draft did not complete.')
    }
    const candidate = (final.result as Record<string, unknown> | null)?.candidate_fields as
      | { findings?: Array<{ text: string }>; impression?: Array<{ text: string }> }
      | undefined
    descriptionBeforeCandidate.value = form.description
    candidatePreview.value = [
      ...(candidate?.findings || []).map(item => item.text),
      ...(candidate?.impression || []).map(item => item.text),
    ].filter(Boolean).join('\n\n')
    message.value = 'AI report candidate generated. Review before applying.'
  } catch (reason) {
    aiDraftError.value = reason instanceof Error ? reason.message : 'AI report generation failed.'
  } finally {
    aiDraftBusy.value = false
  }
}

async function applyAICandidate(replace: boolean) {
  if (!currentReport.value || !aiDraftInvocation.value || aiDraftInvocation.value.status !== 'completed') return
  const candidate = (aiDraftInvocation.value.result as Record<string, unknown> | null)?.candidate_fields as
    | { findings?: Array<{ text: string }>; impression?: Array<{ text: string }> }
    | undefined
  const description = [
    ...(candidate?.findings || []).map(item => item.text),
    ...(candidate?.impression || []).map(item => item.text),
  ].filter(Boolean).join('\n\n')
  try {
    const saved = await reportApi.applyAICandidate(
      currentReport.value.id,
      { description },
      currentReport.value.revision || 1,
      replace,
    )
    fillForm(saved)
    aiDraftInvocation.value = null
    candidatePreview.value = ''
    descriptionBeforeCandidate.value = ''
    message.value = 'AI candidate applied to the draft.'
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Could not apply AI candidate.'
  }
}

function replaceDescriptionWithCandidate() {
  if (aiDraftInvocation.value) {
    void applyAICandidate(true)
    return
  }
  form.description = candidatePreview.value
  clearCandidatePreview()
  message.value = 'Candidate findings replaced the current description.'
}

function appendCandidateToDescription() {
  if (aiDraftInvocation.value) {
    void applyAICandidate(false)
    return
  }
  form.description = [form.description, candidatePreview.value].filter(Boolean).join('\n\n')
  clearCandidatePreview()
  message.value = 'Candidate findings were appended to the description.'
}

function cancelCandidatePreview() {
  clearCandidatePreview()
}

function undoDescriptionCandidate() {
  if (!descriptionBeforeCandidate.value) return
  form.description = descriptionBeforeCandidate.value
  clearCandidatePreview()
  message.value = 'Description restored to the previous version.'
}

function clearCandidatePreview() {
  candidatePreview.value = ''
  descriptionBeforeCandidate.value = ''
  aiDraftInvocation.value = null
  aiDraftError.value = ''
}

function selectExamination(event: Event) {
  const examinationId = (event.target as HTMLSelectElement).value
  store.activeExamId = examinationId || null
  workspace.selectExamination(examinationId || null)
}

function selectReport(event: Event) {
  selectedReportId.value = (event.target as HTMLSelectElement).value
}

function addReport() {
  if (!activeExamination.value || !store.selectedPatientId) return
  selectedReportId.value = ''
  fillForm(undefined)
  message.value = 'New report ready. Save the draft to create it.'
  error.value = ''
}

function requestSigning() {
  error.value = ''
  if (signed.value || workflowBusy.value || busy.value) return
  if (!['draft', 'pending_review'].includes(reportStatus.value)) return
  if (!activeExamination.value || !store.selectedPatientId) {
    error.value = 'Select an examination first.'
    return
  }
  if (!form.diagnosis.trim() || !form.description.trim()) {
    error.value = 'Enter a diagnosis and description before signing.'
    return
  }
  signConfirm.value = true
}

async function saveReport(reviewed: boolean) {
  if (busy.value || signed.value || reportStatus.value !== 'draft') return null
  message.value = ''
  error.value = ''
  if (!activeExamination.value || !store.selectedPatientId) {
    error.value = 'Select an examination first.'
    return
  }
  busy.value = true
  try {
    const saved = await store.saveReport({
      ...preview.value,
      diagnosis: form.diagnosis.trim(),
      description: form.description.trim(),
      recommendation: form.recommendation.trim(),
      doctor: currentReport.value?.doctor || authorName.value,
      date: localCalendarDate(),
      reviewed,
    })
    drafts.clear(store.selectedPatientId, activeExamination.value.id)
    fillForm(saved)
    message.value = reviewed ? 'Report signed and available in the patient portal.' : 'Draft saved.'
    return saved
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Save failed. Please try again.'
    return null
  } finally {
    busy.value = false
  }
}

async function runTransition(
  action: 'submit' | 'sign' | 'reopen' | 'cancel',
  reason?: string,
) {
  if (workflowBusy.value) return
  workflowBusy.value = true
  message.value = ''
  error.value = ''
  try {
    let reportId = currentReport.value?.id || ''
    if ((!reportId || dirty.value) && (action === 'submit' || action === 'sign')) {
      const saved = await saveReport(false)
      if (!saved) return
      reportId = saved.id
    }
    const updated = await store.transitionReport(reportId, action, reason)
    fillForm(updated)
    message.value = action === 'sign'
      ? 'Report signed and available in the patient portal.'
      : action === 'submit'
        ? 'Report submitted for review.'
        : action === 'reopen'
          ? 'Report returned to draft.'
          : 'Report cancelled.'
  } catch (reasonValue) {
    error.value = reasonValue instanceof Error ? reasonValue.message : 'Report transition failed.'
  } finally {
    workflowBusy.value = false
    signConfirm.value = false
    cancelOpen.value = false
    cancelReason.value = ''
  }
}

async function submitAddendum() {
  if (!currentReport.value || !signed.value || addendumBusy.value) return
  if (!addendum.reason.trim() || !addendum.content.trim()) {
    error.value = t('ui.report.addendumRequired')
    return
  }
  addendumBusy.value = true
  error.value = ''
  try {
    await store.addReportAddendum(currentReport.value.id, addendum.reason, addendum.content)
    addendum.reason = ''
    addendum.content = ''
    addendumOpen.value = false
    message.value = t('ui.report.addendumAdded')
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : t('ui.report.addendumFailed')
  } finally {
    addendumBusy.value = false
  }
}
</script>

<template>
  <div class="report-layout">
    <section class="editor-section card">
      <div class="card-header">
        <div>
          <span class="report-eyebrow">{{ $t('Clinical report') }}</span>
          <h3><PenLine :size="22" /> {{ $t('Doctor Review') }}</h3>
          <p class="muted">{{ $t('Review, refine, and sign your clinical assessment.') }}</p>
        </div>
        <span :class="['sign-status', { signed }]">
          <FileCheck2 :size="15" />
          {{ $t(signed ? 'Signed' : reportStatus === 'pending_review' ? 'ui.report.pendingReview' : dirty ? 'Unsaved changes' : 'Draft') }}
        </span>
      </div>

      <div class="report-context">
        <span>{{ store.selectedPatient?.name }} · {{ store.selectedPatientId }}</span>
        <div class="report-selectors">
          <select :value="activeExamination?.id || ''" class="select" :aria-label="$t('Report examination')" :disabled="busy || dirty || workflowBusy || !editable" @change="selectExamination">
            <option v-for="examination in store.examinations" :key="examination.id" :value="examination.id">
              {{ examination.type }} · {{ examination.organ }} · {{ examination.date }}
            </option>
          </select>
          <select :value="currentReport?.id || ''" class="select" :aria-label="$t('ui.report.version')" :disabled="busy || dirty || workflowBusy || !editable" @change="selectReport">
            <option v-for="report in reportsForExamination" :key="report.id" :value="report.id">
              {{ report.date }} · {{ report.diagnosis.slice(0, 32) }}
            </option>
          </select>
          <button type="button" class="btn btn-sm btn-secondary" :disabled="busy || dirty || workflowBusy || !editable" @click="addReport">
            {{ $t('ui.report.add') }}
          </button>
        </div>
      </div>
      <div v-if="activeReportTask" class="report-task-status">
        <span>{{ $t('ui.report.taskLabel') }}</span>
        <strong>{{ $t(taskStatusKey) }}</strong>
        <small>{{ $t('ui.report.revision', { revision: currentReport?.revision || 1 }) }}</small>
      </div>

      <form class="card-body report-form" @submit.prevent="requestSigning">
        <p v-if="signed" class="immutable-note">{{ $t('ui.report.immutableNote') }}</p>
        <div class="document-field">
          <label class="label" for="diagnosis">{{ $t('Final diagnosis') }}</label>
          <textarea id="diagnosis" v-model="form.diagnosis" class="textarea" rows="2" maxlength="10000" :placeholder="$t('Write your clinical impression...')" :disabled="busy || !editable" />
        </div>
        <div class="document-field">
          <label class="label" for="description">{{ $t('Description') }}</label>
          <textarea id="description" v-model="form.description" class="textarea" rows="5" maxlength="30000" :placeholder="$t('Describe the imaging findings...')" :disabled="busy || !editable" />
          <button v-if="acceptedFindings.length && editable" type="button" class="findings-link" :disabled="busy" @click="includeFindings">
            {{ $t('Use reviewed AI findings') }}
          </button>
          <button v-if="aiDraftCapability && editable" type="button" class="findings-link" :disabled="aiDraftBusy || busy" @click="generateAIDraft">
            {{ $t(aiDraftBusy ? 'ui.report.aiDrafting' : 'ui.report.generateAIDraft') }}
          </button>
          <p v-if="aiDraftError" class="ai-draft-error" role="alert">{{ aiDraftError }}</p>
          <div v-if="candidatePreview" class="candidate-preview" role="region" :aria-label="$t('ui.report.candidatePreview')">
            <div class="candidate-actions">
              <button type="button" class="btn btn-secondary btn-sm" :disabled="busy" @click="replaceDescriptionWithCandidate">{{ $t('ui.report.replaceDescription') }}</button>
              <button type="button" class="btn btn-secondary btn-sm" :disabled="busy" @click="appendCandidateToDescription">{{ $t('ui.report.appendDescription') }}</button>
              <button type="button" class="btn btn-secondary btn-sm" :disabled="busy" @click="undoDescriptionCandidate">{{ $t('ui.report.undoCandidate') }}</button>
              <button type="button" class="btn btn-secondary btn-sm" :disabled="busy" @click="cancelCandidatePreview">{{ $t('Cancel') }}</button>
            </div>
            <textarea :value="candidatePreview" class="textarea candidate-text" rows="6" readonly />
          </div>
        </div>
        <div class="document-field">
          <label class="label" for="recommendation">{{ $t('Recommendation') }}</label>
          <textarea id="recommendation" v-model="form.recommendation" class="textarea" rows="3" maxlength="10000" :placeholder="$t('Add follow-up recommendations...')" :disabled="busy || !editable" />
        </div>
        <div class="form-actions">
          <button v-if="editable" type="button" class="btn btn-secondary" :disabled="busy || workflowBusy || !form.diagnosis.trim() || !form.description.trim()" @click="runTransition('submit')">
            <Check :size="16" /> {{ $t(workflowBusy ? 'Saving...' : 'ui.report.submitReview') }}
          </button>
          <button v-if="editable" type="button" class="btn btn-secondary" :disabled="busy || workflowBusy || !dirty" @click="saveReport(false)">
            <Save :size="16" /> {{ $t('Save draft') }}
          </button>
          <button v-if="editable" type="button" class="btn btn-secondary" :disabled="busy || workflowBusy || !dirty" @click="resetForm">
            <RotateCcw :size="16" /> {{ $t('Reset') }}
          </button>
          <button v-if="editable || reportStatus === 'pending_review'" type="button" class="btn btn-primary" :disabled="busy || workflowBusy || !form.diagnosis.trim() || !form.description.trim()" @click="requestSigning">
            <Check :size="16" /> {{ $t(workflowBusy ? 'Saving...' : 'Mark reviewed and sign') }}
          </button>
          <button v-if="reportStatus === 'pending_review'" type="button" class="btn btn-secondary" :disabled="workflowBusy" @click="runTransition('reopen')">
            <RotateCcw :size="16" /> {{ $t('ui.report.returnDraft') }}
          </button>
          <button v-if="editable || reportStatus === 'pending_review'" type="button" class="btn btn-danger btn-secondary" :disabled="workflowBusy" @click="cancelOpen = true">
            {{ $t('ui.report.cancelTask') }}
          </button>
          <button v-if="signed" type="button" class="btn btn-secondary" :disabled="addendumBusy" @click="addendumOpen = !addendumOpen">
            <MessageSquarePlus :size="16" /> {{ $t('ui.report.addAddendum') }}
          </button>
        </div>
        <p v-if="message" class="save-message" role="status">{{ $t(message) }}</p>
        <p v-if="error" class="error-message" role="alert">{{ $t(error) }}</p>
      </form>

      <section v-if="store.reportEvents.length" class="revision-history" aria-labelledby="revision-history-title">
        <h4 id="revision-history-title">{{ $t('ui.report.revisionHistory') }}</h4>
        <ol>
          <li v-for="event in store.reportEvents" :key="event.eventId">
            <strong>{{ $t(eventActionKey(event.action)) }} · v{{ event.revision }}</strong>
            <small>{{ formatDateTime(event.createdAt) }}<template v-if="event.reason"> · {{ event.reason }}</template></small>
          </li>
        </ol>
      </section>

      <section v-if="addendumOpen && signed" class="addendum-editor" aria-labelledby="addendum-title">
        <div><h4 id="addendum-title">{{ $t('ui.report.addendumTitle') }}</h4><button type="button" :aria-label="$t('ui.report.closeAddendum')" @click="addendumOpen = false"><X :size="16" /></button></div>
        <label class="label">{{ $t('ui.report.addendumReason') }}<input v-model="addendum.reason" class="input" maxlength="200" :disabled="addendumBusy" /></label>
        <label class="label">{{ $t('ui.report.addendumContent') }}<textarea v-model="addendum.content" class="textarea" maxlength="20000" rows="4" :disabled="addendumBusy" /></label>
        <button type="button" class="btn btn-primary" :disabled="addendumBusy || !addendum.reason.trim() || !addendum.content.trim()" @click="submitAddendum">
          {{ $t(addendumBusy ? 'ui.report.addingAddendum' : 'ui.report.confirmAddendum') }}
        </button>
      </section>
    </section>

    <aside class="preview-section">
      <div class="section-heading"><h3>{{ $t('Live preview') }}</h3></div>
      <ReportCard :report="preview" />
      <p class="preview-note">{{ $t('The patient sees this report after you sign it.') }}</p>
    </aside>

    <div v-if="signConfirm" class="confirm-backdrop" role="presentation" @click.self="signConfirm = false">
      <section class="sign-confirm" role="dialog" aria-modal="true" aria-labelledby="sign-confirm-title">
        <h3 id="sign-confirm-title">{{ $t('ui.report.signConfirmTitle') }}</h3>
        <p>{{ $t('ui.report.signContext', { patient: store.selectedPatient?.name, type: activeExamination?.type, date: activeExamination?.date }) }}</p>
        <p>{{ $t('ui.report.signImmutableHelp') }}</p>
        <div>
          <button type="button" class="btn btn-secondary" :disabled="busy" @click="signConfirm = false">{{ $t('ui.report.backToExamination') }}</button>
          <button type="button" class="btn btn-primary" :disabled="busy || workflowBusy" @click="runTransition('sign')">
            <Check :size="16" /> {{ $t(busy ? 'ui.report.signing' : 'ui.report.confirmSign') }}
          </button>
        </div>
      </section>
    </div>

    <div v-if="cancelOpen" class="confirm-backdrop" role="presentation" @click.self="cancelOpen = false">
      <section class="sign-confirm" role="dialog" aria-modal="true" aria-labelledby="cancel-report-title">
        <h3 id="cancel-report-title">{{ $t('ui.report.cancelTitle') }}</h3>
        <p>{{ $t('ui.report.cancelHelp') }}</p>
        <label class="label">{{ $t('ui.report.cancelReason') }}<textarea v-model="cancelReason" class="textarea" rows="3" maxlength="500" /></label>
        <div>
          <button type="button" class="btn btn-secondary" :disabled="workflowBusy" @click="cancelOpen = false">{{ $t('Cancel') }}</button>
          <button type="button" class="btn btn-danger" :disabled="workflowBusy || !cancelReason.trim()" @click="runTransition('cancel', cancelReason)">{{ $t('ui.report.confirmCancel') }}</button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.report-layout{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(300px,.75fr);align-items:start;gap:18px}.editor-section{overflow:hidden;border:0;border-radius:16px;box-shadow:0 8px 32px rgb(28 65 64 / 5%)}.editor-section .card-header{align-items:flex-start;padding:28px 30px 22px;border-bottom:0;background:linear-gradient(120deg,#edf7f4,#fff)}.editor-section h3{display:flex;align-items:center;gap:10px;margin:8px 0;font-size:23px;font-weight:650}.report-eyebrow{color:var(--accent-strong);font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}.sign-status{display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:999px;background:#f8efe4;color:#a56b25;font-size:11px;font-weight:700}.sign-status.signed{background:#e6f1eb;color:#3f7d5d}.report-context{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 30px;border-bottom:1px solid var(--border);color:var(--text-muted);font-size:12px}.report-context .select{width:auto;max-width:60%}.editor-section .report-form{display:flex;flex-direction:column;padding:8px 30px 28px}.immutable-note{margin:18px 0 0;padding:11px 13px;border-radius:8px;background:#eef5f3;color:var(--accent-strong);font-size:12px}.document-field{padding:22px 0;border-bottom:1px solid var(--border)}.document-field .label{color:var(--accent-strong);font-size:11px;letter-spacing:.06em;text-transform:uppercase}.document-field .textarea{display:block;min-height:0;padding:10px 0;border:0;border-radius:0;background:transparent;box-shadow:none;font-size:14px;line-height:1.9;resize:vertical}.document-field .textarea:focus{box-shadow:0 2px 0 var(--accent)}.findings-link{padding:4px 0;border:0;background:transparent;color:var(--accent-strong);font-size:12px;text-decoration:underline}.form-actions{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding-top:24px}.save-message{color:var(--green);font-size:12px}.error-message{color:var(--red);font-size:12px}.preview-section{display:flex;flex-direction:column;gap:12px}.preview-note{margin:0;color:var(--text-muted);font-size:12px}.addendum-editor{display:grid;gap:14px;padding:22px 30px;border-top:1px solid var(--border);background:var(--surface-2)}.addendum-editor>div{display:flex;align-items:center;justify-content:space-between}.addendum-editor h4{margin:0}.addendum-editor>div button{display:grid;place-items:center;border:0;background:transparent;color:var(--text-muted)}.addendum-editor .label{display:grid;gap:7px}.addendum-editor>.btn{justify-self:start}.confirm-backdrop{position:fixed;z-index:120;inset:0;display:grid;place-items:center;padding:20px;background:rgb(12 34 38 / 55%)}.sign-confirm{width:min(480px,100%);padding:26px;border-radius:14px;background:white;box-shadow:0 24px 80px #102d3455}.sign-confirm h3{margin-top:0}.sign-confirm p{color:var(--text-muted);font-size:13px;line-height:1.7}.sign-confirm>div{display:flex;justify-content:flex-end;gap:10px;margin-top:22px}
.candidate-preview{display:grid;gap:9px;margin-top:12px;padding:12px;border:1px solid #c9dddc;border-radius:8px;background:#f5faf8}.candidate-actions{display:flex;flex-wrap:wrap;gap:7px}.candidate-text{width:100%;padding:10px;border:1px solid var(--border);border-radius:7px;background:white;color:var(--text);font-size:12px;line-height:1.6}.ai-draft-error{margin:6px 0 0;color:var(--red);font-size:11px}.report-task-status{display:flex;align-items:center;gap:9px;padding:9px 30px;border-bottom:1px solid var(--border);background:var(--surface-2);color:var(--text-muted);font-size:11px}.report-task-status strong{color:var(--accent-strong);font-weight:720}.report-task-status small{margin-left:auto}.revision-history{padding:18px 30px;border-top:1px solid var(--border);background:var(--surface-2)}.revision-history h4{margin:0 0 10px;font-size:13px}.revision-history ol{margin:0;padding-left:18px}.revision-history li{display:flex;justify-content:space-between;gap:12px;padding:6px 0;color:var(--text-muted);font-size:11px}.revision-history li strong{color:var(--text-soft);font-weight:640}
.report-selectors{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
@media(max-width:1000px){.report-layout{grid-template-columns:1fr}}@media(max-width:600px){.editor-section .card-header,.editor-section .report-form,.report-context,.addendum-editor{padding-right:18px;padding-left:18px}.report-context{align-items:stretch;flex-direction:column}.report-context .select{width:100%;max-width:none}.sign-confirm>div{align-items:stretch;flex-direction:column-reverse}}
</style>
