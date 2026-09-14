import { api, collection } from './client'
import { mapPatient, type PatientDTO } from './mappers'
export const patientApi = {
  async getPatients() { return (await collection<PatientDTO>('/patients')).map(mapPatient) },
  async getPatientPage(options: { page: number; pageSize: number; search?: string; modality?: string; organId?: string; reviewStatus?: string; sort?: 'id' | 'name'; direction?: 'asc' | 'desc'; signal?: AbortSignal }) {
    const params = new URLSearchParams({ page: String(options.page), page_size: String(options.pageSize), sort: options.sort || 'name', direction: options.direction || 'asc' })
    if (options.search) params.set('search', options.search)
    if (options.modality) params.set('modality', options.modality)
    if (options.organId) params.set('organ_id', options.organId)
    if (options.reviewStatus) params.set('review_status', options.reviewStatus)
    const result = await api<{ items: PatientDTO[]; total: number; page: number; page_size: number }>('/patients?' + params, { signal: options.signal })
    return { ...result, items: result.items.map(mapPatient) }
  },
  async getPatientById(id: string) { return (await this.getPatients()).find(p => p.id === id) },
  resolve(name: string, id_number: string) {
    return api<{ patient_id: number }>('/doctor/patients/resolve', { method: 'POST', body: JSON.stringify({ name, id_number }) })
  },
  linkExisting(name: string, id_number: string, birth_date: string | null) {
    return api<{ patient_id: number; name: string | null; already_linked: boolean }>('/doctor/patients/link-existing', {
      method: 'POST',
      body: JSON.stringify({ name, id_number, birth_date }),
    })
  },
  createInvitation(patientId: string, expiresMinutes = 30) {
    return api<{ invitation_id: string; patient_id: number; patient_name: string | null; code: string; expires_at: string }>(
      `/doctor/patients/${patientId}/invitations`,
      { method: 'POST', body: JSON.stringify({ expires_minutes: expiresMinutes }) },
    )
  },
  completeOnboarding(payload: Record<string, unknown>) {
    return api<{ patient_id: number }>('/patient/onboarding', { method: 'PATCH', body: JSON.stringify(payload) })
  },
  linkWithInvitation(token: string, name: string, id_number: string) {
    return api<{ patient_id: number }>('/patient/link', {
      method: 'POST',
      body: JSON.stringify({ token, name, id_number }),
    })
  },
}
