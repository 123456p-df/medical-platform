import type { Finding } from '@/types'
// Segmentation does not provide lesion diagnoses. No mock findings are shown as real output.
export const findingApi = {
  async getFindingsByExamination(_id: string): Promise<Finding[]> { return [] },
  async getFindingsByPatient(_id: string): Promise<Finding[]> { return [] },
  async updateFindingStatus(_id: string, _status: Finding['status']): Promise<Finding | undefined> {
    throw new Error('Finding review is not configured.')
  },
}
