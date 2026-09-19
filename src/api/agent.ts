import { request, token } from './client'

export interface AgentStatus {
  pi_framework: {
    name: string
    version: string
    mode: string
    available: boolean
  }
  llm_provider: {
    base_url: string
    model: string
    key_configured: boolean
  }
  radsight_microservice: {
    url: string
    status: string
    details: {
      status?: string
      loaded?: boolean
      stub?: boolean
      quant?: string
      device?: string
      error?: string | null
      [key: string]: unknown
    }
  }
}

export interface AgentConversationItem {
  id: string
  patient_id: number
  doctor_id: number
  title: string
  created_at: string | null
  updated_at: string | null
}

export interface AgentMessageItem {
  id: number
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  tool_calls: Array<{
    tool: string
    args?: Record<string, any>
    result?: Record<string, any>
  }>
  selected_ct_series?: string | null
  thought?: string | null
  created_at: string | null
  plan?: StructuredTreatmentPlan | null
}

export interface StructuredReport {
  type?: string
  patient_id: number
  study_id?: string
  exam_technique: string
  findings: string
  impression: string
  recommendations: string
  generated_at?: string
}

export interface StructuredTreatmentPlan {
  type?: string
  patient_id: number
  study_id?: string | null
  symptom_analysis: string
  working_diagnosis: string
  differential?: string
  workup: string
  pharmacologic: string
  nonpharmacologic?: string
  followup: string
  red_flags: string
  disclaimer?: string
  generated_at?: string
}

export interface StreamChatParams {
  conversation_id: string
  patient_id: number
  message: string
  active_study_id?: string
  active_series_id?: string
  active_slice?: number
  onStart?: () => void
  onThinking?: (delta: string) => void
  onTextDelta?: (delta: string) => void
  onToolStart?: (tool: string, args: Record<string, any>) => void
  onToolEnd?: (tool: string, result: Record<string, any>) => void
  onSeriesSelected?: (seriesId: string, filename: string) => void
  onReportCard?: (report: StructuredReport) => void
  onPlanCard?: (plan: StructuredTreatmentPlan) => void
  onDone?: (fullText: string) => void
  onError?: (err: Error) => void
}

export async function getAgentStatus(): Promise<AgentStatus> {
  const res = await request('/agent/status')
  const json = await res.json()
  return json.data
}

export async function listAgentConversations(patientId: number): Promise<AgentConversationItem[]> {
  const res = await request(`/agent/conversations?patient_id=${patientId}`)
  const json = await res.json()
  return json.data || []
}

export async function createAgentConversation(patientId: number, title?: string): Promise<AgentConversationItem> {
  const res = await request('/agent/conversations', {
    method: 'POST',
    body: JSON.stringify({ patient_id: patientId, title }),
  })
  const json = await res.json()
  return json.data
}

export async function getAgentMessages(conversationId: string): Promise<AgentMessageItem[]> {
  const res = await request(`/agent/conversations/${encodeURIComponent(conversationId)}/messages`)
  const json = await res.json()
  return json.data || []
}

export async function streamAgentChat(params: StreamChatParams, abortSignal?: AbortSignal): Promise<void> {
  const headers = new Headers({
    'Content-Type': 'application/json',
  })
  const accessToken = token()
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch('/api/v1/agent/chat/stream', {
    method: 'POST',
    headers,
    signal: abortSignal,
    body: JSON.stringify({
      conversation_id: params.conversation_id,
      patient_id: params.patient_id,
      message: params.message,
      active_study_id: params.active_study_id,
      active_series_id: params.active_series_id,
      active_slice: params.active_slice,
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    const error = new Error(`Agent stream failed (${response.status}): ${errText}`)
    params.onError?.(error)
    throw error
  }

  const reader = response.body?.getReader()
  if (!reader) {
    const error = new Error('ReadableStream not supported by browser environment')
    params.onError?.(error)
    throw error
  }

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data: ')) continue

        try {
          const payload = JSON.parse(trimmed.slice(6))
          switch (payload.type) {
            case 'start':
              params.onStart?.()
              break
            case 'thinking':
              params.onThinking?.(payload.delta)
              break
            case 'text_delta':
              params.onTextDelta?.(payload.delta)
              break
            case 'tool_call_start':
              params.onToolStart?.(payload.tool, payload.args)
              break
            case 'tool_call_end':
              params.onToolEnd?.(payload.tool, payload.result)
              break
            case 'series_selected':
              params.onSeriesSelected?.(payload.series_id, payload.filename)
              break
            case 'report_card':
              params.onReportCard?.(payload.report)
              break
            case 'plan_card':
              params.onPlanCard?.(payload.plan)
              break
            case 'done':
              params.onDone?.(payload.full_text)
              break
            case 'error':
              params.onError?.(new Error(payload.message))
              break
          }
        } catch (_) {
          // Ignore partial or unparseable SSE lines
        }
      }
    }
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      params.onError?.(err)
      throw err
    }
  } finally {
    reader.releaseLock()
  }
}
