<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Check, FileCheck2, PenLine, RotateCcw, Save } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { usePatientStore } from '@/stores/patients'
import ReportCard from '@/components/medical/ReportCard.vue'
import { locale, t } from '@/i18n'
import type { Report } from '@/types'

const auth = useAuthStore()
const store = usePatientStore()
const activeExamination = computed(() =>
  store.examinations.find(examination => examination.id === store.activeExamId) || store.examinations[0],
)
const currentReport = computed(() =>
  store.reports.find(report => report.examinationId === activeExamination.value?.id),
)
const form = reactive({ diagnosis: '', description: '', recommendation: '' })
const baseline = reactive({ diagnosis: '', description: '', recommendation: '' })
const busy = ref(false)
const message = ref('')
const error = ref('')
const dirty = computed(() =>
  form.diagnosis !== baseline.diagnosis ||
  form.description !== baseline.description ||
  form.recommendation !== baseline.recommendation,
)
const signed = computed(() => Boolean(currentReport.value?.reviewed && !dirty.value))
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
  doctor: currentReport.value?.doctor || auth.session?.name || '',
  date: currentReport.value?.date || new Date().toLocaleDateString('en-CA'),
  reviewed: signed.value,
}))

function fillForm(report?: Report) {
  form.diagnosis = t(report?.diagnosis || '')
  form.description = t(report?.description || '')
  form.recommendation = t(report?.recommendation || '')
  Object.assign(baseline, form)
  message.value = ''
  error.value = ''
}

watch([currentReport, activeExamination], () => fillForm(currentReport.value), { immediate: true })
watch(locale, () => { if (!dirty.value) fillForm(currentReport.value) })

function resetForm() {
  fillForm(currentReport.value)
  message.value = currentReport.value ? 'Restored the last saved report.' : 'Draft cleared.'
}

function includeFindings() {
  form.description = acceptedFindings.value
    .map(finding => `${t(finding.label)}：${t(finding.description)}`)
    .join('\n\n')
  message.value = 'Confirmed and modified findings added. Review the text before signing.'
}

