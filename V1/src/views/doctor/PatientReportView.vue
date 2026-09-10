<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Check, FileCheck2, RotateCcw, Save, PenLine } from 'lucide-vue-next'
import { usePatientStore } from '@/stores/patients'
import { useAuthStore } from '@/stores/auth'
import ReportCard from '@/components/medical/ReportCard.vue'
import type { Report } from '@/types'
import { t, locale } from '@/i18n'

const store = usePatientStore()
const auth = useAuthStore()

const activeExamId = computed(() => store.activeExamId ?? store.examinations[0]?.id)
const currentReport = computed(() =>
  store.reports.find((report) => report.examinationId === activeExamId.value),
)

const form = reactive({
  diagnosis: '',
  description: '',
  recommendation: '',
})

const busy = ref(false)
const message = ref('')
const error = ref('')
const baseline = reactive({ diagnosis: '', description: '', recommendation: '' })
const dirty = computed(() => form.diagnosis !== baseline.diagnosis || form.description !== baseline.description || form.recommendation !== baseline.recommendation)
const signed = computed(() => Boolean(currentReport.value?.reviewed && !dirty.value))
const preview = computed<Report>(() => ({
  id: currentReport.value?.id ?? `R-${activeExamId.value}`,
  patientId: store.selectedPatientId ?? '',
  examinationId: activeExamId.value ?? '',
  ...form,
  doctor: currentReport.value?.doctor ?? auth.session?.name ?? '',
  date: currentReport.value?.date ?? new Date().toLocaleDateString('en-CA'),
  reviewed: signed.value,
}))
const acceptedFindings = computed(() => store.findings.filter((finding) => finding.examinationId === activeExamId.value && ['confirmed', 'modified'].includes(finding.status)))

function fillForm(report?: Report) {
  form.diagnosis = t(report?.diagnosis ?? '')
  form.description = t(report?.description ?? '')
  form.recommendation = t(report?.recommendation ?? '')
  Object.assign(baseline, form)
  message.value = ''
  error.value = ''
}

watch([currentReport, activeExamId], () => fillForm(currentReport.value), { immediate: true })
watch(locale, () => { if (!dirty.value) fillForm(currentReport.value) })

function resetForm() {
  fillForm(currentReport.value)
  message.value = currentReport.value ? 'Restored the last saved report.' : 'Draft cleared.'
}

function includeFindings() {
  form.description = acceptedFindings.value.map((finding) => `${t(finding.label)}: ${t(finding.description)}`).join('\n\n')
  message.value = 'Confirmed and modified findings added. Review the text before signing.'
}

async function saveReport(reviewed: boolean) {
  if (busy.value) return
  message.value = ''
  error.value = ''
  if (!activeExamId.value || !store.selectedPatientId) { error.value = 'Select an examination first.'; return }
  if (reviewed && (!form.diagnosis.trim() || !form.description.trim())) { error.value = 'Enter a diagnosis and description before signing.'; return }
  busy.value = true
  const updated: Report = {
    ...preview.value,
    diagnosis: form.diagnosis.trim(),
    description: form.description.trim(),
    recommendation: form.recommendation.trim(),
    doctor: auth.session?.name ?? '',
    date: new Date().toLocaleDateString('en-CA'),
    reviewed,
  }
  try {
    await store.saveReport(updated)
    fillForm(updated)
    message.value = reviewed ? 'Report signed and available in the patient portal.' : 'Draft saved.'
  } catch {
    error.value = 'Save failed. Please try again.'
  } finally { busy.value = false }
}
</script>

