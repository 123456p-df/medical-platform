import { mockExaminations } from '@/data/mockData'
import { delay } from './client'
import type { Examination } from '@/types'
import { getUploads } from './uploads'
import { readLocal } from './localData'
import { mockReports } from '@/data/mockData'
import type { Report } from '@/types'

export const examinationApi = {
  async getExaminationsByPatient(patientId: string): Promise<Examination[]> {
    const uploads = (await getUploads()).map((study) => study.examination).filter((exam) => exam.patientId === patientId)
    const exams = uploads.length ? uploads : mockExaminations.filter((exam) => exam.patientId === patientId)
    const reports = readLocal<Report[]>('reports', mockReports)
    return delay(exams.map((exam): Examination => reports.some((report) => report.examinationId === exam.id && report.reviewed) ? { ...exam, status: 'Reviewed' } : exam).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)))
  },

  async getExaminationById(id: string): Promise<Examination | undefined> {
    const uploads = await getUploads()
    return delay(uploads.find((study) => study.examination.id === id)?.examination ?? mockExaminations.find((examination) => examination.id === id))
  },
}
