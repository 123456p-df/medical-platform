import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/api/client'
import { examinationApi } from '@/api/examinations'
import { findingApi } from '@/api/findings'
import { patientApi } from '@/api/patients'
import { reportApi } from '@/api/reports'
import type { ArchivedPatient, Examination, Finding, Patient, Report } from '@/types'
import { mockExaminations, mockFindings, mockPatients, mockReports } from '@/data/mockData'
import { localPreview } from '@/utils/runtime'
import { getLocalUploads } from '@/api/localStudyRepository'

const PREVIEW_PATIENTS_KEY = 'pulmolink-preview-patients'
const PREVIEW_ARCHIVED_PATIENTS_KEY = 'pulmolink-preview-archived-patients'
const PREVIEW_ARCHIVED_RECORDS_KEY = 'pulmolink-preview-archived-records'
const PREVIEW_REVIEW_KEY = 'pulmolink-preview-review-status'
const PREVIEW_REPORTS_KEY = 'pulmolink-preview-reports'
const PREVIEW_FINDINGS_KEY = 'pulmolink-preview-findings-v1'

export interface PatientDraft {
  name: string
  id_number: string
  birth_date: string | null
  gender: string
  height: number | null
  weight: number | null
  blood_type: string | null
}

function readPreviewPatients() {
  try { return JSON.parse(localStorage.getItem(PREVIEW_PATIENTS_KEY) || 'null') as Patient[] | null }
  catch { return null }
}

interface PreviewReviewState { completed: boolean; completedAt: string | null }

function readReviewStatus() {
  try {
    const raw = JSON.parse(localStorage.getItem(PREVIEW_REVIEW_KEY) || '{}') as Record<string, string | PreviewReviewState>
    return Object.fromEntries(Object.entries(raw).map(([id, value]) => [id,
      typeof value === 'string'
        ? { completed: Boolean(value), completedAt: value || null }
        : { completed: Boolean(value.completed), completedAt: value.completedAt || null },
    ])) as Record<string, PreviewReviewState>
  }
  catch { return {} }
}

function readPreviewReports() {
  try { return JSON.parse(localStorage.getItem(PREVIEW_REPORTS_KEY) || 'null') as Report[] | null }
  catch { return null }
}

function writePreviewReports(reports: Report[]) {
  localStorage.setItem(PREVIEW_REPORTS_KEY, JSON.stringify(reports))
}

function readPreviewFindings() {
  try { return JSON.parse(localStorage.getItem(PREVIEW_FINDINGS_KEY) || 'null') as Finding[] | null }
  catch { return null }
}

function writePreviewFindings(items: Finding[]) {
  localStorage.setItem(PREVIEW_FINDINGS_KEY, JSON.stringify(items))
}

function examinationOrganId(examination?: Examination) {
  if (!examination) return 'other'
  if (examination.organId) return examination.organId
  const value = examination.organ.trim().toLowerCase()
  return value === 'chest' ? 'lung' : value || 'other'
}

function ageFromDate(date: string | null) {
  if (!date) return null
  const birth = new Date(`${date}T00:00:00`), now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--
  return age >= 0 ? age : null
}

