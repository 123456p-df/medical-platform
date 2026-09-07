import { mockExaminations } from '@/data/mockData'
import { delay } from './client'
import type { Examination } from '@/types'

export const examinationApi = {
  async getExaminationsByPatient(patientId: string): Promise<Examination[]> {
    return delay(
      mockExaminations
        .filter((examination) => examination.patientId === patientId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    )
  },

  async getExaminationById(id: string): Promise<Examination | undefined> {
    return delay(mockExaminations.find((examination) => examination.id === id))
  },
}
