<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { Check, FileCheck2, MessageSquarePlus, PenLine, RotateCcw, Save, X } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { usePatientStore } from '@/stores/patients'
import { useReportDraftStore } from '@/stores/reportDrafts'
import { useProfileStore } from '@/stores/profile'
import ReportCard from '@/components/medical/ReportCard.vue'
import StructuredReportFields from '@/components/medical/StructuredReportFields.vue'
import { reportTemplatesApi } from '@/api/reportTemplates'
import { DEFAULT_REPORT_TEMPLATES } from '@/data/reportTemplates'
import { locale, t } from '@/i18n'
import type { Report, ReportTemplate } from '@/types'
import { localCalendarDate } from '@/utils/dates'
import { localPreview } from '@/utils/runtime'

const LOCAL_TEMPLATE_STORAGE = 'pulmolink-report-templates-v1'
const auth = useAuthStore()
const store = usePatientStore()
const drafts = useReportDraftStore()
const profile = useProfileStore()
const authorName = computed(() => profile.data?.display_name || auth.session?.name || '')
const activeExamination = computed(() =>
  store.examinations.find(examination => examination.id === store.activeExamId) || store.examinations[0],
)
const currentReport = computed(() =>
  store.reports.find(report => report.examinationId === activeExamination.value?.id),
)
const form = reactive({ diagnosis: '', description: '', recommendation: '' })
const baseline = reactive({ diagnosis: '', description: '', recommendation: '' })
const templates = ref<ReportTemplate[]>([])
const selectedTemplateId = ref('')
const structuredData = reactive<Record<string, unknown>>({})
const structuredBaseline = reactive<Record<string, unknown>>({})
const templatesBusy = ref(false)
const addendum = reactive({ reason: '', content: '' })
const busy = ref(false)
const addendumBusy = ref(false)
const signConfirm = ref(false)
const addendumOpen = ref(false)
const message = ref('')
const error = ref('')
let hydrating = false
const activeTemplate = computed(() =>
  templates.value.find(template => template.id === selectedTemplateId.value) || currentReport.value?.reportTemplate || null,
)
const matchingTemplates = computed(() => {
  const examination = activeExamination.value
  if (!examination) return templates.value
  const organId = examination.organId || ''
  return templates.value.filter(template =>
    (!template.modality || template.modality === examination.type)
    && (!template.organId || !organId || template.organId === organId),
  )
})
const structuredDirty = computed(() =>
  JSON.stringify(structuredData) !== JSON.stringify(structuredBaseline),
)
const dirty = computed(() =>
  form.diagnosis !== baseline.diagnosis ||
  form.description !== baseline.description ||
  form.recommendation !== baseline.recommendation ||
  structuredDirty.value,
)
const signed = computed(() => Boolean(currentReport.value?.signedAt || currentReport.value?.reviewed))
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
  reportTemplateId: selectedTemplateId.value || undefined,
  structuredData: { ...structuredData },
  reportTemplate: activeTemplate.value || undefined,
  doctor: currentReport.value?.doctor || authorName.value,
  date: currentReport.value?.date || localCalendarDate(),
  reviewed: signed.value,
  signedAt: currentReport.value?.signedAt,
  addenda: currentReport.value?.addenda,
}))

function fillForm(report?: Report) {
  hydrating = true
  const savedFields = {
    diagnosis: report?.diagnosis || '',
    description: report?.description || '',
    recommendation: report?.recommendation || '',
  }
  Object.assign(baseline, savedFields)
  const savedStructured = report?.structuredData ? structuredClone(report.structuredData) : {}
  Object.keys(structuredBaseline).forEach(key => delete structuredBaseline[key])
  Object.assign(structuredBaseline, savedStructured)
  selectedTemplateId.value = report?.reportTemplateId
    || matchingTemplates.value[0]?.id
    || ''
  const patientId = store.selectedPatientId || ''
  const examinationId = activeExamination.value?.id || ''
  const storedDraft = patientId && examinationId ? drafts.get(patientId, examinationId) : undefined
  const canRestore = storedDraft && storedDraft.reportId === (report?.id || '')
  const restoredStructured = canRestore && storedDraft.fields.structuredData
    ? storedDraft.fields.structuredData
    : savedStructured
  if (canRestore && storedDraft.fields.reportTemplateId) {
    selectedTemplateId.value = storedDraft.fields.reportTemplateId
  }
  Object.assign(form, canRestore ? {
    diagnosis: storedDraft.fields.diagnosis,
    description: storedDraft.fields.description,
    recommendation: storedDraft.fields.recommendation,
  } : savedFields)
  Object.keys(structuredData).forEach(key => delete structuredData[key])
  Object.assign(structuredData, restoredStructured)
  signConfirm.value = false
  addendumOpen.value = false
  message.value = canRestore ? t('ui.report.draftRestored', { time: new Date(storedDraft.updatedAt).toLocaleString() }) : ''
  error.value = ''
  nextTick(() => { hydrating = false })
}

