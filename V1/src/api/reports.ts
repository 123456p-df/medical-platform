import { mockReports } from '@/data/mockData'
import { delay } from './client'
import type { Report } from '@/types'
import { readLocal, writeLocal } from './localData'

const allReports = () => readLocal<Report[]>('reports', mockReports)

export const reportApi = {
  async getReportsByPatient(patientId: string): Promise<Report[]> {
    return delay(
      allReports()
        .filter((report) => report.patientId === patientId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    )
  },

  async getReviewedReportsByPatient(patientId: string): Promise<Report[]> {
    return delay(
      allReports()
        .filter((report) => report.patientId === patientId && report.reviewed)
        .sort((a, b) => b.date.localeCompare(a.date)),
    )
  },

  async getReportById(id: string): Promise<Report | undefined> {
    return delay(allReports().find((report) => report.id === id))
  },

  async saveReport(report: Report): Promise<Report> {
    const reports = allReports()
    const index = reports.findIndex((item) => item.id === report.id)
    if (index >= 0) {
      reports[index] = report
    } else {
      reports.push(report)
    }
    writeLocal('reports', reports)
    return delay({ ...report })
  },
}
