<script setup lang="ts">
import WorkflowQueue from '@/components/medical/WorkflowQueue.vue'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
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
import { useRoute, useRouter } from 'vue-router'
import { usePatientStore } from '@/stores/patients'
import PageHeader from '@/components/layout/PageHeader.vue'
import StatsCard from '@/components/ui/StatsCard.vue'
import SearchBar from '@/components/ui/SearchBar.vue'
import FilterBar from '@/components/ui/FilterBar.vue'
import PatientTable from '@/components/patient/PatientTable.vue'
import PatientCreateDialog from '@/components/patient/PatientCreateDialog.vue'
import PatientDeleteButton from '@/components/patient/PatientDeleteButton.vue'
import PatientInvitationButton from '@/components/patient/PatientInvitationButton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import RiskBadge from '@/components/ui/RiskBadge.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import type { Patient } from '@/types'
import { localCalendarDate } from '@/utils/dates'
import { organNames } from '@/api/mappers'

const router = useRouter()
const route = useRoute()
const store = usePatientStore()

function queryValue(key: string, fallback: string) {
  return typeof route.query[key] === 'string' ? String(route.query[key]) : fallback
}

const filters = reactive({
  search: queryValue('search', ''),
  modality: queryValue('modality', 'All'),
  organ: queryValue('organ', 'All'),
  status: queryValue('status', 'All'),
  risk: queryValue('risk', 'All'),
  date: queryValue('date', 'All'),
  sort: queryValue('sort', 'name'),
  direction: queryValue('direction', 'asc'),
})

const selectedPatientId = ref<string | null>(null)
const patientDialog = ref<InstanceType<typeof PatientCreateDialog>>()
const today = localCalendarDate()
const recent = localCalendarDate(new Date(Date.now() - 7 * 86400000))

const totalPatients = computed(() => store.patientTotal)
const totalPages = computed(() => Math.max(1, Math.ceil(store.patientTotal / store.patientPageSize)))
const pendingReview = computed(
  () => store.patients.filter((patient) => patient.status === 'Pending Review').length,
)
const abnormalFindings = computed(
  () => store.patients.filter((patient) => patient.risk === 'High' || patient.risk === 'Medium').length,
)
const todaysExams = computed(
  () => store.patients.filter((patient) => patient.lastUploadedAt?.slice(0, 10) === today).length,
)

const modalityOptions = ['All', 'CT', 'MRI', 'X-Ray']
const organOptions = computed(() => ['All', ...new Set(store.patients.map((patient) => patient.organ))])
const statusOptions = ['All', 'Pending Review', 'Reviewed', 'Not assessed']
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
  () => filters.search.trim() !== ''
    || ['modality', 'organ', 'status', 'risk', 'date'].some(key => filters[key as keyof typeof filters] !== 'All')
    || filters.sort !== 'name' || filters.direction !== 'asc',
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
  void loadRoster(1)
}

function patientRemoved(id: string) {
  if (selectedPatientId.value === id) {
    selectedPatientId.value = store.patients[0]?.id || null
    store.selectedPatientId = selectedPatientId.value
  }
  void loadRoster(Math.min(store.patientPage, totalPages.value))
}

function resetFilters() {
  Object.assign(filters, { search: '', modality: 'All', organ: 'All', status: 'All', risk: 'All', date: 'All', sort: 'name', direction: 'asc' })
}

let rosterTimer: ReturnType<typeof setTimeout> | undefined
let rosterController: AbortController | undefined

function organIdForFilter() {
  if (filters.organ === 'All') return undefined
  return Object.entries(organNames).find(([, name]) => name === filters.organ)?.[0]
}

function reviewStatusForFilter() {
  return ({ 'Pending Review': 'pending', Reviewed: 'reviewed', 'Not assessed': 'unassessed' } as Record<string, string>)[filters.status]
}

function persistRosterQuery(page: number) {
  const query: Record<string, string> = {}
  if (page > 1) query.page = String(page)
  if (filters.search.trim()) query.search = filters.search.trim()
  for (const key of ['modality', 'organ', 'status', 'risk', 'date'] as const) {
    if (filters[key] !== 'All') query[key] = filters[key]
  }
  if (filters.sort !== 'name') query.sort = filters.sort
  if (filters.direction !== 'asc') query.direction = filters.direction
  void router.replace({ query })
}