watch([currentReport, activeExamination], () => fillForm(currentReport.value), { immediate: true })
watch(activeExamination, () => { void loadTemplates() }, { immediate: true })
watch(locale, () => { if (!dirty.value) fillForm(currentReport.value) })
watch([form, structuredData], () => {
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
    fields: {
      ...form,
      reportTemplateId: selectedTemplateId.value,
      structuredData: { ...structuredData },
    },
    updatedAt: new Date().toISOString(),
  })
}, { deep: true })

async function loadTemplates() {
  templatesBusy.value = true
  try {
    if (localPreview) {
      try {
        const stored = JSON.parse(localStorage.getItem(LOCAL_TEMPLATE_STORAGE) || 'null')
        templates.value = Array.isArray(stored) && stored.length
          ? stored as ReportTemplate[]
          : structuredClone(DEFAULT_REPORT_TEMPLATES)
      } catch {
        templates.value = structuredClone(DEFAULT_REPORT_TEMPLATES)
      }
    } else {
      const examination = activeExamination.value
      templates.value = await reportTemplatesApi.list({
        modality: examination?.type,
        organId: examination?.organId,
      })
      if (!templates.value.length) templates.value = await reportTemplatesApi.list()
    }
  } catch {
    templates.value = structuredClone(DEFAULT_REPORT_TEMPLATES)
  } finally {
    if (!selectedTemplateId.value || !templates.value.some(item => item.id === selectedTemplateId.value)) {
      selectedTemplateId.value = matchingTemplates.value[0]?.id || ''
    }
    if (!hydrating) fillForm(currentReport.value)
    templatesBusy.value = false
  }
}

function warnBeforeUnload(event: BeforeUnloadEvent) {
  if (!dirty.value) return
  event.preventDefault()
}

onMounted(() => window.addEventListener('beforeunload', warnBeforeUnload))
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
  if (signed.value) return
  form.description = acceptedFindings.value
    .map(finding => `${finding.label}：${finding.description}`)
    .join('\n\n')
  message.value = 'Confirmed and modified findings added. Review the text before signing.'
}

function requestSigning() {
  error.value = ''
  if (signed.value || busy.value) return
  if (!activeExamination.value || !store.selectedPatientId) {
    error.value = 'Select an examination first.'
    return
  }
  if (!form.diagnosis.trim() || !form.description.trim()) {
    error.value = 'Enter a diagnosis and description before signing.'
    return
  }
  if (activeTemplate.value) {
    const missing = activeTemplate.value.fields.filter(field => field.required && !structuredData[field.key])
    if (missing.length) {
      error.value = t('ui.reportTemplate.requiredFields', { fields: missing.map(field => field.label).join(', ') })
      return
    }
  }
  signConfirm.value = true
}

