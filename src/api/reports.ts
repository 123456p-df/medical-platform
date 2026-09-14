import { api, collection } from './client'
import { mapAddendum, mapRecord, type AddendumDTO, type RecordDTO } from './mappers'
import type { Report, ReportAddendum } from '@/types'
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
  async getAddenda(id: string): Promise<ReportAddendum[]> {
    return (await api<AddendumDTO[]>('/medical-records/' + id + '/addenda')).map(mapAddendum)
  },
  async addAddendum(id: string, reason: string, content: string): Promise<ReportAddendum> {
    return mapAddendum(await api<AddendumDTO>('/medical-records/' + id + '/addenda', {
      method: 'POST', body: JSON.stringify({ reason, content }),
    }))
  },
}
