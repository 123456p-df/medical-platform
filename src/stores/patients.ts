import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/api/client'
import { examinationApi } from '@/api/examinations'
import { findingApi } from '@/api/findings'
import { patientApi } from '@/api/patients'
import { reportApi } from '@/api/reports'
import type { Examination, Finding, Patient, Report } from '@/types'
import { mockExaminations, mockFindings, mockPatients, mockReports } from '@/data/mockData'
import { localPreview } from '@/utils/runtime'

const PREVIEW_PATIENTS_KEY = 'pulmolink-preview-patients'
const PREVIEW_ARCHIVED_PATIENTS_KEY = 'pulmolink-preview-archived-patients'
const PREVIEW_REVIEW_KEY = 'pulmolink-preview-review-status'

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

function readReviewStatus() {
  try { return JSON.parse(localStorage.getItem(PREVIEW_REVIEW_KEY) || '{}') as Record<string,string> }
  catch { return {} }
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
  const selectedPatientId = ref<string | null>(null)
  const examinations = ref<Examination[]>([])
  const findings = ref<Finding[]>([])
  const reports = ref<Report[]>([])
  const lastArchivedPatient = ref<Patient | null>(null)
  const reviewedReports = computed(() => reports.value)
  const loading = ref(false)
  const error = ref<string | null>(null)
  let generation = 0
  const selectedPatient = computed(() => patients.value.find(p => p.id === selectedPatientId.value) ?? null)
  function reset() {
    generation++
    patients.value = []; selectedPatientId.value = null; examinations.value = []
    findings.value = []; reports.value = []; error.value = null; loading.value = false
  }
  async function loadPatients() {
    const revision = generation
    loading.value = true
    error.value = null
    if (localPreview) {
      patients.value = structuredClone(readPreviewPatients() || mockPatients)
      loading.value = false
      return
    }
    try {
      const result = await patientApi.getPatients()
      if (revision === generation) patients.value = result
    } catch (reason) {
      if (revision === generation) { patients.value = []; error.value = reason instanceof Error ? reason.message : '加载患者失败' }
    } finally { if (revision === generation) loading.value = false }
  }
  async function selectPatient(id: string) {
    selectedPatientId.value = id
    await loadPatientContext(id)
  }
  async function loadPatientContext(id: string) {
    const revision = ++generation
    selectedPatientId.value = id
    examinations.value = []; reports.value = []; findings.value = []
    loading.value = true; error.value = null
    if (localPreview) {
      examinations.value = structuredClone(mockExaminations.filter(item => item.patientId === id))
      const reviewed = readReviewStatus()
      examinations.value.forEach(item => { if (reviewed[item.id]) item.status = 'Reviewed' })
      reports.value = structuredClone(mockReports.filter(item => item.patientId === id))
      findings.value = structuredClone(mockFindings.filter(item => item.patientId === id))
      loading.value = false
      return
    }
    try {
      const [images, records, detectedFindings] = await Promise.all([
        examinationApi.getExaminationsByPatient(id),
        reportApi.getReportsByPatient(id),
        findingApi.getFindingsByPatient(id),
      ])
      if (revision !== generation) return
      examinations.value = images; reports.value = records; findings.value = detectedFindings
    } catch (reason) {
      if (revision === generation) error.value = reason instanceof Error ? reason.message : '加载病历失败'
    } finally { if (revision === generation) loading.value = false }
  }
  async function updateFindingStatus(id: string, status: Finding['status']) {
    if (localPreview) {
      const finding = findings.value.find(item => item.id === id)
      if (finding) finding.status = status
      return
    }
    error.value = null
    try {
      const updated = await findingApi.updateFindingStatus(id, status)
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
  async function saveReport(report: Report) {
    if (localPreview) {
      const saved = { ...report, id: report.id || `LOCAL-${Date.now()}` }
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
  async function createPatient(draft: PatientDraft) {
    if (localPreview) {
      const id = `P${new Date().getFullYear()}${String(Date.now()).slice(-6)}`
      const patient: Patient = {
        id,
        name: draft.name,
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
  async function archivePatient(id: string) {
    if (localPreview) {
      const index = patients.value.findIndex(patient => patient.id === id)
      if (index < 0) return
      const [patient] = patients.value.splice(index, 1)
      lastArchivedPatient.value = patient
      let archived: Patient[] = []
      try { archived = JSON.parse(localStorage.getItem(PREVIEW_ARCHIVED_PATIENTS_KEY) || '[]') }
      catch { archived = [] }
      localStorage.setItem(PREVIEW_ARCHIVED_PATIENTS_KEY, JSON.stringify([patient, ...archived.filter(item => item.id !== id)]))
      localStorage.setItem(PREVIEW_PATIENTS_KEY, JSON.stringify(patients.value))
      if (selectedPatientId.value === id) selectedPatientId.value = null
      return
    }
    await api('/patients/' + id, { method: 'DELETE' })
    await loadPatients()
  }
  function restoreLastPatient() {
    if (!localPreview || !lastArchivedPatient.value) return
    const patient = lastArchivedPatient.value
    patients.value.unshift(patient)
    lastArchivedPatient.value = null
    localStorage.setItem(PREVIEW_PATIENTS_KEY, JSON.stringify(patients.value))
    let archived: Patient[] = []
    try { archived = JSON.parse(localStorage.getItem(PREVIEW_ARCHIVED_PATIENTS_KEY) || '[]') }
    catch { archived = [] }
    localStorage.setItem(PREVIEW_ARCHIVED_PATIENTS_KEY, JSON.stringify(archived.filter(item => item.id !== patient.id)))
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
  return { patients, selectedPatientId, selectedPatient, examinations, findings, reports, reviewedReports,
    lastArchivedPatient, loading, error, reset, loadPatients, selectPatient, loadPatientContext,
    updateFindingStatus, updateFindingBox, saveReport, createPatient, archivePatient, restoreLastPatient, updateExaminationReview }
})