async function saveReport(reviewed: boolean) {
  if (busy.value || signed.value) return
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
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Save failed. Please try again.'
  } finally {
    busy.value = false
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
          {{ $t(signed ? 'Signed' : dirty ? 'Unsaved changes' : 'Draft') }}
        </span>
      </div>

      <div class="report-context">
        <span>{{ store.selectedPatient?.name }} · {{ store.selectedPatientId }}</span>
        <select v-model="store.activeExamId" class="select" :aria-label="$t('Report examination')" :disabled="busy || dirty">
          <option v-for="examination in store.examinations" :key="examination.id" :value="examination.id">
            {{ examination.type }} · {{ examination.organ }} · {{ examination.date }}
          </option>
        </select>
      </div>

      <form class="card-body report-form" @submit.prevent="requestSigning">
        <p v-if="signed" class="immutable-note">{{ $t('ui.report.immutableNote') }}</p>
        <div class="document-field">
          <label class="label" for="report-template">{{ $t('ui.reportTemplate.template') }}</label>
          <select id="report-template" v-model="selectedTemplateId" class="select" :disabled="busy || signed || templatesBusy">
            <option value="">{{ $t('ui.reportTemplate.selectTemplate') }}</option>
            <option v-for="template in matchingTemplates" :key="template.id" :value="template.id">
              {{ template.name }} · v{{ template.version }}
            </option>
          </select>
          <small v-if="templatesBusy" class="muted">{{ $t('ui.reportTemplate.loading') }}</small>
        </div>
        <StructuredReportFields
          v-if="activeTemplate"
          v-model="structuredData"
          class="document-field structured-report-fields"
          :fields="activeTemplate.fields"
          :disabled="busy || signed"
        />
        <p v-else class="muted">{{ $t('ui.reportTemplate.noTemplate') }}</p>
        <div class="document-field">
          <label class="label" for="diagnosis">{{ $t('Final diagnosis') }}</label>
          <textarea id="diagnosis" v-model="form.diagnosis" class="textarea" rows="2" maxlength="10000" :placeholder="$t('Write your clinical impression...')" :disabled="busy || signed" />
        </div>
        <div class="document-field">
          <label class="label" for="description">{{ $t('Description') }}</label>
          <textarea id="description" v-model="form.description" class="textarea" rows="5" maxlength="30000" :placeholder="$t('Describe the imaging findings...')" :disabled="busy || signed" />
          <button v-if="acceptedFindings.length && !signed" type="button" class="findings-link" :disabled="busy" @click="includeFindings">
            {{ $t('Use reviewed AI findings') }}
          </button>
        </div>
        <div class="document-field">
          <label class="label" for="recommendation">{{ $t('Recommendation') }}</label>
          <textarea id="recommendation" v-model="form.recommendation" class="textarea" rows="3" maxlength="10000" :placeholder="$t('Add follow-up recommendations...')" :disabled="busy || signed" />
        </div>
        <div class="form-actions">
          <button v-if="!signed" type="submit" class="btn btn-primary" :disabled="busy || !form.diagnosis.trim() || !form.description.trim()">
            <Check :size="16" /> {{ $t(busy ? 'Saving...' : 'Mark reviewed and sign') }}
          </button>
          <button v-if="!signed" type="button" class="btn btn-secondary" :disabled="busy || !dirty" @click="saveReport(false)">
            <Save :size="16" /> {{ $t('Save draft') }}
          </button>
          <button v-if="!signed" type="button" class="btn btn-secondary" :disabled="busy || !dirty" @click="resetForm">
            <RotateCcw :size="16" /> {{ $t('Reset') }}
          </button>
          <button v-else type="button" class="btn btn-secondary" :disabled="addendumBusy" @click="addendumOpen = !addendumOpen">
            <MessageSquarePlus :size="16" /> {{ $t('ui.report.addAddendum') }}
          </button>
        </div>
        <p v-if="message" class="save-message" role="status">{{ $t(message) }}</p>
        <p v-if="error" class="error-message" role="alert">{{ $t(error) }}</p>
      </form>

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
          <button type="button" class="btn btn-primary" :disabled="busy" @click="saveReport(true)">
            <Check :size="16" /> {{ $t(busy ? 'ui.report.signing' : 'ui.report.confirmSign') }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.report-layout{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(300px,.75fr);align-items:start;gap:18px}.editor-section{overflow:hidden;border:0;border-radius:16px;box-shadow:0 8px 32px rgb(28 65 64 / 5%)}.editor-section .card-header{align-items:flex-start;padding:28px 30px 22px;border-bottom:0;background:linear-gradient(120deg,#edf7f4,#fff)}.editor-section h3{display:flex;align-items:center;gap:10px;margin:8px 0;font-size:23px;font-weight:650}.report-eyebrow{color:var(--accent-strong);font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}.sign-status{display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:999px;background:#f8efe4;color:#a56b25;font-size:11px;font-weight:700}.sign-status.signed{background:#e6f1eb;color:#3f7d5d}.report-context{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 30px;border-bottom:1px solid var(--border);color:var(--text-muted);font-size:12px}.report-context .select{width:auto;max-width:60%}.editor-section .report-form{display:flex;flex-direction:column;padding:8px 30px 28px}.immutable-note{margin:18px 0 0;padding:11px 13px;border-radius:8px;background:#eef5f3;color:var(--accent-strong);font-size:12px}.document-field{padding:22px 0;border-bottom:1px solid var(--border)}.document-field .label{color:var(--accent-strong);font-size:11px;letter-spacing:.06em;text-transform:uppercase}.document-field .textarea{display:block;min-height:0;padding:10px 0;border:0;border-radius:0;background:transparent;box-shadow:none;font-size:14px;line-height:1.9;resize:vertical}.document-field .textarea:focus{box-shadow:0 2px 0 var(--accent)}.findings-link{padding:4px 0;border:0;background:transparent;color:var(--accent-strong);font-size:12px;text-decoration:underline}.form-actions{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding-top:24px}.save-message{color:var(--green);font-size:12px}.error-message{color:var(--red);font-size:12px}.preview-section{display:flex;flex-direction:column;gap:12px}.preview-note{margin:0;color:var(--text-muted);font-size:12px}.addendum-editor{display:grid;gap:14px;padding:22px 30px;border-top:1px solid var(--border);background:var(--surface-2)}.addendum-editor>div{display:flex;align-items:center;justify-content:space-between}.addendum-editor h4{margin:0}.addendum-editor>div button{display:grid;place-items:center;border:0;background:transparent;color:var(--text-muted)}.addendum-editor .label{display:grid;gap:7px}.addendum-editor>.btn{justify-self:start}.confirm-backdrop{position:fixed;z-index:120;inset:0;display:grid;place-items:center;padding:20px;background:rgb(12 34 38 / 55%)}.sign-confirm{width:min(480px,100%);padding:26px;border-radius:14px;background:white;box-shadow:0 24px 80px #102d3455}.sign-confirm h3{margin-top:0}.sign-confirm p{color:var(--text-muted);font-size:13px;line-height:1.7}.sign-confirm>div{display:flex;justify-content:flex-end;gap:10px;margin-top:22px}
.structured-report-fields{padding:22px 0;border-bottom:1px solid var(--border)}
@media(max-width:1000px){.report-layout{grid-template-columns:1fr}}@media(max-width:600px){.editor-section .card-header,.editor-section .report-form,.report-context,.addendum-editor{padding-right:18px;padding-left:18px}.report-context{align-items:stretch;flex-direction:column}.report-context .select{width:100%;max-width:none}.sign-confirm>div{align-items:stretch;flex-direction:column-reverse}}
</style>
