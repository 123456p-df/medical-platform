<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Activity, HeartPulse, ShieldCheck } from 'lucide-vue-next'
import { mockOrganModels } from '@/data/mockData'
import { useAuthStore } from '@/stores/auth'
import { usePatientStore } from '@/stores/patients'
import PageHeader from '@/components/layout/PageHeader.vue'
import DigitalHumanViewer from '@/components/3d/DigitalHumanViewer.vue'
import LungViewer from '@/components/3d/LungViewer.vue'
import OrganCard from '@/components/3d/OrganCard.vue'
import ReportCard from '@/components/medical/ReportCard.vue'

const auth = useAuthStore()
const store = usePatientStore()
const selectedOrganId = ref<string>('lung')
const patientId = computed(() => auth.session?.id ?? 'P20260021')

const selectedOrgan = computed(
  () => mockOrganModels.find((organ) => organ.id === selectedOrganId.value),
)
const latestReviewedReport = computed(() => store.reviewedReports[0])

function selectOrgan(organId: string) {
  selectedOrganId.value = organId
}

onMounted(async () => {
  if (!store.reviewedReports.length) {
    await store.loadPatientContext(patientId.value)
  }
})
</script>

<template>
  <div class="page">
    <PageHeader :title="$t('My Body')" :subtitle="$t('Explore your digital human and understand your body.')" />

    <div class="body-layout">
      <section class="body-viewer card">
        <div class="card-header">
          <div>
            <h3>{{ $t("Digital Human") }}</h3>
            <p class="muted">{{ $t("Select an organ for more information.") }}</p>
          </div>
        </div>
        <div class="card-body body-canvas">
          <DigitalHumanViewer
            :selected-organ-id="selectedOrganId"
            @select="selectOrgan"
          />
        </div>
      </section>

      <aside class="organ-panel">
        <div class="card">
          <div class="card-header">
            <h3>{{ $t("Organs") }}</h3>
          </div>
          <div class="card-body organ-list">
            <OrganCard
              v-for="organ in mockOrganModels"
              :key="organ.id"
              :organ="organ"
              :active="organ.id === selectedOrganId"
              @select="selectOrgan(organ.id)"
            />
          </div>
        </div>
      </aside>
    </div>

    <section v-if="selectedOrganId === 'lung'" class="lung-detail card">
      <div class="card-header">
        <div>
          <h3>{{ $t("Lung Examination") }}</h3>
          <p class="muted">{{ $t("Your latest doctor-reviewed lung information.") }}</p>
        </div>
        <span class="lung-chip"><Activity :size="14" /> {{ $t("Lung") }}</span>
      </div>
      <div class="card-body lung-detail-grid">
        <LungViewer :findings="[]" />
        <div class="lung-report">
          <div class="trust-note">
            <ShieldCheck :size="17" />
            <span>{{ $t("Only doctor-reviewed information is shown.") }}</span>
          </div>
          <ReportCard v-if="latestReviewedReport" :report="latestReviewedReport" patient-facing />
          <div v-else class="empty-state">{{ $t("Your lung report is being reviewed by your doctor.") }}</div>
        </div>
      </div>
    </section>

    <section v-else class="organ-detail card">
      <div class="organ-detail-icon"><HeartPulse :size="25" /></div>
      <h3>{{ $t(selectedOrgan?.label) }}</h3>
      <p>{{ $t(selectedOrgan?.description) }}</p>
      <span class="muted">{{ $t("The full organ module will be available in a future release.") }}</span>
    </section>
  </div>
</template>

<style scoped>
.body-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  align-items: start;
  gap: 18px;
  margin-bottom: 18px;
}

.body-canvas {
  padding: 0;
}

.body-canvas :deep(.digital-human) {
  border: 0;
  border-radius: 0 0 var(--radius) var(--radius);
}

.organ-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lung-detail {
  overflow: hidden;
}

.lung-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-size: 11px;
  font-weight: 720;
}

.lung-detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 0.7fr);
  gap: 18px;
}

.lung-report {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trust-note {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--radius);
  background: #e6f1eb;
  color: #3f7d5d;
  font-size: 12px;
}

.organ-detail {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.organ-detail-icon {
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  border-radius: 14px;
  background: var(--surface-3);
  color: var(--text-soft);
}

.organ-detail h3 {
  margin: 16px 0 7px;
}

.organ-detail p {
  margin: 0 0 12px;
  color: var(--text-soft);
}

@media (max-width: 1000px) {
  .body-layout,
  .lung-detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
