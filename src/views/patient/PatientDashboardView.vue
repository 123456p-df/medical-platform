<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Activity, CalendarDays, ChevronRight, FileText, HeartPulse } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePatientStore } from '@/stores/patients'
import PageHeader from '@/components/layout/PageHeader.vue'
import DigitalHumanViewer from '@/components/3d/DigitalHumanViewer.vue'
import ExaminationCard from '@/components/medical/ExaminationCard.vue'
import ReportCard from '@/components/medical/ReportCard.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { locale } from '@/i18n'

const router = useRouter()
const auth = useAuthStore()
const store = usePatientStore()
const selectedOrganId = ref<string | null>(null)

const patientId = computed(() => auth.session?.id ?? '')
const latestExam = computed(() => store.examinations[0])
const latestReviewedReport = computed(() => store.reviewedReports[0])

function formatDate(date?: string) {
  if (!date) return ''
  return new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en', {
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
      :title="$t('My Health')"
      :subtitle="$t('Good morning, {name}. Here is your health overview.', { name: auth.session?.name ?? $t('Patient') })"
    />

    <section class="patient-hero-grid">
      <article class="health-overview card">
        <div class="card-header">
          <div>
            <h3>{{ $t('My Health Overview') }}</h3>
            <p class="muted">{{ $t('Your most recent uploaded medical image.') }}</p>
          </div>
        </div>
        <div class="card-body">
          <div v-if="latestExam" class="latest-exam">
            <span class="health-icon"><HeartPulse :size="23" /></span>
            <div class="latest-exam-copy">
              <span class="kicker">{{ latestExam.type }} · {{ $t(latestExam.bodyPart) }}</span>
              <h2>{{ $t(latestExam.organ) }}</h2>
              <p>{{ formatDate(latestExam.date) }}</p>
            </div>
            <StatusBadge status="Available" />
          </div>
          <div class="health-actions">
            <button type="button" class="btn btn-primary" @click="router.push({ name: 'patient-reports' })">
              <FileText :size="16" /> {{ $t('View Reports') }}
            </button>
            <button type="button" class="btn btn-secondary" @click="router.push({ name: 'patient-body' })">
              <Activity :size="16" /> {{ $t('My Body') }}
            </button>
          </div>
        </div>
      </article>

      <article class="body-preview card">
        <div class="card-header">
          <div>
            <h3>{{ $t('My Body') }}</h3>
            <p class="muted">{{ $t('Understand your body, starting with your lungs.') }}</p>
          </div>
        </div>
        <div class="card-body body-preview-content">
          <DigitalHumanViewer
            compact
            :selected-organ-id="selectedOrganId"
            @select="router.push({ name: 'patient-body' })"
          />
        </div>
      </article>
    </section>

    <section class="patient-lower-grid">
      <div class="card">
        <div class="card-header">
          <div>
            <h3>{{ $t('Recent Examinations') }}</h3>
            <p class="muted">{{ $t('Your imaging history in one place.') }}</p>
          </div>
          <button type="button" class="btn btn-sm btn-secondary" @click="router.push({ name: 'patient-examinations' })">
            {{ $t('View all') }} <ChevronRight :size="14" />
          </button>
        </div>
        <div class="card-body stack">
          <ExaminationCard
            v-for="exam in store.examinations.slice(0, 3)"
            :key="exam.id"
            :examination="exam"
            @select="openExam(exam.id)"
          />
          <div v-if="!store.examinations.length" class="empty-state">{{ $t('No examinations are available.') }}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <h3>{{ $t("Doctor's Report") }}</h3>
            <p class="muted">{{ $t('Your latest medical record from an authorized doctor.') }}</p>
          </div>
          <CalendarDays :size="18" class="header-icon" />
        </div>
        <div class="card-body">
          <ReportCard v-if="latestReviewedReport" :report="latestReviewedReport" patient-facing />
          <div v-else class="empty-state">{{ $t('Your medical records will appear here.') }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.patient-hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 18px;
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

.body-preview-content {
  padding: 0;
}

.body-preview-content :deep(.digital-human) {
  border: 0;
  border-radius: 0 0 var(--radius) var(--radius);
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
  .patient-hero-grid,
  .patient-lower-grid {
    grid-template-columns: 1fr;
  }
}
</style>
