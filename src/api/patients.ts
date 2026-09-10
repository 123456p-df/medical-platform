import { api, collection } from './client'
import { mapPatient, type PatientDTO } from './mappers'
export const patientApi = {
  async getPatients() { return (await collection<PatientDTO>('/patients')).map(mapPatient) },
  async getPatientById(id: string) { return (await this.getPatients()).find(p => p.id === id) },
  resolve(name: string, id_number: string) {
    return api<{ patient_id: number }>('/doctor/patients/resolve', { method: 'POST', body: JSON.stringify({ name, id_number }) })
  },
}