<template>
  <div class="report-layout">
    <section class="editor-section card">
      <div class="card-header">
        <div>
          <span class="report-eyebrow">{{ $t("Clinical report") }}</span>
          <h3><PenLine :size="22" /> {{ $t("Doctor Review") }}</h3>
          <p class="muted">{{ $t("Review, refine, and sign your clinical assessment.") }}</p>
        </div>
        <span :class="['sign-status', { signed }]">
          <FileCheck2 :size="15" />
          {{ $t(signed ? 'Signed' : dirty ? 'Unsaved changes' : 'Draft') }}
        </span>
      </div>
      <div class="report-context">
        <span>{{ $t(store.selectedPatient?.name) }} · {{ $t(store.selectedPatientId) }}</span>
        <select v-model="store.activeExamId" class="select" :aria-label="$t('Report examination')" :disabled="busy">
          <option v-for="exam in store.examinations" :key="exam.id" :value="exam.id">{{ $t(exam.type) }} · {{ $t(exam.date) }}</option>
        </select>
      </div>
      <form class="card-body report-form" @submit.prevent="saveReport(true)">
        <div class="document-field">
          <label class="label" for="diagnosis">{{ $t("Final diagnosis") }}</label>
          <textarea id="diagnosis" v-model="form.diagnosis" class="textarea" rows="2" :placeholder="$t('Write your clinical impression...')" :disabled="busy" />
        </div>
        <div class="document-field">
          <label class="label" for="description">{{ $t("Description") }}</label>
          <textarea id="description" v-model="form.description" class="textarea" rows="5" :placeholder="$t('Describe the imaging findings...')" :disabled="busy" />
          <button v-if="acceptedFindings.length" type="button" class="findings-link" :disabled="busy" @click="includeFindings">{{ $t("Use reviewed AI findings") }}</button>
        </div>
        <div class="document-field">
          <label class="label" for="recommendation">{{ $t("Recommendation") }}</label>
          <textarea id="recommendation" v-model="form.recommendation" class="textarea" rows="3" :placeholder="$t('Add follow-up recommendations...')" :disabled="busy" />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="busy || signed">
            <Check :size="16" /> {{ $t(busy ? 'Saving...' : signed ? 'Signed' : 'Mark reviewed and sign') }}
          </button>
          <button type="button" class="btn btn-secondary" :disabled="busy || signed" @click="saveReport(false)"><Save :size="16" /> {{ $t("Save draft") }}</button>
          <button type="button" class="btn btn-secondary" :disabled="busy" @click="resetForm">
            <RotateCcw :size="16" /> {{ $t("Reset") }} </button>
        </div>
        <p v-if="message" class="save-message" role="status">{{ $t(message) }}</p>
        <p v-if="error" class="error-message" role="alert">{{ $t(error) }}</p>
      </form>
    </section>

    <aside class="preview-section">
      <div class="section-heading">
          <h3>{{ $t("Live preview") }}</h3>
      </div>
      <ReportCard :report="preview" />
      <p class="preview-note">{{ $t("The patient sees this report after you sign it.") }}</p>
    </aside>
  </div>
</template>

<style scoped>
.editor-section { border: 0; border-radius: 16px; box-shadow: 0 8px 32px rgb(28 65 64 / 5%); overflow: hidden; }
.editor-section .card-header { align-items: flex-start; padding: 28px 30px 22px; background: linear-gradient(120deg, #edf7f4, #fff); border-bottom: 0; }
.editor-section h3 { display: flex; align-items: center; gap: 10px; font-size: 23px; font-weight: 650; margin: 8px 0; }
.report-eyebrow { color: var(--accent-strong); letter-spacing: .12em; text-transform: uppercase; font-size: 10px; font-weight: 700; }
.report-context { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 14px 30px; border-bottom: 1px solid var(--border); color: var(--text-muted); font-size: 12px; }
.report-context .select { width: auto; max-width: 55%; }
.editor-section .report-form { padding: 8px 30px 28px; gap: 0; }
.document-field { padding: 22px 0; border-bottom: 1px solid var(--border); }
.document-field .label { text-transform: uppercase; font-size: 11px; letter-spacing: .06em; color: var(--accent-strong); }
.document-field .textarea { display: block; min-height: 0; padding: 10px 0; background: transparent; border: 0; border-radius: 0; box-shadow: none; font-size: 14px; line-height: 1.9; resize: vertical; }
.document-field .textarea:focus { box-shadow: 0 2px 0 var(--accent); }
.editor-section .form-actions { padding-top: 24px; }
.findings-link { padding: 4px 0; border: 0; background: transparent; color: var(--accent-strong); font-size: 12px; text-decoration: underline; }
.preview-note { margin: 0; color: var(--text-muted); font-size: 12px; }
.error-message { color: var(--red); font-size: 12px; }
@media (max-width: 600px) { .editor-section .card-header, .editor-section .report-form, .report-context { padding-left: 18px; padding-right: 18px; } .report-context { flex-wrap: wrap; } }
.report-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(300px, 0.75fr);
  align-items: start;
  gap: 18px;
}

.sign-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px;
  border-radius: 999px;
  background: #f8efe4;
  color: #a56b25;
  font-size: 11px;
  font-weight: 700;
}

.sign-status.signed {
  background: #e6f1eb;
  color: #3f7d5d;
}

.report-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding-top: 4px;
}

.save-message {
  color: var(--green);
  font-size: 12px;
}

.preview-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 1000px) {
  .report-layout {
    grid-template-columns: 1fr;
  }
}
</style>
