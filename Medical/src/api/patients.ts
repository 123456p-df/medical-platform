import { mockPatients } from '@/data/mockData'
import { delay } from './client'
import type { Patient } from '@/types'

export const patientApi = {
  async getPatients(): Promise<Patient[]> {
    return delay(mockPatients)
  },

  async getPatientById(id: string): Promise<Patient | undefined> {
    return delay(mockPatients.find((patient) => patient.id === id))
  },
}
