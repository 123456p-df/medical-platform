import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { examinationApi } from '@/api/examinations'
import { patientApi } from '@/api/patients'
import { reportApi } from '@/api/reports'
import type { Examination, Finding, Patient, Report } from '@/types'
import { mockExaminations, mockFindings, mockPatients, mockReports } from '@/data/mockData'

const localPreview = import.meta.env.VITE_LOCAL_PREVIEW === 'true'

export const usePatientStore = defineStore('patients', () => {
  const patients = ref<Patient[]>([])
  const selectedPatientId = ref<string | null>(null)
  const examinations = ref<Examination[]>([])
  const findings = ref<Finding[]>([])
  const reports = ref<Report[]>([])
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
      patients.value = structuredClone(mockPatients)
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
      reports.value = structuredClone(mockReports.filter(item => item.patientId === id))
      findings.value = structuredClone(mockFindings.filter(item => item.patientId === id))
      loading.value = false
      return
    }
    try {
      const [images, records] = await Promise.all([
        examinationApi.getExaminationsByPatient(id), reportApi.getReportsByPatient(id),
      ])
      if (revision !== generation) return
      examinations.value = images; reports.value = records
    } catch (reason) {
      if (revision === generation) error.value = reason instanceof Error ? reason.message : '加载病历失败'
    } finally { if (revision === generation) loading.value = false }
  }
  async function updateFindingStatus(_id: string, _status: Finding['status']) {
    if (localPreview) {
      const finding = findings.value.find(item => item.id === _id)
      if (finding) finding.status = _status
      return
    }
    error.value = '当前模型只提供器官分割，尚无病灶审核服务。'
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
  return { patients, selectedPatientId, selectedPatient, examinations, findings, reports, reviewedReports,
    loading, error, reset, loadPatients, selectPatient, loadPatientContext, updateFindingStatus, saveReport }
})
