<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Activity, CalendarDays, ChevronRight, FileText, HeartPulse } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePatientStore } from '@/stores/patients'
import PageHeader from '@/components/layout/PageHeader.vue'
import ExaminationCard from '@/components/medical/ExaminationCard.vue'
import ReportCard from '@/components/medical/ReportCard.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const router = useRouter()
const auth = useAuthStore()
const store = usePatientStore()
const patientId = computed(() => auth.session?.id ?? '')
const latestExam = computed(() => store.examinations[0])
const latestReviewedReport = computed(() => store.reviewedReports[0])

function formatDate(date?: string) {
  if (!date) return ''
  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function openExam(examId: string) {
  router.push({ name: 'patient-examination-detail', params: { id: examId } })
}

onMounted(async () => {
  if (!store.patients.length) await store.loadPatients()
  await store.loadPatientContext(patientId.value)
})
</script>

<template>
  <div class="page">
    <PageHeader
      title="My Health"
      :subtitle="`Good morning, ${auth.session?.name ?? 'Patient'}. Here is your health overview.`"
    />

    <section class="patient-hero">
      <article class="health-overview card">
        <div class="card-header">
          <div>
            <h3>My Health Overview</h3>
            <p class="muted">Your most recent uploaded medical image.</p>
          </div>
        </div>
        <div class="card-body">
          <div v-if="latestExam" class="latest-exam">
            <span class="health-icon"><HeartPulse :size="23" /></span>
            <div class="latest-exam-copy">
              <span class="kicker">{{ latestExam.type }} · {{ latestExam.bodyPart }}</span>
              <h2>{{ latestExam.organ }}</h2>
              <p>{{ formatDate(latestExam.date) }}</p>
            </div>
            <StatusBadge status="Available" />
          </div>
          <div class="health-actions">
            <button type="button" class="btn btn-primary" @click="router.push({ name: 'patient-reports' })">
              <FileText :size="16" /> View Reports
            </button>
            <button type="button" class="btn btn-secondary" @click="router.push({ name: 'patient-body' })">
              <Activity :size="16" /> My Body
            </button>
          </div>
        </div>
      </article>
    </section>

    <section class="patient-lower-grid">
      <div class="card">
        <div class="card-header">
          <div>
            <h3>Recent Examinations</h3>
            <p class="muted">Your imaging history in one place.</p>
          </div>
          <button type="button" class="btn btn-sm btn-secondary" @click="router.push({ name: 'patient-examinations' })">
            View all <ChevronRight :size="14" />
          </button>
        </div>
        <div class="card-body stack">
          <ExaminationCard
            v-for="exam in store.examinations.slice(0, 3)"
            :key="exam.id"
            :examination="exam"
            @select="openExam(exam.id)"
          />
          <div v-if="!store.examinations.length" class="empty-state">No examinations are available.</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <h3>Doctor's Report</h3>
            <p class="muted">Your latest medical record from an authorized doctor.</p>
          </div>
          <CalendarDays :size="18" class="header-icon" />
        </div>
        <div class="card-body">
          <ReportCard v-if="latestReviewedReport" :report="latestReviewedReport" patient-facing />
          <div v-else class="empty-state">Your medical records will appear here.</div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.patient-hero {
  margin-bottom: 18px;
}

.latest-exam {
  display: flex;
  align-items: center;
  gap: 16px;
}

.health-icon {
  display: grid;
  width: 58px;
  height: 58px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 12px;
  background: #e8eef9;
  color: var(--blue);
}

.latest-exam-copy {
  min-width: 0;
  flex: 1;
}

.latest-exam-copy .kicker {
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 760;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.latest-exam-copy h2 {
  margin: 4px 0 1px;
  font-size: 26px;
}

.latest-exam-copy p {
  margin: 0;
  color: var(--text-muted);
  font-size: 12px;
}

.health-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}

.patient-lower-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
  align-items: start;
  gap: 18px;
}

.header-icon {
  color: var(--text-muted);
}

@media (max-width: 1000px) {
  .patient-lower-grid {
    grid-template-columns: 1fr;
  }
}
</style>
