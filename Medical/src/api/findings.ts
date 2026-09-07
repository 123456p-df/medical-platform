import { mockFindings } from '@/data/mockData'
import { delay } from './client'
import type { Finding } from '@/types'

export const findingApi = {
  async getFindingsByExamination(examinationId: string): Promise<Finding[]> {
    return delay(mockFindings.filter((finding) => finding.examinationId === examinationId))
  },

  async getFindingsByPatient(patientId: string): Promise<Finding[]> {
    return delay(mockFindings.filter((finding) => finding.patientId === patientId))
  },

  async updateFindingStatus(
    findingId: string,
    status: Finding['status'],
  ): Promise<Finding | undefined> {
    const finding = mockFindings.find((item) => item.id === findingId)
    if (finding) {
      finding.status = status
    }
    return delay(finding)
  },
}
