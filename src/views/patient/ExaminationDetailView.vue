<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { ArrowLeft, FileText, Info } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePatientStore } from '@/stores/patients'
import MedicalImageViewer from '@/components/medical/MedicalImageViewer.vue'
import ReportCard from '@/components/medical/ReportCard.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { locale } from '@/i18n'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const store = usePatientStore()

const patientId = computed(() => auth.session?.id ?? '')
const examId = computed(() => String(route.params.id))
const examination = computed(() =>
  store.examinations.find((exam) => exam.id === examId.value),
)
const reviewedReport = computed(() =>
  store.reviewedReports.find((report) => report.examinationId === examId.value) ||
  store.reviewedReports.find((report) => !report.examinationId && report.organId === examination.value?.organId),
)

function formatDate(date?: string) {
  if (!date) return ''
  return new Intl.DateTimeFormat(locale.value === 'zh' ? 'zh-CN' : 'en', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

onMounted(async () => {
  if (!store.examinations.length) {
    await store.loadPatientContext(patientId.value)
  }
})
</script>

<template>
  <div class="page">
    <button type="button" class="back-link" @click="router.push({ name: 'patient-examinations' })">
      <ArrowLeft :size="16" /> {{ $t('My Examinations') }}
    </button>

    <section v-if="examination" class="exam-detail-grid">
      <div class="card viewer-card">
        <div class="card-header">
          <div>
            <h3>{{ examination.type }} · {{ $t(examination.bodyPart) }}</h3>
            <p class="muted">{{ formatDate(examination.date) }}</p>
          </div>
          <StatusBadge :status="examination.status" />
        </div>
        <div class="card-body">
          <MedicalImageViewer :examination="examination" :findings="[]" />
        </div>
      </div>

      <aside class="exam-detail-side">
        <div class="card">
          <div class="card-header">
            <div>
              <h3>{{ $t('About this examination') }}</h3>
            </div>
            <Info :size="18" class="header-icon" />
          </div>
          <div class="card-body">
            <p class="exam-description">{{ examination.description }}</p>
            <dl class="exam-facts">
              <div>
                <dt>{{ $t('Body region') }}</dt>
                <dd>{{ $t(examination.organ) }}</dd>
              </div>
              <div>
                <dt>{{ $t('Imaging type') }}</dt>
                <dd>{{ examination.type }}</dd>
              </div>
              <div>
                <dt>{{ $t('Images') }}</dt>
                <dd>{{ examination.sliceCount }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <h3>{{ $t("Doctor's Report") }}</h3>
              <p class="muted">{{ $t('Latest medical record for this organ.') }}</p>
            </div>
            <FileText :size="18" class="header-icon" />
          </div>
          <div class="card-body">
            <ReportCard v-if="reviewedReport" :report="reviewedReport" patient-facing />
            <div v-else class="empty-state">
              {{ $t('Your doctor is still reviewing this examination.') }}
            </div>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>

<style scoped>
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 14px;
  border: 0;
  background: transparent;
  color: var(--text-soft);
  font-size: 12px;
}

.exam-detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  align-items: start;
  gap: 18px;
}

.viewer-card {
  overflow: hidden;
}

.exam-detail-side {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.header-icon {
  color: var(--text-muted);
}

.exam-description {
  margin: 0;
  color: var(--text-soft);
  font-size: 13px;
}

.exam-facts {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 18px 0 0;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.exam-facts div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.exam-facts dt {
  color: var(--text-muted);
  font-size: 11px;
}

.exam-facts dd {
  margin: 0;
  color: var(--text);
  font-size: 12px;
  font-weight: 620;
}

@media (max-width: 1000px) {
  .exam-detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
