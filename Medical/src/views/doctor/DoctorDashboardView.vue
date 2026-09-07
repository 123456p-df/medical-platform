<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  Activity,
  CalendarDays,
  Clock3,
  FileText,
  ScanLine,
  TriangleAlert,
  Users,
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePatientStore } from '@/stores/patients'
import PageHeader from '@/components/layout/PageHeader.vue'
import StatsCard from '@/components/ui/StatsCard.vue'
import SearchBar from '@/components/ui/SearchBar.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import PatientTable from '@/components/patient/PatientTable.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import RiskBadge from '@/components/ui/RiskBadge.vue'
import type { Patient } from '@/types'

const router = useRouter()
const auth = useAuthStore()
const store = usePatientStore()

const filters = reactive({
  search: '',
  modality: 'All',
  organ: 'All',
  status: 'All',
  risk: 'All',
  date: 'All',
})

const selectedPatientId = ref<string | null>('P20260021')

const totalPatients = computed(() => store.patients.length)
const pendingReview = computed(
  () => store.patients.filter((patient) => patient.status === 'Pending Review').length,
)
const abnormalFindings = computed(
  () => store.patients.filter((patient) => patient.status === 'Abnormal' || patient.risk === 'High').length,
)
const todaysExams = computed(
  () => store.patients.filter((patient) => patient.lastExamDate === '2026-09-01').length,
)

const modalityOptions = ['All', 'CT', 'MRI', 'X-Ray']
const organOptions = computed(() => ['All', ...new Set(store.patients.map((patient) => patient.organ))])
const statusOptions = ['All', 'Pending Review', 'AI Completed', 'Reviewed', 'Abnormal', 'Completed']
const riskOptions = ['All', 'Low', 'Medium', 'High']

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
    const matchesDate =
      filters.date === 'All' ||
      (filters.date === 'Today' && patient.lastExamDate === '2026-09-01') ||
      (filters.date === 'Recent' && patient.lastExamDate >= '2026-08-25')
    return (
      matchesSearch &&
      matchesModality &&
      matchesOrgan &&
      matchesStatus &&
      matchesRisk &&
      matchesDate
    )
  })
})

const selectedPatient = computed(
  () => store.patients.find((patient) => patient.id === selectedPatientId.value) ?? null,
)

function openPatient(patient: Patient) {
  selectedPatientId.value = patient.id
  router.push({ name: 'doctor-patient-overview', params: { id: patient.id } })
}

onMounted(() => {
  if (!store.patients.length) store.loadPatients()
})
</script>

