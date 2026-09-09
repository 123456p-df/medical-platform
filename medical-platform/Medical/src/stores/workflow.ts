import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { api, collection } from '@/api/client'
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
    try { const result = await collection<WorkItem>('/workflow'); if (current === generation) items.value = result }
    catch (e) { if (current === generation) error.value = e instanceof Error ? e.message : '加载待办失败' }
    finally { if (current === generation) loading.value = false }
  }
  async function complete(id: string, completed: boolean) {
    await api('/medical-images/' + id + '/review', { method: 'PATCH', body: JSON.stringify({ completed }) })
    await load()
  }
  return { items, pending, error, loading, load, complete, reset }
})
