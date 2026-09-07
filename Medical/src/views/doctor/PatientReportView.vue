<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Check, FileCheck2, RotateCcw } from 'lucide-vue-next'
import { usePatientStore } from '@/stores/patients'
import ReportCard from '@/components/medical/ReportCard.vue'
import type { Report } from '@/types'

const store = usePatientStore()

const activeExamId = computed(() => store.examinations[0]?.id)
const currentReport = computed(() =>
  store.reports.find((report) => report.examinationId === activeExamId.value),
)

const form = reactive({
  diagnosis: '',
  description: '',
  recommendation: '',
})

const saved = ref(false)

function fillForm(report?: Report) {
  form.diagnosis = report?.diagnosis ?? ''
  form.description = report?.description ?? ''
  form.recommendation = report?.recommendation ?? ''
  saved.value = false
}

watch(currentReport, fillForm, { immediate: true })

async function saveReport() {
  if (!currentReport.value || !activeExamId.value) return
  const updated: Report = {
    ...currentReport.value,
    diagnosis: form.diagnosis,
    description: form.description,
    recommendation: form.recommendation,
    doctor: store.selectedPatient ? 'Dr. Zhang Wei' : currentReport.value.doctor,
    date: '2026-09-07',
    reviewed: true,
  }
  await store.saveReport(updated)
  saved.value = true
}
</script>

<template>
  <div class="report-layout">
    <section class="editor-section card">
      <div class="card-header">
        <div>
          <h3>Doctor Review</h3>
          <p class="muted">Finalize the report before it becomes visible to the patient.</p>
        </div>
        <span :class="['sign-status', { signed: currentReport?.reviewed || saved }]">
          <FileCheck2 :size="15" />
          {{ currentReport?.reviewed || saved ? 'Reviewed' : 'Draft' }}
        </span>
      </div>
      <div class="card-body report-form">
        <div>
          <label class="label" for="diagnosis">Final diagnosis</label>
          <textarea id="diagnosis" v-model="form.diagnosis" class="textarea" />
        </div>
        <div>
          <label class="label" for="description">Description</label>
          <textarea id="description" v-model="form.description" class="textarea" />
        </div>
        <div>
          <label class="label" for="recommendation">Recommendation</label>
          <textarea id="recommendation" v-model="form.recommendation" class="textarea" />
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-primary" @click="saveReport">
            <Check :size="16" /> Mark reviewed and sign
          </button>
          <button type="button" class="btn btn-secondary" @click="fillForm(currentReport)">
            <RotateCcw :size="16" /> Reset
          </button>
          <span v-if="saved" class="save-message">Report saved for patient viewing.</span>
        </div>
      </div>
    </section>

    <aside class="preview-section">
      <div class="section-heading">
        <h3>Patient-facing preview</h3>
      </div>
      <ReportCard v-if="currentReport" :report="currentReport" />
      <div v-else class="card empty-state">No report has been drafted.</div>
    </aside>
  </div>
</template>

<style scoped>
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
