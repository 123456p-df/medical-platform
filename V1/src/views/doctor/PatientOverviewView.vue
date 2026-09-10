<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePatientStore } from '@/stores/patients'
import PatientTimeline from '@/components/patient/PatientTimeline.vue'
import MedicalRecordCard from '@/components/medical/MedicalRecordCard.vue'
import AIResultCard from '@/components/medical/AIResultCard.vue'
import ReportCard from '@/components/medical/ReportCard.vue'
import type { Examination } from '@/types'

const route = useRoute()
const router = useRouter()
const store = usePatientStore()

const patientId = computed(() => String(route.params.id))
const latestExamination = computed(() => store.examinations[0])
const latestFindings = computed(() =>
  latestExamination.value
    ? store.findings.filter((finding) => finding.examinationId === latestExamination.value?.id)
    : [],
)
const latestReport = computed(() =>
  latestExamination.value
    ? store.reports.find((report) => report.examinationId === latestExamination.value?.id)
    : undefined,
)

function openImaging(examination: Examination) {
  router.push({
    name: 'doctor-patient-imaging',
    params: { id: patientId.value },
    query: { exam: examination.id },
  })
}

</script>

<template>
  <div class="overview-grid">
    <section class="main-column">
      <div class="card">
        <div class="card-header">
          <div>
            <h3>{{ $t("Examination Timeline") }}</h3>
            <p class="muted">{{ $t("Historical studies for") }} {{ $t(store.selectedPatient?.name) }}</p>
          </div>
        </div>
        <div class="card-body">
          <PatientTimeline :examinations="store.examinations" @select="openImaging" />
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <h3>{{ $t("AI Findings") }}</h3>
            <p class="muted">{{ $t("External AI output shown for clinical review.") }}</p>
          </div>
          <button
            type="button"
            class="btn btn-sm btn-secondary"
            @click="router.push({ name: 'doctor-patient-ai', params: { id: patientId } })"
          > {{ $t("Review all") }} </button>
        </div>
        <div class="card-body stack">
          <div v-if="latestFindings.length" class="finding-grid">
            <AIResultCard
              v-for="finding in latestFindings"
              :key="finding.id"
              :finding="finding"
            />
          </div>
          <div v-else class="empty-state">{{ $t("No AI findings for the latest examination.") }}</div>
        </div>
      </div>
    </section>

    <aside class="side-column">
      <div v-if="store.selectedPatient">
        <div class="section-heading">
          <h3>{{ $t("Patient Information") }}</h3>
        </div>
        <MedicalRecordCard :patient="store.selectedPatient" />
      </div>

      <div class="card report-block">
        <div class="card-header">
          <div>
            <h3>{{ $t("Doctor Report") }}</h3>
            <p class="muted">{{ $t("Latest clinical summary.") }}</p>
          </div>
        </div>
        <div class="card-body">
          <ReportCard v-if="latestReport" :report="latestReport" />
          <div v-else class="empty-state">{{ $t("No report has been drafted.") }}</div>
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  align-items: start;
  gap: 18px;
}

.main-column,
.side-column {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.finding-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.report-block {
  margin-top: 18px;
}

@media (max-width: 1000px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }

  .side-column {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .report-block {
    margin-top: 0;
  }
}

@media (max-width: 720px) {
  .finding-grid,
  .side-column {
    grid-template-columns: 1fr;
  }
}
</style>
