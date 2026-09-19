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

    <StatePanel v-if="store.loading && !store.examinations.length" kind="loading" :message="$t('Loading patient record...')" />
    <StatePanel v-else-if="store.error" kind="error" :message="store.error" />
    <RouterView v-else :key="patientId" class="detail-content" />
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

.detail-content {
  margin-top: 18px;
}

.patient-detail.is-imaging .back-link {
  margin-bottom: 7px;
}

.patient-detail.is-imaging .patient-hero {
  gap: 12px;
  padding: 9px 12px;
}

.patient-detail.is-imaging .detail-content {
  margin-top: 9px;
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
