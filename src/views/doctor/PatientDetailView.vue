<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import PatientDeleteButton from '@/components/patient/PatientDeleteButton.vue'
import { ArrowLeft } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { usePatientStore } from '@/stores/patients'
import RiskBadge from '@/components/ui/RiskBadge.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import { displayBloodType } from '@/utils/clinicalValues'
import { t } from '@/i18n'

const route = useRoute()
const router = useRouter()
const store = usePatientStore()

const patientId = computed(() => String(route.params.id))
const selectedPatient = computed(() => store.selectedPatient)

const tabs = [
  { label: 'Overview', name: 'doctor-patient-overview' },
  { label: 'Imaging', name: 'doctor-patient-imaging' },
  { label: 'Report', name: 'doctor-patient-report' },
  { label: 'ui.patientDetail.ai', name: 'doctor-patient-ai' },
  { label: 'ui.patientDetail.organ3d', name: 'doctor-patient-3d', external: true },
]

async function loadPatient() {
  if (!store.patients.length) {
    await store.loadPatients()
  }
  await store.selectPatient(patientId.value)
}

onMounted(loadPatient)
watch(patientId, loadPatient)
</script>

<template>
  <div class="page patient-detail" :class="{ 'is-imaging': route.name === 'doctor-patient-imaging' }">
    <button type="button" class="back-link" @click="router.push({ name: 'doctor-patients' })">
      <ArrowLeft :size="16" /> {{ $t('Back to Workspace') }}
    </button>

    <section v-if="selectedPatient" class="patient-hero card">
      <div class="patient-identity">
        <span class="patient-avatar" :style="{ background: selectedPatient.avatarColor }">
          {{ selectedPatient.name.split(' ').map((part) => part[0]).join('') }}
        </span>
        <div>
          <div class="name-row">
            <h1>{{ selectedPatient.name }}</h1>
            <RiskBadge :level="selectedPatient.risk" />
          </div>
          <p>
            {{ selectedPatient.id }} · {{ selectedPatient.age === null ? t('ui.patientDetail.ageUnknown') : t('ui.patientDetail.age', { age: selectedPatient.age }) }} · {{ $t(selectedPatient.gender) }} ·
            {{ displayBloodType(selectedPatient) }}
          </p>
        </div>
      </div>
      <div class="patient-status">
        <PatientDeleteButton :id="patientId" :name="selectedPatient.name" /><span class="status-label">{{ $t('Current status') }}</span>
        <StatusBadge :status="selectedPatient.status" />
        <span class="latest-label">Latest: {{ selectedPatient.modality }} {{ selectedPatient.organ }}</span>
      </div>
    </section>

    <nav class="detail-tabs" aria-label="Patient record sections">
      <template v-for="tab in tabs" :key="tab.name">
        <a
          v-if="tab.external"
          :href="router.resolve({ name: 'study-viewer', params: { patientId: patientId } }).href"
          target="_blank"
          class="detail-tab"
        >
          {{ $t(tab.label) }}
        </a>
        <RouterLink
          v-else
          :to="{ name: tab.name, params: { id: patientId } }"
          class="detail-tab"
          exact-active-class="is-active"
        >
          {{ $t(tab.label) }}
        </RouterLink>
      </template>
    </nav>

    <StatePanel v-if="store.loading && !store.examinations.length" kind="loading" :message="$t('Loading patient record...')" />
    <StatePanel v-else-if="store.error" kind="error" :message="store.error" />
    <RouterView v-else :key="patientId" />
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

.back-link:hover {
  color: var(--accent-strong);
}

.patient-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 20px;
}

.patient-identity {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 15px;
}

.patient-avatar {
  display: grid;
  width: 58px;
  height: 58px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 12px;
  color: #ffffff;
  font-size: 17px;
  font-weight: 760;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.name-row h1 {
  margin: 0;
  color: var(--text);
  font-size: 23px;
}

.patient-identity p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 12px;
}

.patient-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 7px;
}

.status-label,
.latest-label {
  color: var(--text-muted);
  font-size: 11px;
}

.latest-label {
  font-size: 12px;
}

.detail-tabs {
  display: flex;
  gap: 4px;
  margin: 18px 0;
  overflow-x: auto;
  border-bottom: 1px solid var(--border);
}

.detail-tab {
  position: relative;
  padding: 10px 13px 12px;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 620;
  white-space: nowrap;
}

.detail-tab:hover {
  color: var(--text);
}

.detail-tab.is-active {
  color: var(--accent-strong);
}

.detail-tab.is-active::after {
  position: absolute;
  right: 12px;
  bottom: -1px;
  left: 12px;
  height: 2px;
  border-radius: 2px 2px 0 0;
  background: var(--accent);
  content: '';
}

.patient-detail.is-imaging .back-link {
  margin-bottom: 7px;
}

.patient-detail.is-imaging .patient-hero {
  gap: 12px;
  padding: 9px 12px;
}

.patient-detail.is-imaging .patient-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 12px;
}

.patient-detail.is-imaging .name-row h1 {
  font-size: 16px;
}

.patient-detail.is-imaging .patient-status {
  align-items: center;
  flex-direction: row;
}

.patient-detail.is-imaging .detail-tabs {
  margin: 7px 0 9px;
}

.patient-detail.is-imaging .detail-tab {
  padding-block: 7px 9px;
  font-size: 11px;
}

@media (max-width: 760px) {
  .patient-hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .patient-status {
    align-items: flex-start;
  }

  .patient-detail.is-imaging .patient-hero {
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .patient-detail.is-imaging .patient-status {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>
