import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api, collection } from '@/api/client'
import { mockExaminations, mockPatients } from '@/data/mockData'
import { localPreview } from '@/utils/runtime'
import { getLocalUploads } from '@/api/localStudyRepository'
import { usePatientStore } from './patients'
const PREVIEW_REVIEW_KEY = 'pulmolink-preview-review-status-v2'
interface PreviewReviewState { completed: boolean; completedAt: string | null }

function readReviewStatus() {
  try {
    const raw = JSON.parse(localStorage.getItem(PREVIEW_REVIEW_KEY) || '{}') as Record<string, string | PreviewReviewState>
    return Object.fromEntries(Object.entries(raw).map(([id, value]) => [id,
      typeof value === 'string'
        ? { completed: Boolean(value), completedAt: value || null }
        : { completed: Boolean(value.completed), completedAt: value.completedAt || null },
    ])) as Record<string, PreviewReviewState>
  } catch { return {} }
}
export interface WorkItem {
  image_id: string; patient_id: number | string; patient_name: string; image_type: string
  organ_id: string; created_at: string; completed_at: string | null
}
export const useWorkflowStore = defineStore('workflow', () => {
  const items = ref<WorkItem[]>([]), error = ref(''), loading = ref(false)
  const pending = computed(() => items.value.filter(i => !i.completed_at))
  let generation = 0
  function reset() { generation++; items.value = []; error.value = ''; loading.value = false }
  async function load() {
    const current = ++generation
    loading.value = true; error.value = ''
    if (localPreview) {
      const saved = readReviewStatus()
      let uploaded = [] as typeof mockExaminations
      try { uploaded = (await getLocalUploads()).map(study => study.examination) }
      catch { /* The bundled preview workflow remains usable without IndexedDB. */ }
      if (current !== generation) return
      const patientStore = usePatientStore()
      const visiblePatientIds = new Set(patientStore.patients.map(patient => patient.id))
      items.value = [...uploaded, ...mockExaminations]
        .filter(examination => !visiblePatientIds.size || visiblePatientIds.has(examination.patientId))
        .map(examination => {
        const patient = patientStore.patients.find(item => item.id === examination.patientId)
          || mockPatients.find(item => item.id === examination.patientId)
        const initiallyComplete = ['Reviewed', 'Completed'].includes(examination.status) ? `${examination.date}T18:00:00Z` : null
        const stored = saved[examination.id]
        return { image_id: examination.id, patient_id: examination.patientId, patient_name: patient?.name || examination.patientId, image_type: examination.type, organ_id: examination.organId || examination.organ.toLowerCase(), created_at: `${examination.date}T09:00:00Z`, completed_at: stored ? stored.completedAt : initiallyComplete }
      })
      loading.value = false
      return
    }
    try { const result = await collection<WorkItem>('/workflow'); if (current === generation) items.value = result }
    catch (e) { if (current === generation) error.value = e instanceof Error ? e.message : '加载待办失败' }
    finally { if (current === generation) loading.value = false }
  }
  async function complete(id: string, completed: boolean) {
    if (localPreview) {
      const item = items.value.find(entry => entry.image_id === id)
      if (item) item.completed_at = completed ? new Date().toISOString() : null
      const saved = readReviewStatus()
      saved[id] = { completed, completedAt: completed ? item?.completed_at || new Date().toISOString() : null }
      localStorage.setItem(PREVIEW_REVIEW_KEY, JSON.stringify(saved))
      usePatientStore().updateExaminationReview(id, completed)
      return
    }
    await api('/medical-images/' + id + '/review', { method: 'PATCH', body: JSON.stringify({ completed }) })
    await load()
    usePatientStore().updateExaminationReview(id, completed)
  }
  return { items, pending, error, loading, load, complete, reset }
})