async function loadRoster(page = store.patientPage) {
  persistRosterQuery(page)
  rosterController?.abort()
  rosterController = new AbortController()
  await store.loadPatientRoster({
    page,
    pageSize: 20,
    search: filters.search.trim() || undefined,
    modality: filters.modality === 'All' ? undefined : filters.modality,
    organId: organIdForFilter(),
    reviewStatus: reviewStatusForFilter(),
    sort: filters.sort === 'id' ? 'id' : 'name',
    direction: filters.direction === 'desc' ? 'desc' : 'asc',
    signal: rosterController.signal,
  })
  if (!selectedPatientId.value || !store.patients.some(patient => patient.id === selectedPatientId.value)) {
    selectedPatientId.value = store.patients[0]?.id || null
    store.selectedPatientId = selectedPatientId.value
  }
}

watch(
  [() => filters.search, () => filters.modality, () => filters.organ, () => filters.status, () => filters.sort, () => filters.direction],
  () => {
    clearTimeout(rosterTimer)
    rosterTimer = setTimeout(() => void loadRoster(1), 300)
  },
)

watch([() => filters.risk, () => filters.date], () => persistRosterQuery(store.patientPage))

onBeforeUnmount(() => {
  clearTimeout(rosterTimer)
  rosterController?.abort()
})

