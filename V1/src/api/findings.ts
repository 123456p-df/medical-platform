import { mockFindings } from '@/data/mockData'
import { delay } from './client'
import type { Finding } from '@/types'
import { readLocal, writeLocal } from './localData'

const allFindings = () => readLocal<Finding[]>('findings', mockFindings)

export const findingApi = {
  async getFindingsByExamination(examinationId: string): Promise<Finding[]> {
    return delay(allFindings().filter((finding) => finding.examinationId === examinationId))
  },

  async getFindingsByPatient(patientId: string): Promise<Finding[]> {
    return delay(allFindings().filter((finding) => finding.patientId === patientId))
  },

  async updateFindingStatus(
    findingId: string,
    status: Finding['status'],
  ): Promise<Finding | undefined> {
    return this.updateFinding(findingId, { status })
  },

  async updateFinding(findingId: string, changes: Partial<Pick<Finding, 'label' | 'description' | 'severity' | 'status'>>): Promise<Finding> {
    const findings = allFindings()
    const index = findings.findIndex((item) => item.id === findingId)
    if (index < 0) throw new Error('Finding not found.')
    const updated = { ...findings[index], ...changes }
    findings[index] = updated
    writeLocal('findings', findings)
    return delay(updated)
  },
}
