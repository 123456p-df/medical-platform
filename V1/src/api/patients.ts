import { mockPatients, mockExaminations, mockReports } from '@/data/mockData'
import { delay } from './client'
import type { Patient, Report } from '@/types'
import { getUploads } from './uploads'
import { readLocal } from './localData'

export const patientApi = {
  async getPatients(): Promise<Patient[]> {
    const uploads = await getUploads()
    const reports = readLocal<Report[]>('reports', mockReports)
    return delay(mockPatients.map((patient): Patient => {
      const uploaded = uploads.filter((study) => study.examination.patientId === patient.id).map((study) => study.examination).sort((a, b) => b.id.localeCompare(a.id))[0]
      const latest = uploaded ?? mockExaminations.filter((exam) => exam.patientId === patient.id).sort((a, b) => b.date.localeCompare(a.date))[0]
      const report = reports.find((item) => item.examinationId === latest?.id)
      return { ...patient,
        ...(uploaded ? { modality: uploaded.type, organ: uploaded.organ, lastExamDate: uploaded.date } : {}),
        status: report?.reviewed ? 'Reviewed' : uploaded ? 'Pending Review' : patient.status,
      }
    }))
  },

  async getPatientById(id: string): Promise<Patient | undefined> {
    return (await this.getPatients()).find((patient) => patient.id === id)
  },
}
