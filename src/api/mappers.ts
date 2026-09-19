import type { Examination, Patient, Report, ReportAddendum, ReportTemplate } from '@/types'
import { reviewStatus } from '@/utils/clinicalValues'
import type { components } from './generated/schema'
export const organNames: Record<string, string> = {
  lung: 'Lung', liver: 'Liver', heart: 'Heart', kidney: 'Kidney', brain: 'Brain',
  stomach: 'Stomach', pancreas: 'Pancreas', spleen: 'Spleen', eye: 'Eye', other: 'Other',
}
export type ImageDTO = components['schemas']['ImageOut']
export type PatientDTO = components['schemas']['PatientRosterItem']
export type RecordDTO = components['schemas']['RecordOut']
export type AddendumDTO = components['schemas']['AddendumOut']
export interface StructuredRecordDTO extends RecordDTO {
  report_template_id?: string | null
  structured_data?: Record<string, unknown> | null
}
export function mapPatient(p: PatientDTO): Patient {
  let age: number | null = null
  if (p.birth_date) {
    const birth = new Date(p.birth_date), today = new Date()
    age = today.getFullYear() - birth.getFullYear()
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--
  }
  return { id: String(p.patient_id), name: p.name || '未完成建档', age,
    gender: p.gender === 'male' ? 'Male' : p.gender === 'female' ? 'Female' : 'Unknown',
    phone: '—', email: '—', bloodType: p.blood_type?.replace(/[+-]$/, '') || '—', rhType: p.blood_type?.endsWith('+') ? 'Positive' : p.blood_type?.endsWith('-') ? 'Negative' : 'Unknown', allergies: [], risk: 'Unknown',
    status: p.latest_image ? reviewStatus(p.latest_image.status) : 'Not assessed', lastExamDate: p.latest_image?.study_date || '', lastUploadedAt: p.latest_image?.created_at,
    modality: p.latest_image?.image_type || '—', organ: organNames[p.latest_image?.organ_id || ''] || '—',
    aiStatus: 'Not assessed', avatarColor: ['#317e82', '#5c6f9c', '#8b5f78'][p.patient_id % 3] }
}
export function mapImage(i: ImageDTO): Examination {
  return { shape: i.shape, spacing: i.spacing, acquisition: i.acquisition || undefined, source: 'remote', id: i.image_id, patientId: String(i.patient_id), type: i.image_type,
    organId: i.organ_id, organ: organNames[i.organ_id] || i.organ_id,
    bodyPart: organNames[i.organ_id] || i.organ_id, date: i.study_date || i.created_at.slice(0, 10),
    status: reviewStatus(i.status), description: i.image_type + ' · ' + i.shape.join(' × ') + ' voxels', sliceCount: i.slice_count }
}
function mapReportTemplate(item: components['schemas']['ReportTemplateOut']): ReportTemplate {
  return {
    id: item.template_id,
    name: item.name,
    modality: item.modality ?? null,
    organId: item.organ_id ?? null,
    version: item.version,
    isActive: item.is_active,
    isDefault: item.is_default,
    fields: item.fields,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

export function mapRecord(r: StructuredRecordDTO): Report {
  return { organIds: r.organ_ids, id: String(r.record_id), patientId: String(r.patient_id), organId: r.organ_id,
    examinationId: r.examination_id || '', diagnosis: r.diagnosis, description: r.description, recommendation: r.recommendation,
    doctor: r.doctor_name, date: r.record_date, reviewed: r.reviewed, signedAt: r.signed_at || null,
    createdAt: r.created_at, updatedAt: r.updated_at, reportTemplateId: r.report_template_id || undefined,
    structuredData: r.structured_data || undefined, reportTemplate: r.report_template ? mapReportTemplate(r.report_template) : undefined,
    addenda: (r.addenda || []).map(mapAddendum) }
}

export function mapAddendum(item: AddendumDTO): ReportAddendum {
  return { id: String(item.addendum_id), reportId: String(item.record_id), authorUserId: String(item.author_user_id),
    authorName: item.author_name, reason: item.reason, content: item.content, createdAt: item.created_at }
}