export const usePatientStore = defineStore('patients', () => {
  const patients = ref<Patient[]>([])
  const patientTotal = ref(0)
  const patientPage = ref(1)
  const patientPageSize = ref(20)
  const selectedPatientId = ref<string | null>(null)
  const examinations = ref<Examination[]>([])
  const findings = ref<Finding[]>([])
  const reports = ref<Report[]>([])
  const lastArchivedPatient = ref<Patient | null>(null)
  const archivedPatients = ref<ArchivedPatient[]>([])
  const reviewedReports = computed(() => reports.value.filter(report => report.reviewed))
  const activeExamId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  let generation = 0
  const selectedPatient = computed(() => patients.value.find(p => p.id === selectedPatientId.value) ?? null)
  function reset() {
    generation++
    patients.value = []; patientTotal.value = 0; patientPage.value = 1; selectedPatientId.value = null; examinations.value = []
    findings.value = []; reports.value = []; activeExamId.value = null; lastArchivedPatient.value = null
    archivedPatients.value = []
    error.value = null; loading.value = false
  }
  async function loadPatients() {
    const revision = generation
    loading.value = true
    error.value = null
    if (localPreview) {
      const previewPatients = structuredClone(readPreviewPatients() || mockPatients)
      try {
        const records = JSON.parse(localStorage.getItem(PREVIEW_ARCHIVED_RECORDS_KEY) || '[]') as ArchivedPatient[]
        archivedPatients.value = records
        lastArchivedPatient.value = previewPatients.find(patient => patient.id === records[0]?.patientId) ?? null
      } catch {
        const legacy = JSON.parse(localStorage.getItem(PREVIEW_ARCHIVED_PATIENTS_KEY) || '[]') as Patient[]
        archivedPatients.value = legacy.map(patient => ({
          patientId: patient.id,
          name: patient.name,
          reason: 'legacy-archive',
          archivedAt: new Date().toISOString(),
        }))
        lastArchivedPatient.value = legacy[0] || null
      }
      try {
        const uploaded = await getLocalUploads()
        const reviewed = readReviewStatus()
        for (const patient of previewPatients) {
          const latest = uploaded
            .map(study => study.examination)
            .filter(examination => examination.patientId === patient.id)
            .sort((left, right) => right.date.localeCompare(left.date) || right.id.localeCompare(left.id))[0]
          if (latest && latest.date >= patient.lastExamDate) {
            patient.lastExamDate = latest.date
            patient.modality = latest.type
            patient.organ = latest.organ
            patient.status = reviewed[latest.id]?.completed ? 'Reviewed' : latest.status
          }
          const latestUpload = uploaded
            .filter(study => study.examination.patientId === patient.id)
            .sort((left, right) => right.importedAt.localeCompare(left.importedAt))[0]
          if (latestUpload) patient.lastUploadedAt = latestUpload.importedAt
        }
      } catch { /* Preview records remain available when browser storage is blocked. */ }
      if (revision === generation) { patients.value = previewPatients; patientTotal.value = previewPatients.length }
      loading.value = false
      return
    }
    try {
      const result = await patientApi.getPatients()
      if (revision === generation) { patients.value = result; patientTotal.value = result.length }
    } catch (reason) {
      if (revision === generation) { patients.value = []; error.value = reason instanceof Error ? reason.message : '加载患者失败' }
    } finally { if (revision === generation) loading.value = false }
  }
  async function loadPatientRoster(options: { page: number; pageSize?: number; search?: string; modality?: string; organId?: string; reviewStatus?: string; sort?: 'id' | 'name'; direction?: 'asc' | 'desc'; signal?: AbortSignal }) {
    if (localPreview) return loadPatients()
    const revision = ++generation
    loading.value = true
    error.value = null
    try {
      const result = await patientApi.getPatientPage({
        ...options,
        pageSize: options.pageSize || patientPageSize.value,
      })
      if (revision !== generation) return
      patients.value = result.items
      patientTotal.value = result.total
      patientPage.value = result.page
      patientPageSize.value = result.page_size
    } catch (reason) {
      if (options.signal?.aborted || revision !== generation) return
      error.value = reason instanceof Error ? reason.message : '加载患者失败'
    } finally {
      if (revision === generation) loading.value = false
    }
  }
  async function selectPatient(id: string) {
    if (selectedPatientId.value !== id) activeExamId.value = null
    selectedPatientId.value = id
    await loadPatientContext(id)
  }
  async function loadPatientContext(id: string) {
    const revision = ++generation
    selectedPatientId.value = id
    examinations.value = []; reports.value = []; findings.value = []
    loading.value = true; error.value = null
    if (localPreview) {
      let uploaded: Examination[] = []
      try { uploaded = (await getLocalUploads(id)).map(study => study.examination) }
      catch { /* Keep the bundled preview studies available. */ }
      if (revision !== generation) return
      examinations.value = [
        ...structuredClone(uploaded),
        ...structuredClone(mockExaminations.filter(item => item.patientId === id)),
      ].sort((left, right) => right.date.localeCompare(left.date) || right.id.localeCompare(left.id))
      const reviewed = readReviewStatus()
      examinations.value.forEach(item => {
        if (reviewed[item.id]) item.status = reviewed[item.id].completed ? 'Reviewed' : 'Pending Review'
      })
      reports.value = structuredClone((readPreviewReports() || mockReports).filter(item => item.patientId === id))
        .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
      reports.value.forEach(report => {
        if (report.organIds?.length) return
        const organId = report.organId || examinationOrganId(examinations.value.find(item => item.id === report.examinationId))
        report.organId = organId
        report.organIds = [organId]
      })
      findings.value = structuredClone((readPreviewFindings() || mockFindings).filter(item => item.patientId === id))
      if (!activeExamId.value || !examinations.value.some(item => item.id === activeExamId.value)) {
        activeExamId.value = examinations.value[0]?.id ?? null
      }
      loading.value = false
      return
    }
    try {
      const [imagesResult, recordsResult, findingsResult] = await Promise.allSettled([
        examinationApi.getExaminationsByPatient(id),
        reportApi.getReportsByPatient(id),
        findingApi.getFindingsByPatient(id),
      ])
      if (revision !== generation) return
      examinations.value = imagesResult.status === 'fulfilled' ? imagesResult.value : []
      reports.value = recordsResult.status === 'fulfilled' ? recordsResult.value : []
      findings.value = findingsResult.status === 'fulfilled' ? findingsResult.value : []
      const failures = [
        imagesResult.status === 'rejected' ? `影像：${imagesResult.reason instanceof Error ? imagesResult.reason.message : '加载失败'}` : '',
        recordsResult.status === 'rejected' ? `报告：${recordsResult.reason instanceof Error ? recordsResult.reason.message : '加载失败'}` : '',
        findingsResult.status === 'rejected' ? `候选结果：${findingsResult.reason instanceof Error ? findingsResult.reason.message : '加载失败'}` : '',
      ].filter(Boolean)
      error.value = failures.length ? `部分患者资料未能加载（${failures.join('；')}），其他模块仍可继续使用。` : null
      if (!activeExamId.value || !examinations.value.some(item => item.id === activeExamId.value)) {
        activeExamId.value = examinations.value[0]?.id ?? null
      }
    } catch (reason) {
      if (revision === generation) error.value = reason instanceof Error ? reason.message : '加载病历失败'
    } finally { if (revision === generation) loading.value = false }
  }
  async function updateFindingStatus(id: string, status: Finding['status']) {
    if (localPreview) {
      const finding = findings.value.find(item => item.id === id)
      if (finding) {
        finding.status = status
        finding.revision = (finding.revision || 0) + 1
      }
      if (finding) {
        const all = structuredClone(readPreviewFindings() || mockFindings)
        const index = all.findIndex(item => item.id === id)
        if (index >= 0) all[index] = structuredClone(finding)
        writePreviewFindings(all)
      }
      return
    }
    error.value = null
    try {
      const existing = findings.value.find(item => item.id === id)
      const updated = await findingApi.updateFindingStatus(id, status, existing?.revision)
      const index = findings.value.findIndex(item => item.id === id)
      if (index >= 0) findings.value[index] = updated
    } catch (reason) {
      error.value = reason instanceof Error ? reason.message : '更新 AI finding 失败'
      throw reason
    }
  }
  function updateFindingBox(
    id: string,
    centerVoxel: [number, number, number],
    boxVoxel: [number, number, number, number, number, number],
    diameterMm: number,
  ) {
    const finding = findings.value.find(item => item.id === id)
    if (finding) {
      finding.centerVoxel = centerVoxel
      finding.boxVoxel = boxVoxel
      finding.diameterMm = diameterMm
      finding.status = 'modified'
    }
  }
  async function saveFindingBox(
    id: string,
    geometry: {
      centerVoxel: [number, number, number]
      boxVoxel: [number, number, number, number, number, number]
      centerWorldMm: [number, number, number]
      boxWorldMm: [number, number, number, number, number, number]
      diameterMm: number
    },
  ) {
    const previous = findings.value.find(item => item.id === id)
    if (!previous) throw new Error('找不到需要保存的 finding。')
    if (localPreview) {
      Object.assign(previous, geometry, {
        status: 'modified' as const,
        revision: (previous.revision || 0) + 1,
      })
      const all = structuredClone(readPreviewFindings() || mockFindings)
      const index = all.findIndex(item => item.id === id)
      if (index >= 0) all[index] = structuredClone(previous)
      writePreviewFindings(all)
      return previous
    }
    const saved = await findingApi.updateFindingGeometry(id, {
      ...geometry,
      reason: 'Manual geometry adjustment in MPR viewer',
      expectedRevision: previous.revision,
    })
    const index = findings.value.findIndex(item => item.id === id)
    if (index >= 0) findings.value[index] = saved
    return saved
  }
  async function saveReport(report: Report) {
    if (localPreview) {
      const saved = { ...report, id: report.id || `LOCAL-${Date.now()}` }
      const allReports = structuredClone(readPreviewReports() || mockReports)
      const storedIndex = allReports.findIndex(item => item.id === saved.id)
      if (storedIndex < 0) allReports.push(saved)
      else allReports[storedIndex] = saved
      writePreviewReports(allReports)
      const index = reports.value.findIndex(r => r.id === saved.id)
      if (index < 0) reports.value.unshift(saved)
      else reports.value[index] = saved
      return saved
    }
    const saved = await reportApi.saveReport(report)
    const index = reports.value.findIndex(r => r.id === saved.id)
    if (index < 0) reports.value.unshift(saved)
    else reports.value[index] = saved
    return saved
  }
  async function addReportAddendum(reportId: string, reason: string, content: string) {
    const report = reports.value.find(item => item.id === reportId)
    if (!report?.reviewed) throw new Error('只有已签署报告可以追加更正。')
    if (localPreview) {
      const addendum = {
        id: `LOCAL-ADDENDUM-${Date.now()}`,
        reportId,
        authorUserId: 'local-preview',
        reason: reason.trim(),
        content: content.trim(),
        createdAt: new Date().toISOString(),
      }
      report.addenda = [...(report.addenda || []), addendum]
      const allReports = structuredClone(readPreviewReports() || mockReports)
      const index = allReports.findIndex(item => item.id === reportId)
      if (index >= 0) allReports[index] = structuredClone(report)
      writePreviewReports(allReports)
      return addendum
    }
    const addendum = await reportApi.addAddendum(reportId, reason, content)
    report.addenda = [...(report.addenda || []), addendum]
    return addendum
  }
  async function createPatient(draft: PatientDraft) {
    if (localPreview) {
      const id = `P${new Date().getFullYear()}${String(Date.now()).slice(-6)}`
      const patient: Patient = {
        id,
        name: draft.name,
        idNumber: draft.id_number,
        age: ageFromDate(draft.birth_date),
        gender: draft.gender === 'male' ? 'Male' : draft.gender === 'female' ? 'Female' : 'Unknown',
        phone: '', email: '', bloodType: draft.blood_type || '—', allergies: [], risk: 'Unknown',
        status: 'Available', lastExamDate: '', modality: '—', organ: '—', aiStatus: 'Not assessed', avatarColor: '#527f86',
      }
      patients.value.unshift(patient)
      localStorage.setItem(PREVIEW_PATIENTS_KEY, JSON.stringify(patients.value))
      return id
    }
    const result = await api<{ patient_id: number }>('/patients', { method: 'POST', body: JSON.stringify(draft) })
    await loadPatients()
    return String(result.patient_id)
  }
  async function linkExistingPatient(input: { name: string; id_number: string; birth_date: string | null }) {
    if (localPreview) {
      const roster = structuredClone(readPreviewPatients() || mockPatients)
      const patient = roster.find(item => (
        item.name.trim() === input.name.trim()
        && (item.idNumber || '').toUpperCase() === input.id_number.trim().toUpperCase()
      ))
      if (!patient) throw new Error('没有找到匹配的患者档案。')
      if (patients.value.some(item => item.id === patient.id)) return patient.id
      patients.value.unshift(patient)
      localStorage.setItem(PREVIEW_PATIENTS_KEY, JSON.stringify(patients.value))
      return patient.id
    }
    const result = await patientApi.linkExisting(input.name, input.id_number, input.birth_date)
    await loadPatients()
    return String(result.patient_id)
  }
  function registerPreviewPatient(id: string, name: string) {
    if (!localPreview) return
    const roster = structuredClone(readPreviewPatients() || mockPatients)
    if (roster.some(patient => patient.id === id)) return
    roster.unshift({
      id, name, age: null, gender: 'Unknown', phone: '', email: '', bloodType: '—', rhType: 'Unknown',
      allergies: [], risk: 'Unknown', status: 'Not assessed', lastExamDate: '', modality: '—', organ: '—',
      aiStatus: 'Not assessed', avatarColor: '#527f86',
    })
    localStorage.setItem(PREVIEW_PATIENTS_KEY, JSON.stringify(roster))
    patients.value = roster
  }
  async function archivePatient(id: string) {
    return removePatientAccess(id)
  }
  async function removePatientAccess(id: string, reason = 'workspace-removal') {
    if (localPreview) {
      const index = patients.value.findIndex(patient => patient.id === id)
      if (index < 0) return
      const [patient] = patients.value.splice(index, 1)
      lastArchivedPatient.value = patient
      const record: ArchivedPatient = {
        patientId: patient.id,
        name: patient.name,
        reason,
        archivedAt: new Date().toISOString(),
      }
      let archived: ArchivedPatient[] = []
      try { archived = JSON.parse(localStorage.getItem(PREVIEW_ARCHIVED_RECORDS_KEY) || '[]') }
      catch { archived = [] }
      localStorage.setItem(PREVIEW_ARCHIVED_RECORDS_KEY, JSON.stringify([record, ...archived.filter(item => item.patientId !== id)]))
      localStorage.setItem(PREVIEW_ARCHIVED_PATIENTS_KEY, JSON.stringify([patient, ...JSON.parse(localStorage.getItem(PREVIEW_ARCHIVED_PATIENTS_KEY) || '[]').filter((item: Patient) => item.id !== id)]))
      localStorage.setItem(PREVIEW_PATIENTS_KEY, JSON.stringify(patients.value))
      if (selectedPatientId.value === id) selectedPatientId.value = null
      return
    }
    await api('/doctor/patients/' + id + '/access', { method: 'DELETE' })
    await loadPatients()
  }
  async function archivePatientGlobally(id: string, reason: string) {
    if (localPreview) return removePatientAccess(id, reason)
    await api('/admin/patients/' + id + '/archive', {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
    await loadPatients()
  }
  function restoreLastPatient() {
    if (!localPreview || !lastArchivedPatient.value) return
    const patient = lastArchivedPatient.value
    patients.value.unshift(patient)
    lastArchivedPatient.value = null
    localStorage.setItem(PREVIEW_PATIENTS_KEY, JSON.stringify(patients.value))
    let archived: ArchivedPatient[] = []
    try { archived = JSON.parse(localStorage.getItem(PREVIEW_ARCHIVED_RECORDS_KEY) || '[]') }
    catch { archived = [] }
    localStorage.setItem(PREVIEW_ARCHIVED_RECORDS_KEY, JSON.stringify(archived.filter(item => item.patientId !== patient.id)))
    const legacy = JSON.parse(localStorage.getItem(PREVIEW_ARCHIVED_PATIENTS_KEY) || '[]') as Patient[]
    localStorage.setItem(PREVIEW_ARCHIVED_PATIENTS_KEY, JSON.stringify(legacy.filter(item => item.id !== patient.id)))
  }
  async function loadArchivedPatients() {
    if (localPreview) {
      try { archivedPatients.value = JSON.parse(localStorage.getItem(PREVIEW_ARCHIVED_RECORDS_KEY) || '[]') }
      catch { archivedPatients.value = [] }
      return
    }
    const page = await api<{ items: Array<{ patient_id: number; patient_name: string | null; reason: string; archived_at: string }> }>('/admin/patients/archived')
    archivedPatients.value = page.items.map(item => ({
      patientId: String(item.patient_id),
      name: item.patient_name || '未完成建档',
      reason: item.reason,
      archivedAt: item.archived_at,
    }))
  }
  async function restoreArchivedPatient(id: string) {
    if (localPreview) {
      const archived = archivedPatients.value.find(item => item.patientId === id)
      if (!archived) return
      const patient = JSON.parse(localStorage.getItem(PREVIEW_ARCHIVED_PATIENTS_KEY) || '[]').find((item: Patient) => item.id === id)
      if (patient) {
        patients.value.unshift(patient)
        localStorage.setItem(PREVIEW_PATIENTS_KEY, JSON.stringify(patients.value))
      }
      archivedPatients.value = archivedPatients.value.filter(item => item.patientId !== id)
      localStorage.setItem(PREVIEW_ARCHIVED_RECORDS_KEY, JSON.stringify(archivedPatients.value))
      if (lastArchivedPatient.value?.id === id) lastArchivedPatient.value = null
      return
    }
    await api('/admin/patients/' + id + '/restore', { method: 'POST' })
    await loadArchivedPatients()
  }
  function updateExaminationReview(id: string, completed: boolean) {
    const examination = examinations.value.find(item => item.id === id)
    if (examination) examination.status = completed ? 'Reviewed' : 'Pending Review'
    if (examination) {
      const patient = patients.value.find(item => item.id === examination.patientId)
      if (patient && patient.lastExamDate === examination.date) patient.status = examination.status
    }
    if (localPreview) localStorage.setItem(PREVIEW_PATIENTS_KEY, JSON.stringify(patients.value))
  }
  return { patients, patientTotal, patientPage, patientPageSize, selectedPatientId, selectedPatient, examinations, findings, reports, reviewedReports, activeExamId,
    lastArchivedPatient, loading, error, reset, loadPatients, selectPatient, loadPatientContext,
    loadPatientRoster,
    updateFindingStatus, updateFindingBox, saveFindingBox, saveReport, addReportAddendum, createPatient, registerPreviewPatient,
    linkExistingPatient,
    archivePatient, removePatientAccess, archivePatientGlobally, restoreLastPatient,
    archivedPatients, loadArchivedPatients, restoreArchivedPatient, updateExaminationReview }
})
