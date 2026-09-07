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
  const loading = ref(false)
  const error = ref<string | null>(null)

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
    selectedPatientId.value = id
    await loadPatientContext(id)
  }

  async function loadPatientContext(id: string) {
    loading.value = true
    error.value = null
    try {
      const [examResults, findingResults, reportResults, reviewedResults] = await Promise.all([
        examinationApi.getExaminationsByPatient(id),
        findingApi.getFindingsByPatient(id),
        reportApi.getReportsByPatient(id),
        reportApi.getReviewedReportsByPatient(id),
      ])
      examinations.value = examResults
      findings.value = findingResults
      reports.value = reportResults
      reviewedReports.value = reviewedResults
    } catch {
      error.value = 'Unable to load patient record.'
    } finally {
      loading.value = false
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
  }

  return {
    patients,
    selectedPatientId,
    selectedPatient,
    examinations,
    findings,
    reports,
    reviewedReports,
    loading,
    error,
    loadPatients,
    selectPatient,
    loadPatientContext,
    updateFindingStatus,
    saveReport,
  }
})
