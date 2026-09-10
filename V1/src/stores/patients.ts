import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { examinationApi } from '@/api/examinations'
import { findingApi } from '@/api/findings'
import { patientApi } from '@/api/patients'
import { reportApi } from '@/api/reports'
import type { Examination, Finding, Patient, Report } from '@/types'

export const usePatientStore = defineStore('patients', () => {
  const patients = ref<Patient[]>([])
  const selectedPatientId = ref<string | null>(null)
  const examinations = ref<Examination[]>([])
  const findings = ref<Finding[]>([])
  const reports = ref<Report[]>([])
  const reviewedReports = ref<Report[]>([])
  const activeExamId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  let contextRequest = 0

  const selectedPatient = computed(
    () => patients.value.find((patient) => patient.id === selectedPatientId.value) ?? null,
  )

  async function loadPatients() {
    loading.value = true
    error.value = null
    try {
      patients.value = await patientApi.getPatients()
    } catch {
      error.value = 'Unable to load patient list.'
    } finally {
      loading.value = false
    }
  }

  async function selectPatient(id: string) {
    if (selectedPatientId.value !== id) activeExamId.value = null
    selectedPatientId.value = id
    await loadPatientContext(id)
  }

  async function loadPatientContext(id: string) {
    const request = ++contextRequest
    loading.value = true
    error.value = null
    try {
      const [examResults, findingResults, reportResults, reviewedResults] = await Promise.all([
        examinationApi.getExaminationsByPatient(id),
        findingApi.getFindingsByPatient(id),
        reportApi.getReportsByPatient(id),
        reportApi.getReviewedReportsByPatient(id),
      ])
      if (request !== contextRequest) return
      examinations.value = examResults
      const examIds = new Set(examResults.map((exam) => exam.id))
      findings.value = findingResults.filter((item) => examIds.has(item.examinationId))
      reports.value = reportResults.filter((item) => examIds.has(item.examinationId))
      reviewedReports.value = reviewedResults.filter((item) => examIds.has(item.examinationId))
      if (!activeExamId.value || !examIds.has(activeExamId.value)) activeExamId.value = examResults[0]?.id ?? null
    } catch {
      if (request === contextRequest) error.value = 'Unable to load patient record.'
    } finally {
      if (request === contextRequest) loading.value = false
    }
  }

  async function updateFindingStatus(findingId: string, status: Finding['status']) {
    const updated = await findingApi.updateFindingStatus(findingId, status)
    if (updated) {
      const index = findings.value.findIndex((finding) => finding.id === findingId)
      if (index >= 0) {
        findings.value[index] = updated
      }
    }
  }

  async function saveReport(report: Report) {
    const saved = await reportApi.saveReport(report)
    const index = reports.value.findIndex((item) => item.id === report.id)
    if (index >= 0) {
      reports.value[index] = saved
    } else {
      reports.value.push(saved)
    }
    reviewedReports.value = reports.value.filter((item) => item.reviewed)
    examinations.value = examinations.value.map((exam) => exam.id === saved.examinationId ? { ...exam, status: saved.reviewed ? 'Reviewed' : 'Pending Review' } : exam)
    patients.value = await patientApi.getPatients()
  }

  async function modifyFinding(findingId: string, changes: Pick<Finding, 'label' | 'description' | 'severity'>) {
    const updated = await findingApi.updateFinding(findingId, { ...changes, status: 'modified' })
    findings.value = findings.value.map((finding) => finding.id === findingId ? updated : finding)
  }

  return {
    patients,
    selectedPatientId,
    selectedPatient,
    examinations,
    findings,
    reports,
    reviewedReports,
    activeExamId,
    loading,
    error,
    loadPatients,
    selectPatient,
    loadPatientContext,
    updateFindingStatus,
    modifyFinding,
    saveReport,
  }
})