async function saveReport(reviewed: boolean) {
  if (busy.value) return
  message.value = ''
  error.value = ''
  if (!activeExamination.value || !store.selectedPatientId) {
    error.value = 'Select an examination first.'
    return
  }
  if (reviewed && (!form.diagnosis.trim() || !form.description.trim())) {
    error.value = 'Enter a diagnosis and description before signing.'
    return
  }
  busy.value = true
  try {
    const saved = await store.saveReport({
      ...preview.value,
      diagnosis: form.diagnosis.trim(),
      description: form.description.trim(),
      recommendation: form.recommendation.trim(),
      doctor: auth.session?.name || '',
      date: new Date().toLocaleDateString('en-CA'),
      reviewed,
    })
    fillForm(saved)
    message.value = reviewed ? 'Report signed and available in the patient portal.' : 'Draft saved.'
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Save failed. Please try again.'
  } finally {
    busy.value = false
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
        <select v-model="store.activeExamId" class="select" :aria-label="$t('Report examination')" :disabled="busy">
          <option v-for="examination in store.examinations" :key="examination.id" :value="examination.id">
            {{ examination.type }} · {{ examination.organ }} · {{ examination.date }}
          </option>
        </select>
      </div>

      <form class="card-body report-form" @submit.prevent="saveReport(true)">
        <div class="document-field">
          <label class="label" for="diagnosis">{{ $t('Final diagnosis') }}</label>
          <textarea id="diagnosis" v-model="form.diagnosis" class="textarea" rows="2" maxlength="10000" :placeholder="$t('Write your clinical impression...')" :disabled="busy" />
        </div>
        <div class="document-field">
          <label class="label" for="description">{{ $t('Description') }}</label>
          <textarea id="description" v-model="form.description" class="textarea" rows="5" maxlength="30000" :placeholder="$t('Describe the imaging findings...')" :disabled="busy" />
          <button v-if="acceptedFindings.length" type="button" class="findings-link" :disabled="busy" @click="includeFindings">
            {{ $t('Use reviewed AI findings') }}
          </button>
        </div>
        <div class="document-field">
          <label class="label" for="recommendation">{{ $t('Recommendation') }}</label>
          <textarea id="recommendation" v-model="form.recommendation" class="textarea" rows="3" maxlength="10000" :placeholder="$t('Add follow-up recommendations...')" :disabled="busy" />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="busy || signed">
            <Check :size="16" /> {{ $t(busy ? 'Saving...' : signed ? 'Signed' : 'Mark reviewed and sign') }}
          </button>
          <button type="button" class="btn btn-secondary" :disabled="busy || signed || currentReport?.reviewed" @click="saveReport(false)">
            <Save :size="16" /> {{ $t('Save draft') }}
          </button>
          <button type="button" class="btn btn-secondary" :disabled="busy" @click="resetForm">
            <RotateCcw :size="16" /> {{ $t('Reset') }}
          </button>
        </div>
        <p v-if="message" class="save-message" role="status">{{ $t(message) }}</p>
        <p v-if="error" class="error-message" role="alert">{{ $t(error) }}</p>
      </form>
    </section>

    <aside class="preview-section">
      <div class="section-heading"><h3>{{ $t('Live preview') }}</h3></div>
      <ReportCard :report="preview" />
      <p class="preview-note">{{ $t('The patient sees this report after you sign it.') }}</p>
    </aside>
  </div>
</template>

<style scoped>
.report-layout { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(300px, .75fr); align-items: start; gap: 18px; }
.editor-section { overflow: hidden; border: 0; border-radius: 16px; box-shadow: 0 8px 32px rgb(28 65 64 / 5%); }
.editor-section .card-header { align-items: flex-start; padding: 28px 30px 22px; border-bottom: 0; background: linear-gradient(120deg, #edf7f4, #fff); }
.editor-section h3 { display: flex; align-items: center; gap: 10px; margin: 8px 0; font-size: 23px; font-weight: 650; }
.report-eyebrow { color: var(--accent-strong); font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.sign-status { display: inline-flex; align-items: center; gap: 6px; padding: 5px 9px; border-radius: 999px; background: #f8efe4; color: #a56b25; font-size: 11px; font-weight: 700; }
.sign-status.signed { background: #e6f1eb; color: #3f7d5d; }
.report-context { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 14px 30px; border-bottom: 1px solid var(--border); color: var(--text-muted); font-size: 12px; }
.report-context .select { width: auto; max-width: 60%; }
.editor-section .report-form { display: flex; flex-direction: column; padding: 8px 30px 28px; }
.document-field { padding: 22px 0; border-bottom: 1px solid var(--border); }
.document-field .label { color: var(--accent-strong); font-size: 11px; letter-spacing: .06em; text-transform: uppercase; }
.document-field .textarea { display: block; min-height: 0; padding: 10px 0; border: 0; border-radius: 0; background: transparent; box-shadow: none; font-size: 14px; line-height: 1.9; resize: vertical; }
.document-field .textarea:focus { box-shadow: 0 2px 0 var(--accent); }
.findings-link { padding: 4px 0; border: 0; background: transparent; color: var(--accent-strong); font-size: 12px; text-decoration: underline; }
.form-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding-top: 24px; }
.save-message { color: var(--green); font-size: 12px; }
.error-message { color: var(--red); font-size: 12px; }
.preview-section { display: flex; flex-direction: column; gap: 12px; }
.preview-note { margin: 0; color: var(--text-muted); font-size: 12px; }
@media (max-width: 1000px) { .report-layout { grid-template-columns: 1fr; } }
@media (max-width: 600px) {
  .editor-section .card-header, .editor-section .report-form, .report-context { padding-right: 18px; padding-left: 18px; }
  .report-context { align-items: stretch; flex-direction: column; }
  .report-context .select { width: 100%; max-width: none; }
}
</style>
