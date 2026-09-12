<script setup lang="ts">
import WorkflowQueue from '@/components/medical/WorkflowQueue.vue'
import { computed, onMounted, reactive, ref } from 'vue'
import {
  Activity,
  CalendarDays,
  Clock3,
  FileText,
  RotateCcw,
  ScanLine,
  TriangleAlert,
  UserPlus,
  Users,
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { usePatientStore } from '@/stores/patients'
import PageHeader from '@/components/layout/PageHeader.vue'
import StatsCard from '@/components/ui/StatsCard.vue'
import SearchBar from '@/components/ui/SearchBar.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import PatientTable from '@/components/patient/PatientTable.vue'
import PatientCreateDialog from '@/components/patient/PatientCreateDialog.vue'
import PatientDeleteButton from '@/components/patient/PatientDeleteButton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import RiskBadge from '@/components/ui/RiskBadge.vue'
import type { Patient } from '@/types'

const router = useRouter()
const store = usePatientStore()

const filters = reactive({
  search: '',
  modality: 'All',
  organ: 'All',
  status: 'All',
  risk: 'All',
  date: 'All',
})

const selectedPatientId = ref<string | null>(null)
const patientDialog = ref<InstanceType<typeof PatientCreateDialog>>()
const today = new Date().toISOString().slice(0, 10)
const recent = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)

const totalPatients = computed(() => store.patients.length)
const pendingReview = computed(
  () => store.patients.filter((patient) => patient.modality !== '—').length,
)
const abnormalFindings = computed(
  () => store.patients.filter((patient) => patient.modality === '—').length,
)
const todaysExams = computed(
  () => store.patients.filter((patient) => patient.lastExamDate === today).length,
)

const modalityOptions = ['All', 'CT', 'MRI', 'X-Ray']
const organOptions = computed(() => ['All', ...new Set(store.patients.map((patient) => patient.organ))])
const statusOptions = computed(() => ['All', ...new Set(store.patients.map((patient) => patient.status))])
const riskOptions = computed(() => ['All', ...new Set(store.patients.map((patient) => patient.risk))])

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
      (filters.date === 'Today' && patient.lastExamDate === today) ||
      (filters.date === 'Recent' && patient.lastExamDate >= recent)
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

const hasActiveFilters = computed(
  () => filters.search.trim() !== '' || Object.entries(filters).some(([key, value]) => key !== 'search' && value !== 'All'),
)

function selectPatient(patient: Patient) {
  selectedPatientId.value = patient.id
  store.selectedPatientId = patient.id
}

function openPatient(patient: Patient) {
  selectPatient(patient)
  router.push({ name: 'doctor-patient-overview', params: { id: patient.id } })
}

function patientCreated(id: string) {
  selectedPatientId.value = id
  store.selectedPatientId = id
}

function patientRemoved(id: string) {
  if (selectedPatientId.value === id) {
    selectedPatientId.value = store.patients[0]?.id || null
    store.selectedPatientId = selectedPatientId.value
  }
}

function resetFilters() {
  Object.assign(filters, { search: '', modality: 'All', organ: 'All', status: 'All', risk: 'All', date: 'All' })
}

onMounted(async () => {
  if (!store.patients.length) await store.loadPatients()
  if (!selectedPatientId.value || !store.patients.some((patient) => patient.id === selectedPatientId.value)) {
    selectedPatientId.value = store.patients[0]?.id || null
  }
  store.selectedPatientId = selectedPatientId.value
})
</script>