onMounted(async () => {
  const requestedPage = Math.max(1, Number.parseInt(queryValue('page', '1'), 10) || 1)
  await loadRoster(requestedPage)
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
      <span>{{ $t('ui.dashboard.archived', { name: store.lastArchivedPatient.name }) }}</span>
      <button class="btn btn-secondary btn-sm" type="button" @click="store.restoreLastPatient()">{{ $t('ui.dashboard.undo') }}</button>
    </div>

    <section class="dashboard-grid">
      <div class="patient-section">
        <div class="card">
          <div class="card-header">
            <div>
              <h2>{{ $t('ui.dashboard.allPatients') }}</h2>
              <p class="muted">{{ $t('ui.dashboard.manageRoster') }}</p>
            </div>
            <div class="roster-heading-actions">
              <span class="patient-count">{{ $t('ui.dashboard.pageCount', { shown: filteredPatients.length, total: totalPatients }) }}</span>
              <button class="btn btn-primary" type="button" @click="patientDialog?.open()"><UserPlus :size="16" /> {{ $t('ui.dashboard.addPatient') }}</button>
            </div>
          </div>
          <div class="patient-search-row">
            <SearchBar v-model="filters.search" :placeholder="$t('ui.dashboard.searchPlaceholder')" />
            <span v-if="filters.search">{{ $t('ui.dashboard.searchResult', { query: filters.search }) }}</span>
            <span v-else>{{ $t('ui.dashboard.searchHint') }}</span>
          </div>
          <div class="filter-row">
            <FilterBar>
              <select v-model="filters.modality" class="select" aria-label="Modality filter">
                <option v-for="option in modalityOptions" :key="option" :value="option">{{ $t(option) }}</option>
              </select>
              <select v-model="filters.organ" class="select" aria-label="Organ filter">
                <option v-for="option in organOptions" :key="option" :value="option">{{ $t(option) }}</option>
              </select>
              <select v-model="filters.status" class="select" aria-label="Status filter">
                <option v-for="option in statusOptions" :key="option" :value="option">{{ $t(option) }}</option>
              </select>
              <select v-model="filters.risk" class="select" aria-label="Risk filter">
                <option v-for="option in riskOptions" :key="option" :value="option">{{ $t(option) }}</option>
              </select>
              <select v-model="filters.date" class="select" aria-label="Date filter">
                <option value="All">{{ $t('All dates') }}</option>
                <option value="Today">{{ $t('Today') }}</option>
                <option value="Recent">{{ $t('Last 7 days') }}</option>
              </select>
              <select v-model="filters.sort" class="select" :aria-label="$t('ui.dashboard.sort')">
                <option value="name">{{ $t('ui.dashboard.sortName') }}</option>
                <option value="id">{{ $t('ui.dashboard.sortId') }}</option>
              </select>
              <select v-model="filters.direction" class="select" :aria-label="$t('ui.dashboard.direction')">
                <option value="asc">{{ $t('ui.dashboard.ascending') }}</option>
                <option value="desc">{{ $t('ui.dashboard.descending') }}</option>
              </select>
              <button v-if="hasActiveFilters" type="button" class="btn btn-secondary btn-sm" @click="resetFilters">
                <RotateCcw :size="14" /> {{ $t('Clear filters') }}
              </button>
            </FilterBar>
          </div>
          <StatePanel v-if="store.error" kind="error" compact :message="store.error">
            <template #actions><button type="button" class="btn btn-secondary btn-sm" @click="loadRoster()">{{ $t('ui.dashboard.retry') }}</button></template>
          </StatePanel>
          <StatePanel v-else-if="store.loading" kind="loading" compact :message="$t('ui.dashboard.loading')" />
          <PatientTable
            v-else
            :patients="filteredPatients"
            :selected-id="selectedPatientId"
            @open="openPatient"
            @removed="patientRemoved"
          />
          <nav v-if="totalPages > 1 && !store.loading" class="pagination" :aria-label="$t('ui.dashboard.pagination')">
            <button type="button" class="btn btn-secondary btn-sm" :disabled="store.patientPage <= 1" @click="loadRoster(store.patientPage - 1)">{{ $t('ui.dashboard.previousPage') }}</button>
            <span>{{ $t('ui.dashboard.page', { page: store.patientPage, total: totalPages }) }}</span>
            <button type="button" class="btn btn-secondary btn-sm" :disabled="store.patientPage >= totalPages" @click="loadRoster(store.patientPage + 1)">{{ $t('ui.dashboard.nextPage') }}</button>
          </nav>
          <StatePanel v-if="!store.loading && !store.error && !filteredPatients.length" kind="empty" compact :message="$t('ui.dashboard.noMatch')">
            <template v-if="hasActiveFilters" #actions><button type="button" class="btn btn-secondary btn-sm" @click="resetFilters">{{ $t('ui.reports.clear') }}</button></template>
          </StatePanel>
        </div>
      </div>

      <aside class="selected-panel card">
        <div class="card-header">
          <h3>{{ $t('ui.dashboard.selectedPatient') }}</h3>
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
            <span>{{ selectedPatient.age === null ? $t('ui.dashboard.ageUnknown') : selectedPatient.age + ' ' + $t('years') }}</span>
            <span>{{ $t(selectedPatient.gender) }}</span>
            <span>{{ $t(selectedPatient.modality) }} · {{ $t(selectedPatient.organ) }}</span>
          </div>
          <div class="ct-preview">
            <ScanLine :size="48" style="color:#83b5b8;position:absolute;left:calc(50% - 24px);top:calc(50% - 24px)" />
          </div>
          <div class="preview-caption">
            <span><ScanLine :size="14" /> {{ $t('ui.dashboard.latestExam') }}</span>
            <span>{{ selectedPatient.lastExamDate }}</span>
          </div>
          <div class="selected-status">
            <StatusBadge :status="selectedPatient.aiStatus" />
            <RiskBadge :level="selectedPatient.risk" />
          </div>
          <div class="selected-actions">
            <button type="button" class="btn btn-primary" @click="router.push({ name: 'doctor-patient-imaging', params: { id: selectedPatient.id } })">
              <ScanLine :size="16" /> {{ $t('ui.dashboard.viewImaging') }}
            </button>
            <button type="button" class="btn btn-secondary" @click="router.push({ name: 'doctor-patient-report', params: { id: selectedPatient.id } })">
              <FileText :size="16" /> {{ $t('ui.dashboard.viewReport') }}
            </button>
            <button type="button" class="btn btn-secondary" @click="router.push({ name: 'doctor-patient-3d', params: { id: selectedPatient.id } })">
              <Activity :size="16" /> {{ $t('ui.dashboard.view3d') }}
            </button>
            <PatientDeleteButton :id="selectedPatient.id" :name="selectedPatient.name" stay @removed="patientRemoved" />
            <PatientInvitationButton :id="selectedPatient.id" :name="selectedPatient.name" :id-number="selectedPatient.idNumber" />
          </div>
        </div>
        <StatePanel v-else kind="empty" compact :message="$t('ui.dashboard.selectPreview')" />
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
.pagination{display:flex;align-items:center;justify-content:center;gap:12px;padding:14px}.pagination span{color:var(--text-muted);font-size:11px}

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

.selected-person .large-avatar {
  color: #ffffff;
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
