import { mockReports } from '@/data/mockData'
import { delay } from './client'
import type { Report } from '@/types'

export const reportApi = {
  async getReportsByPatient(patientId: string): Promise<Report[]> {
    return delay(
      mockReports
        .filter((report) => report.patientId === patientId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    )
  },

  async getReviewedReportsByPatient(patientId: string): Promise<Report[]> {
    return delay(
      mockReports
        .filter((report) => report.patientId === patientId && report.reviewed)
        .sort((a, b) => b.date.localeCompare(a.date)),
    )
  },

  async getReportById(id: string): Promise<Report | undefined> {
    return delay(mockReports.find((report) => report.id === id))
  },

  async saveReport(report: Report): Promise<Report> {
    const index = mockReports.findIndex((item) => item.id === report.id)
    if (index >= 0) {
      mockReports[index] = report
    } else {
      mockReports.push(report)
    }
    return delay(report)
  },
}
