import { api, collection } from './client'
import {
  mapAddendum,
  mapRecord,
  mapReportEvent,
  mapReportTask,
  type AddendumDTO,
  type RecordDTO,
  type ReportEventDTO,
  type ReportTaskDTO,
} from './mappers'
import type { Report, ReportAddendum, ReportEvent, ReportTask, ReportTaskStatus } from '@/types'
export const reportApi = {
  async getReportsByPatient(id: string) { return (await collection<RecordDTO>('/patients/' + id + '/medical-records')).map(mapRecord) },
  async getReviewedReportsByPatient(id: string) { return this.getReportsByPatient(id) },
  async getReportById(id: string) { return mapRecord(await api<RecordDTO>('/medical-records/' + id)) },
  async saveReport(report: Report) {
    const creating = !report.id
    const data = await api<RecordDTO>(creating ? '/patients/' + report.patientId + '/medical-records' : '/medical-records/' + report.id, {
      method: creating ? 'POST' : 'PATCH', body: JSON.stringify({ organ_id: report.organIds?.[0] || report.organId || 'other', organ_ids: report.organIds || [report.organId || 'other'],
        examination_id: report.examinationId || null, diagnosis: report.diagnosis, description: report.description,
        recommendation: report.recommendation, reviewed: report.reviewed, record_date: report.date,
        expected_revision: creating ? undefined : report.revision }),
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
  async applyAICandidate(
    id: string,
    candidateFields: Record<string, string>,
    expectedRevision: number,
    replace = false,
  ): Promise<Report> {
    return mapRecord(await api<RecordDTO>('/medical-records/' + id + '/apply-ai-candidate', {
      method: 'POST',
      body: JSON.stringify({
        expected_revision: expectedRevision,
        candidate_fields: candidateFields,
        replace,
      }),
    }))
  },
  async transitionReport(
    id: string,
    action: 'submit' | 'sign' | 'reopen' | 'cancel',
    expectedRevision: number,
    reason?: string,
  ): Promise<Report> {
    return mapRecord(await api<RecordDTO>('/medical-records/' + id + '/transition', {
      method: 'POST',
      body: JSON.stringify({ action, expected_revision: expectedRevision, reason: reason || null }),
    }))
  },
  async getReportEvents(id: string): Promise<ReportEvent[]> {
    return (await api<ReportEventDTO[]>('/medical-records/' + id + '/events')).map(mapReportEvent)
  },
  async getReportTasksByPatient(id: string, status?: ReportTaskStatus): Promise<ReportTask[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : ''
    const result = await api<{ items: ReportTaskDTO[]; total: number }>(
      '/patients/' + id + '/report-tasks' + query,
    )
    return result.items.map(mapReportTask)
  },
}
