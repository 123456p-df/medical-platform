<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { usePatientStore } from '@/stores/patients'
import PageHeader from '@/components/layout/PageHeader.vue'
import SearchBar from '@/components/ui/SearchBar.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import PatientTable from '@/components/patient/PatientTable.vue'
import type { Patient } from '@/types'
import { ref } from 'vue'
import { patientApi } from '@/api/patients'

import PatientCreateDialog from '@/components/patient/PatientCreateDialog.vue'
import { UserPlus } from 'lucide-vue-next'
const createDialog = ref<InstanceType<typeof PatientCreateDialog>>()
const router = useRouter()
const store = usePatientStore()
const name = ref(''), identity = ref(''), resolveError = ref(''), resolving = ref(false)
async function resolvePatient() {
  resolving.value = true; resolveError.value = ''
  try {
    const found = await patientApi.resolve(name.value, identity.value)
    identity.value = ''
    await router.push({ name: 'doctor-patient-overview', params: { id: String(found.patient_id) } })
  } catch (reason) { resolveError.value = reason instanceof Error ? reason.message : '查询失败' }
  finally { resolving.value = false }
}

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
  <div class="page"><PatientCreateDialog ref="createDialog" @created="router.push('/doctor/patients/' + $event)" />
    <PageHeader title="Patients" subtitle="Search, filter, and open the complete patient record.">
      <template #actions>
        <SearchBar v-model="filters.search" /><button class="btn btn-primary" @click="createDialog?.open()"><UserPlus :size="16" />录入患者</button>
      </template>
    </PageHeader>

    <form class="card resolve-form" @submit.prevent="resolvePatient">
      <strong>Find an authorized patient</strong>
      <input v-model="name" class="input" placeholder="Patient name" aria-label="Patient name" required />
      <input v-model="identity" class="input" type="password" autocomplete="off" placeholder="ID number" aria-label="ID number" required />
      <button class="btn btn-primary" :disabled="resolving">{{ resolving ? 'Looking up…' : 'Find patient' }}</button>
      <p v-if="resolveError" role="alert">{{ resolveError }}</p>
    </form>
    <p v-if="store.error" role="alert">{{ store.error }}</p>
    <section class="card patient-list-card">
      <div class="list-toolbar">
        <FilterBar>
          <select v-model="filters.modality" class="select" aria-label="Modality filter">
            <option>All</option>
            <option>CT</option>
            <option>MRI</option>
            <option>X-Ray</option>
          </select>
          <select v-model="filters.organ" class="select" aria-label="Organ filter">
            <option v-for="option in organOptions" :key="option">{{ option }}</option>
          </select>
          <select v-model="filters.status" class="select" aria-label="Status filter">
            <option>All</option>
            <option>Pending Review</option>
            <option>AI Completed</option>
            <option>Reviewed</option>
            <option>Abnormal</option>
            <option>Completed</option>
          </select>
          <select v-model="filters.risk" class="select" aria-label="Risk filter">
            <option>All</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </FilterBar>
        <span class="result-count">{{ filteredPatients.length }} patients</span>
      </div>
      <PatientTable :patients="filteredPatients" @select="openPatient" />
    </section>
  </div>
</template>

<style scoped>
.resolve-form { display:flex; flex-wrap:wrap; align-items:center; gap:12px; padding:16px; margin-bottom:18px; }
.resolve-form .input { flex:1; min-width:150px; }.resolve-form p { width:100%; margin:0; color:#a24e50; }
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
