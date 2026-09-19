import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/api/client'
import { aiApi } from '@/api/ai'
import { backendPatientId } from '@/utils/patientIds'
import { localPreview } from '@/utils/runtime'
import { usePatientStore } from '@/stores/patients'
import type { AICapability } from '@/types'

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
  const capabilities = ref<AICapability[]>([])
  const threads = reactive<Record<string, AIThread>>({})
const controllers = new Map<string, AbortController>()
let statusRequest: Promise<boolean> | null = null
const THREADS_KEY = 'pulmolink-ai-threads-v1'

function readThreads(): Record<string, AIThread> {
  try {
    return JSON.parse(localStorage.getItem(THREADS_KEY) || '{}')
  } catch {
    return {}
  }
}

function persistThreads() {
  localStorage.setItem(THREADS_KEY, JSON.stringify(threads))
}

  function mockAnswer(organId: string, question: string) {
    const organText = organId === 'lung'
      ? '肺部影像和报告'
      : organId === 'brain'
        ? '颅脑影像和报告'
        : `${organId} 相关影像和报告`
    if (/总结|汇总|最近/.test(question)) {
      return `Local preview simulated summary: 当前患者已有若干${organText}记录，显示为已由医生整理。实际接入 AI 服务后，这里会依据真实签署报告给出带日期和来源的回答。`
    }
    return `Local preview simulated answer: 关于“${question}”，我会优先核对${organText}中的已签署内容、检查日期和报告引用。当前没有调用外部模型，不会把模拟文本当作临床结论。`
  }

  function mockReferences(patientId: string, organId: string): AIReference[] {
    const patients = usePatientStore()
    return patients.reviewedReports
      .filter(report => report.patientId === patientId)
      .filter(report => {
        const organs = report.organIds?.length ? report.organIds : [report.organId || 'other']
        return organs.includes(organId)
      })
      .slice(0, 3)
      .map(report => ({
        record_id: Number(report.id.replace(/\D/g, '')) || 1,
        date: report.date,
      }))
  }

  function thread(key: string): AIThread {
    if (threads[key]) return threads[key]
    const stored = readThreads()[key]
    threads[key] = stored || { messages: [], lastResponse: null, reference: null, busy: false, error: '' }
    return threads[key]
  }

  async function refreshConfiguration() {
    if (localPreview) { configured.value = true; return true }
    if (statusRequest) return statusRequest
    statusRequest = api<{ configured: boolean }>('/ai/status')
      .then(result => configured.value = result.configured)
      .catch(() => configured.value = false)
      .finally(() => { statusRequest = null })
    return statusRequest
  }

  async function loadCapabilities(organId: string, examinationId = '') {
    if (localPreview) {
      capabilities.value = [
        { purpose: 'record_summary', available: true, providerId: 'local-preview', modelId: 'simulated', reason: null },
        { purpose: 'report_draft', available: true, providerId: 'local-preview', modelId: 'simulated', reason: null },
        { purpose: 'report_qa', available: true, providerId: 'local-preview', modelId: 'simulated', reason: null },
      ]
      return capabilities.value
    }
    capabilities.value = await aiApi.getCapabilities({ organId, examinationId })
    return capabilities.value
  }

  async function ask(
    key: string,
    patientId: string,
    organId: string,
    question: string,
    unavailableReason = '',
    examinationId = '',
  ) {
    const state = thread(key)
    const text = question.trim()
    if (!text || state.busy) return false
    state.error = ''
    state.reference = null
    if (unavailableReason) { state.error = unavailableReason; return false }
    if (!patientId) { state.error = '请先打开一位患者的档案，以确定本次问答的资料范围。'; return false }
    if (configured.value === null) await refreshConfiguration()
    if (!configured.value) { state.error = 'AI 服务尚未连接。界面与接口已就绪，连接后即可根据当前患者的病历回答。'; return false }

    if (localPreview) {
      state.messages.push({ role: 'user', text })
      state.busy = true
      const response: AIChatResponse = {
        answer: mockAnswer(organId, text),
        references: mockReferences(patientId, organId),
        context_truncated: false,
      }
      state.lastResponse = response
      state.messages.push({ role: 'assistant', text: response.answer, references: response.references })
      state.busy = false
      persistThreads()
      return true
    }

    const controller = new AbortController()
    controllers.get(key)?.abort()
    controllers.set(key, controller)
    state.messages.push({ role: 'user', text })
    state.busy = true
    try {
      const response = await api<AIChatResponse>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          patient_id: backendPatientId(patientId),
          organ_id: organId,
          examination_id: examinationId || null,
          question: text,
        }),
        signal: controller.signal,
      })
      if (controllers.get(key) !== controller) return false
      state.lastResponse = response
      state.messages.push({
        role: 'assistant',
        text: response.answer + (response.context_truncated ? '\n\n本次未覆盖全部历史资料。' : ''),
        references: response.references,
      })
      persistThreads()
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
    if (localPreview) {
      const patients = usePatientStore()
      const report = patients.reports.find(item => item.id === String(id) || item.id.endsWith(String(id)))
      if (report) {
        state.reference = {
          diagnosis: report.diagnosis,
          description: report.description,
          record_date: report.date,
        }
        persistThreads()
        return
      }
      state.reference = { diagnosis: '模拟引用', description: '这是本地演示环境中的模拟报告引用。', record_date: '' }
      persistThreads()
      return
    }
    try { state.reference = await api('/medical-records/' + id) }
    catch (reason) { state.error = reason instanceof Error ? reason.message : '读取引用失败' }
    persistThreads()
  }

  function clear(key: string) {
    controllers.get(key)?.abort()
    controllers.delete(key)
    Object.assign(thread(key), { messages: [], lastResponse: null, reference: null, busy: false, error: '' })
    persistThreads()
  }

  function reset() {
    controllers.forEach(controller => controller.abort())
    controllers.clear()
    Object.keys(threads).forEach(key => delete threads[key])
    configured.value = null
    capabilities.value = []
    localStorage.removeItem(THREADS_KEY)
  }

  return { configured, capabilities, thread, refreshConfiguration, loadCapabilities, ask, openReference, clear, reset }
})