<template>
  <div class="page">
    <PageHeader
      title="Doctor Dashboard"
      :subtitle="`Good morning, ${auth.session?.name ?? 'Doctor'}. Here is today's clinical queue.`"
    >
      <template #actions>
        <SearchBar v-model="filters.search" placeholder="Search patient name or ID..." />
      </template>
    </PageHeader>

    <section class="grid four-col stats-grid">
      <StatsCard label="Total Patients" :value="totalPatients" note="Across all modules" :icon="Users" tone="teal" />
      <StatsCard label="Pending Review" :value="pendingReview" note="Needs doctor action" :icon="Clock3" tone="amber" />
      <StatsCard label="Abnormal Findings" :value="abnormalFindings" note="High priority cases" :icon="TriangleAlert" tone="red" />
      <StatsCard label="Today's Exams" :value="todaysExams" note="Scheduled for review" :icon="CalendarDays" tone="blue" />
    </section>

    <section class="dashboard-grid">
      <div class="patient-section">
        <div class="card">
          <div class="card-header">
            <div>
              <h2>Patient List</h2>
              <p class="muted">Review and open the latest imaging studies.</p>
            </div>
          </div>
          <div class="filter-row">
            <FilterBar>
              <select v-model="filters.modality" class="select" aria-label="Modality filter">
                <option v-for="option in modalityOptions" :key="option" :value="option">{{ option }}</option>
              </select>
              <select v-model="filters.organ" class="select" aria-label="Organ filter">
                <option v-for="option in organOptions" :key="option" :value="option">{{ option }}</option>
              </select>
              <select v-model="filters.status" class="select" aria-label="Status filter">
                <option v-for="option in statusOptions" :key="option" :value="option">{{ option }}</option>
              </select>
              <select v-model="filters.risk" class="select" aria-label="Risk filter">
                <option v-for="option in riskOptions" :key="option" :value="option">{{ option }}</option>
              </select>
              <select v-model="filters.date" class="select" aria-label="Date filter">
                <option value="All">All dates</option>
                <option value="Today">Today</option>
                <option value="Recent">Last 7 days</option>
              </select>
            </FilterBar>
          </div>
          <PatientTable
            :patients="filteredPatients"
            :selected-id="selectedPatientId"
            @select="openPatient"
          />
        </div>
      </div>

      <aside class="selected-panel card">
        <div class="card-header">
          <h3>Selected Patient</h3>
        </div>
        <div v-if="selectedPatient" class="selected-content">
          <div class="selected-person">
            <span class="large-avatar" :style="{ background: selectedPatient.avatarColor }">
              {{ selectedPatient.name.split(' ').map((part) => part[0]).join('') }}
            </span>
            <div>
              <strong>{{ selectedPatient.name }}</strong>
              <span>{{ selectedPatient.id }}</span>
            </div>
          </div>
          <div class="selected-meta">
            <span>{{ selectedPatient.age }} years</span>
            <span>{{ selectedPatient.gender }}</span>
            <span>{{ selectedPatient.modality }} · {{ selectedPatient.organ }}</span>
          </div>
          <div class="ct-preview">
            <div class="lung-shape left" />
            <div class="lung-shape right" />
            <span class="preview-marker" />
          </div>
          <div class="preview-caption">
            <span><ScanLine :size="14" /> Latest examination</span>
            <span>{{ selectedPatient.lastExamDate }}</span>
          </div>
          <div class="selected-status">
            <StatusBadge :status="selectedPatient.aiStatus" />
            <RiskBadge :level="selectedPatient.risk" />
          </div>
          <div class="selected-actions">
            <button type="button" class="btn btn-primary" @click="router.push({ name: 'doctor-patient-imaging', params: { id: selectedPatient.id } })">
              <ScanLine :size="16" /> View Imaging
            </button>
            <button type="button" class="btn btn-secondary" @click="router.push({ name: 'doctor-patient-report', params: { id: selectedPatient.id } })">
              <FileText :size="16" /> View Report
            </button>
            <button type="button" class="btn btn-secondary" @click="router.push({ name: 'doctor-patient-3d', params: { id: selectedPatient.id } })">
              <Activity :size="16" /> View 3D
            </button>
          </div>
        </div>
        <div v-else class="empty-state">
          Select a patient to preview their record.
        </div>
      </aside>
    </section>
  </div>
</template>

<style scoped>
.stats-grid {
  margin-bottom: 20px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  align-items: start;
  gap: 18px;
}

.patient-section .card {
  overflow: hidden;
}

.filter-row {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background: #fbfdfd;
}

.selected-panel {
  position: sticky;
  top: calc(var(--topbar-height) + 24px);
  overflow: hidden;
}

.selected-content {
  padding: 16px;
}

.selected-person {
  display: flex;
  align-items: center;
  gap: 12px;
}

.large-avatar {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 50%;
  color: #ffffff;
  font-size: 14px;
  font-weight: 760;
}

.selected-person div {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.selected-person strong {
  color: var(--text);
  font-size: 15px;
}

.selected-person span {
  color: var(--text-muted);
  font-size: 11px;
}

.selected-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
}

.selected-meta span {
  padding: 4px 7px;
  border-radius: 5px;
  background: var(--surface-3);
  color: var(--text-soft);
  font-size: 10px;
}

.ct-preview {
  position: relative;
  height: 128px;
  margin-top: 14px;
  overflow: hidden;
  border-radius: 7px;
  background: #101a1e;
}

.lung-shape {
  position: absolute;
  top: 50%;
  width: 52px;
  height: 88px;
  border: 2px solid rgb(203 235 232 / 42%);
  border-radius: 50%;
  background: rgb(42 63 66 / 82%);
}

.lung-shape.left {
  left: 50%;
  transform: translate(-112%, -50%);
}

.lung-shape.right {
  left: 50%;
  transform: translate(12%, -50%);
}

.preview-marker {
  position: absolute;
  top: 37%;
  left: 67%;
  width: 9px;
  height: 9px;
  border: 2px solid #ff6b75;
  border-radius: 50%;
  box-shadow: 0 0 0 5px rgb(255 107 117 / 18%);
}

.preview-caption {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
  color: var(--text-muted);
  font-size: 10px;
}

.preview-caption span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.selected-status {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.selected-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.selected-actions .btn {
  width: 100%;
}

@media (max-width: 1180px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .selected-panel {
    position: static;
  }
}
</style>
