<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { usePatientStore } from '@/stores/patients'
import PageHeader from '@/components/layout/PageHeader.vue'
import SearchBar from '@/components/ui/SearchBar.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import PatientTable from '@/components/patient/PatientTable.vue'
import type { Patient } from '@/types'

const router = useRouter()
const store = usePatientStore()

const filters = reactive({
  search: '',
  modality: 'All',
  organ: 'All',
  status: 'All',
  risk: 'All',
})

const organOptions = computed(() => ['All', ...new Set(store.patients.map((patient) => patient.organ))])

const filteredPatients = computed(() => {
  const query = filters.search.trim().toLowerCase()
  return store.patients.filter((patient) => {
    const matchesSearch =
      !query ||
      patient.name.toLowerCase().includes(query) ||
      patient.id.toLowerCase().includes(query)
    const matchesModality = filters.modality === 'All' || patient.modality === filters.modality
    const matchesOrgan = filters.organ === 'All' || patient.organ === filters.organ
    const matchesStatus = filters.status === 'All' || patient.status === filters.status
    const matchesRisk = filters.risk === 'All' || patient.risk === filters.risk
    return matchesSearch && matchesModality && matchesOrgan && matchesStatus && matchesRisk
  })
})

function openPatient(patient: Patient) {
  router.push({ name: 'doctor-patient-overview', params: { id: patient.id } })
}

onMounted(() => {
  if (!store.patients.length) store.loadPatients()
})
</script>

<template>
  <div class="page">
    <PageHeader :title="$t('Patients')" :subtitle="$t('Search, filter, and open the complete patient record.')">
      <template #actions>
        <SearchBar v-model="filters.search" />
      </template>
    </PageHeader>

    <section class="card patient-list-card">
      <div class="list-toolbar">
        <FilterBar>
          <select v-model="filters.modality" class="select" :aria-label="$t('Modality filter')">
            <option value="All">{{ $t("All") }}</option>
            <option value="CT">{{ $t("CT") }}</option>
            <option value="MRI">{{ $t("MRI") }}</option>
            <option value="X-Ray">{{ $t("X-Ray") }}</option>
          </select>
          <select v-model="filters.organ" class="select" :aria-label="$t('Organ filter')">
            <option v-for="option in organOptions" :key="option">{{ $t(option) }}</option>
          </select>
          <select v-model="filters.status" class="select" :aria-label="$t('Status filter')">
            <option value="All">{{ $t("All") }}</option>
            <option value="Pending Review">{{ $t("Pending Review") }}</option>
            <option value="AI Completed">{{ $t("AI Completed") }}</option>
            <option value="Reviewed">{{ $t("Reviewed") }}</option>
            <option value="Abnormal">{{ $t("Abnormal") }}</option>
            <option value="Completed">{{ $t("Completed") }}</option>
          </select>
          <select v-model="filters.risk" class="select" :aria-label="$t('Risk filter')">
            <option value="All">{{ $t("All") }}</option>
            <option value="Low">{{ $t("Low") }}</option>
            <option value="Medium">{{ $t("Medium") }}</option>
            <option value="High">{{ $t("High") }}</option>
          </select>
        </FilterBar>
        <span class="result-count">{{ $t(filteredPatients.length) }} {{ $t("patients") }}</span>
      </div>
      <PatientTable :patients="filteredPatients" @select="openPatient" />
    </section>
  </div>
</template>

<style scoped>
.patient-list-card {
  overflow: hidden;
}

.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  background: #fbfdfd;
}

.result-count {
  color: var(--text-muted);
  font-size: 11px;
  white-space: nowrap;
}

@media (max-width: 760px) {
  .list-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
