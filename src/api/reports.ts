import { api, collection } from './client'
import { mapRecord, type RecordDTO } from './mappers'
import type { Report } from '@/types'
export const reportApi = {
  async getReportsByPatient(id: string) { return (await collection<RecordDTO>('/patients/' + id + '/medical-records')).map(mapRecord) },
  async getReviewedReportsByPatient(id: string) { return this.getReportsByPatient(id) },
  async getReportById(id: string) { return mapRecord(await api<RecordDTO>('/medical-records/' + id)) },
  async saveReport(report: Report) {
    const creating = !report.id
    const data = await api<RecordDTO>(creating ? '/patients/' + report.patientId + '/medical-records' : '/medical-records/' + report.id, {
      method: creating ? 'POST' : 'PATCH', body: JSON.stringify({ organ_id: report.organIds?.[0] || report.organId || 'other', organ_ids: report.organIds || [report.organId || 'other'],
        examination_id: report.examinationId || null, diagnosis: report.diagnosis, description: report.description,
        recommendation: report.recommendation, reviewed: report.reviewed, record_date: report.date }),
    })
    return mapRecord(data)
  },
}
