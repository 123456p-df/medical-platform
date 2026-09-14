import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/api/client'
import { backendPatientId } from '@/utils/patientIds'
import { localPreview } from '@/utils/runtime'

export interface AIReference {
  record_id: number
  date: string
}

export interface AIChatResponse {
  answer: string
  references: AIReference[]
  context_truncated: boolean
}

export interface AIChatMessage {
  role: 'user' | 'assistant'
  text: string
  references?: AIReference[]
}

interface ReferenceDetail {
  diagnosis: string
  description: string
  record_date: string
}

interface AIThread {
  messages: AIChatMessage[]
  lastResponse: AIChatResponse | null
  reference: ReferenceDetail | null
  busy: boolean
  error: string
}

export const useAIChatStore = defineStore('ai-chat', () => {
  const configured = ref<boolean | null>(null)
  const threads = reactive<Record<string, AIThread>>({})
  const controllers = new Map<string, AbortController>()
  let statusRequest: Promise<boolean> | null = null

  function thread(key: string): AIThread {
    return threads[key] ||= { messages: [], lastResponse: null, reference: null, busy: false, error: '' }
  }

  async function refreshConfiguration() {
    if (localPreview) { configured.value = false; return false }
    if (statusRequest) return statusRequest
    statusRequest = api<{ configured: boolean }>('/ai/status')
      .then(result => configured.value = result.configured)
      .catch(() => configured.value = false)
      .finally(() => { statusRequest = null })
    return statusRequest
  }

  async function ask(key: string, patientId: string, organId: string, question: string, unavailableReason = '') {
    const state = thread(key)
    const text = question.trim()
    if (!text || state.busy) return false
    state.error = ''
    state.reference = null
    if (unavailableReason) { state.error = unavailableReason; return false }
    if (!patientId) { state.error = '请先打开一位患者的档案，以确定本次问答的资料范围。'; return false }
    if (configured.value === null) await refreshConfiguration()
    if (!configured.value) { state.error = 'AI 服务尚未连接。界面与接口已就绪，连接后即可根据当前患者的病历回答。'; return false }

    const controller = new AbortController()
    controllers.get(key)?.abort()
    controllers.set(key, controller)
    state.messages.push({ role: 'user', text })
    state.busy = true
    try {
      const response = await api<AIChatResponse>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ patient_id: backendPatientId(patientId), organ_id: organId, question: text }),
        signal: controller.signal,
      })
      if (controllers.get(key) !== controller) return false
      state.lastResponse = response
      state.messages.push({
        role: 'assistant',
        text: response.answer + (response.context_truncated ? '\n\n本次未覆盖全部历史资料。' : ''),
        references: response.references,
      })
      return true
    } catch (reason) {
      if (controllers.get(key) === controller && !controller.signal.aborted) {
        state.error = reason instanceof Error ? reason.message : '请求失败'
      }
      return false
    } finally {
      if (controllers.get(key) === controller) {
        controllers.delete(key)
        state.busy = false
      }
    }
  }

  async function openReference(key: string, id: number) {
    const state = thread(key)
    state.error = ''
    try { state.reference = await api('/medical-records/' + id) }
    catch (reason) { state.error = reason instanceof Error ? reason.message : '读取引用失败' }
  }

  function clear(key: string) {
    controllers.get(key)?.abort()
    controllers.delete(key)
    Object.assign(thread(key), { messages: [], lastResponse: null, reference: null, busy: false, error: '' })
  }

  function reset() {
    controllers.forEach(controller => controller.abort())
    controllers.clear()
    Object.keys(threads).forEach(key => delete threads[key])
    configured.value = null
  }

  return { configured, thread, refreshConfiguration, ask, openReference, clear, reset }
})