<template>
  <div class="page">
    <PageHeader
      title="Patient Workspace"
      subtitle="View every patient, search the roster, then open one record for imaging and reports."
    />

    <PatientCreateDialog ref="patientDialog" @created="patientCreated" />

    <section class="grid four-col stats-grid">
      <StatsCard label="Total Patients" :value="totalPatients" note="Across all modules" :icon="Users" tone="teal" />
      <StatsCard label="With Imaging" :value="pendingReview" note="Accessible imaging studies" :icon="Clock3" tone="amber" />
      <StatsCard label="Awaiting Images" :value="abnormalFindings" note="No images uploaded" :icon="TriangleAlert" tone="red" />
      <StatsCard label="Today's Uploads" :value="todaysExams" note="Patients with new images" :icon="CalendarDays" tone="blue" />
    </section>

    <WorkflowQueue />

    <div v-if="store.lastArchivedPatient" class="undo-banner" role="status">
      <span>已从工作台移除患者 <strong>{{ store.lastArchivedPatient.name }}</strong></span>
      <button class="btn btn-secondary btn-sm" type="button" @click="store.restoreLastPatient()">撤销</button>
    </div>

    <section class="dashboard-grid">
      <div class="patient-section">
        <div class="card">
          <div class="card-header">
            <div>
              <h2>All Patients</h2>
              <p class="muted">搜索、添加或管理患者档案。</p>
            </div>
            <div class="roster-heading-actions">
              <span class="patient-count">{{ filteredPatients.length }} / {{ totalPatients }}</span>
              <button class="btn btn-primary" type="button" @click="patientDialog?.open()"><UserPlus :size="16" /> 加入患者</button>
            </div>
          </div>
          <div class="patient-search-row">
            <SearchBar v-model="filters.search" placeholder="搜索患者姓名或患者 ID…" />
            <span v-if="filters.search">正在显示与“{{ filters.search }}”匹配的患者</span>
            <span v-else>输入姓名或患者 ID 即可快速查找</span>
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
                <option v-for="option in statusOptions" :key="option" :value="option">{{ $t(option) }}</option>
              </select>
              <select v-model="filters.risk" class="select" aria-label="Risk filter">
                <option v-for="option in riskOptions" :key="option" :value="option">{{ $t(option) }}</option>
              </select>
              <select v-model="filters.date" class="select" aria-label="Date filter">
                <option value="All">All dates</option>
                <option value="Today">Today</option>
                <option value="Recent">Last 7 days</option>
              </select>
              <button v-if="hasActiveFilters" type="button" class="btn btn-secondary btn-sm" @click="resetFilters">
                <RotateCcw :size="14" /> {{ $t('Clear filters') }}
              </button>
            </FilterBar>
          </div>
          <p v-if="store.error" class="roster-message error-message" role="alert">
            {{ store.error }}
            <button type="button" class="btn btn-secondary btn-sm" @click="store.loadPatients()">重试</button>
          </p>
          <p v-else-if="store.loading" class="roster-message">正在加载患者列表…</p>
          <PatientTable
            v-else
            :patients="filteredPatients"
            :selected-id="selectedPatientId"
            @open="openPatient"
            @removed="patientRemoved"
          />
          <div v-if="!store.loading && !store.error && !filteredPatients.length" class="empty-state">
            没有找到匹配的患者。
            <button v-if="hasActiveFilters" type="button" class="btn btn-secondary btn-sm" @click="resetFilters">清除筛选</button>
          </div>
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
            <span>{{ selectedPatient.age === null ? '年龄未登记' : selectedPatient.age + ' ' + $t('years') }}</span>
            <span>{{ $t(selectedPatient.gender) }}</span>
            <span>{{ $t(selectedPatient.modality) }} · {{ $t(selectedPatient.organ) }}</span>
          </div>
          <div class="ct-preview">
            <ScanLine :size="48" style="color:#83b5b8;position:absolute;left:calc(50% - 24px);top:calc(50% - 24px)" />
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
            <PatientDeleteButton :id="selectedPatient.id" :name="selectedPatient.name" stay @removed="patientRemoved" />
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

.patient-count {
  flex: 0 0 auto;
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--surface-3);
  color: var(--text-soft);
  font-size: 12px;
  font-weight: 700;
}

.roster-heading-actions,
.patient-search-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.patient-search-row {
  padding: 15px 16px;
  border-bottom: 1px solid var(--border);
  background: linear-gradient(90deg, #f6fbfa 0%, #fbfdfd 100%);
}

.patient-search-row :deep(.search-bar) {
  width: min(100%, 460px);
  height: 44px;
  border-radius: 10px;
  background: #ffffff;
}

.patient-search-row > span {
  color: var(--text-muted);
  font-size: 12px;
}

.undo-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: -8px 0 20px;
  padding: 12px 14px;
  border: 1px solid #c8dfd7;
  border-radius: 9px;
  background: #edf7f3;
  color: #315f53;
  font-size: 13px;
}

.filter-row {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background: #fbfdfd;
}

.roster-message {
  display: flex;
  min-height: 92px;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 0;
  padding: 20px;
  color: var(--text-muted);
  font-size: 13px;
}

.error-message {
  color: #a3444b;
}

.empty-state .btn {
  margin-left: 8px;
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

@media (max-width: 680px) {
  .card-header,
  .patient-search-row,
  .roster-heading-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .patient-search-row > span {
    display: none;
  }
}
</style>
