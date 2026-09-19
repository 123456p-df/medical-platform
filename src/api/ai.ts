import { api } from './client'
import type {
  AICapability,
  AIInvocation,
  AIInvocationAttempt,
} from '@/types'

interface AICapabilityDTO {
  purpose: AICapability['purpose']
  available: boolean
  provider_id: string | null
  model_id: string | null
  reason: string | null
}

interface AIInvocationDTO {
  invocation_id: string
  patient_id: number
  examination_id: string | null
  organ_id: string
  purpose: AICapability['purpose']
  status: AIInvocation['status']
  provider_id: string | null
  model_id: string | null
  base_revision: number | null
  result: Record<string, unknown> | null
  error_code: number | null
  error_message: string | null
  created_at: string
  updated_at: string
}

interface AIInvocationAttemptDTO {
  attempt_id: number
  invocation_id: string
  attempt_number: number
  status: AIInvocationAttempt['status']
  provider_id: string | null
  model_id: string | null
  started_at: string | null
  finished_at: string | null
  error_code: number | null
  error_message: string | null
  usage: Record<string, unknown>
  created_at: string
}

function mapCapability(item: AICapabilityDTO): AICapability {
  return {
    purpose: item.purpose,
    available: item.available,
    providerId: item.provider_id,
    modelId: item.model_id,
    reason: item.reason,
  }
}

function mapInvocation(item: AIInvocationDTO): AIInvocation {
  return {
    id: item.invocation_id,
    patientId: String(item.patient_id),
    examinationId: item.examination_id,
    organId: item.organ_id,
    purpose: item.purpose,
    status: item.status,
    providerId: item.provider_id,
    modelId: item.model_id,
    baseRevision: item.base_revision,
    result: item.result,
    errorCode: item.error_code,
    errorMessage: item.error_message,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

function mapAttempt(item: AIInvocationAttemptDTO): AIInvocationAttempt {
  return {
    id: String(item.attempt_id),
    invocationId: item.invocation_id,
    attemptNumber: item.attempt_number,
    status: item.status,
    providerId: item.provider_id,
    modelId: item.model_id,
    startedAt: item.started_at,
    finishedAt: item.finished_at,
    errorCode: item.error_code,
    errorMessage: item.error_message,
    usage: item.usage,
    createdAt: item.created_at,
  }
}

export const aiApi = {
  async getCapabilities(input: {
    organId: string
    examinationId?: string
  }): Promise<AICapability[]> {
    const query = new URLSearchParams({ organ_id: input.organId })
    if (input.examinationId) query.set('examination_id', input.examinationId)
    return (await api<AICapabilityDTO[]>('/ai/capabilities?' + query.toString())).map(mapCapability)
  },
  async createInvocation(input: {
    patientId: string
    organId: string
    examinationId?: string | null
    purpose: AICapability['purpose']
    question?: string
    baseRevision?: number
    idempotencyKey?: string
  }): Promise<AIInvocation> {
    return mapInvocation(await api<AIInvocationDTO>('/ai/invocations', {
      method: 'POST',
      body: JSON.stringify({
        patient_id: Number(input.patientId),
        organ_id: input.organId,
        examination_id: input.examinationId || null,
        purpose: input.purpose,
        question: input.question,
        base_revision: input.baseRevision,
        idempotency_key: input.idempotencyKey,
      }),
    }))
  },
  async getInvocation(id: string): Promise<AIInvocation> {
    return mapInvocation(await api<AIInvocationDTO>('/ai/invocations/' + id))
  },
  async getAttempts(id: string): Promise<AIInvocationAttempt[]> {
    return (await api<AIInvocationAttemptDTO[]>('/ai/invocations/' + id + '/attempts')).map(mapAttempt)
  },
  async cancelInvocation(id: string): Promise<AIInvocation> {
    return mapInvocation(await api<AIInvocationDTO>('/ai/invocations/' + id + '/cancel', {
      method: 'POST',
    }))
  },
}
