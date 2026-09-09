import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api, collection } from '@/api/client'
import { mockExaminations, mockPatients } from '@/data/mockData'
const localPreview = import.meta.env.VITE_LOCAL_PREVIEW === 'true'
export interface WorkItem {
  image_id: string; patient_id: number; patient_name: string; image_type: string
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
      const examination = mockExaminations[0]
      const patient = mockPatients.find(item => item.id === examination.patientId)
      items.value = [{ image_id: examination.id, patient_id: 1, patient_name: patient?.name || 'Demo Patient', image_type: examination.type, organ_id: 'lung', created_at: `${examination.date}T09:00:00Z`, completed_at: null }]
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
      return
    }
    await api('/medical-images/' + id + '/review', { method: 'PATCH', body: JSON.stringify({ completed }) })
    await load()
  }
  return { items, pending, error, loading, load, complete, reset }
})
