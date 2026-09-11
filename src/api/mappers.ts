import type { Examination, Patient, Report } from '@/types'
export const organNames: Record<string, string> = {
  lung: 'Lung', liver: 'Liver', heart: 'Heart', kidney: 'Kidney', brain: 'Brain',
  stomach: 'Stomach', pancreas: 'Pancreas', spleen: 'Spleen', eye: 'Eye', other: 'Other',
}
export interface ImageDTO {
  image_id: string; patient_id: number; image_type: 'CT' | 'MRI'; organ_id: string
  slice_count: number; study_date: string | null; created_at: string; shape: number[]; spacing: number[]
}
export interface PatientDTO {
  patient_id: number; name: string | null; birth_date: string | null
  gender: string | null; blood_type: string | null; latest_image: ImageDTO | null
}
export interface RecordDTO {
  organ_ids: string[]; record_id: number; patient_id: number; organ_id: string; diagnosis: string
  description: string; recommendation: string; examination_id: string | null; reviewed: boolean
  record_date: string; doctor_name: string
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
    status: 'Available', lastExamDate: p.latest_image?.created_at.slice(0, 10) || '',
    modality: p.latest_image?.image_type || '—', organ: organNames[p.latest_image?.organ_id || ''] || '—',
    aiStatus: 'Not assessed', avatarColor: ['#317e82', '#5c6f9c', '#8b5f78'][p.patient_id % 3] }
}
export function mapImage(i: ImageDTO): Examination {
  return { shape: i.shape, spacing: i.spacing, id: i.image_id, patientId: String(i.patient_id), type: i.image_type,
    organId: i.organ_id, organ: organNames[i.organ_id] || i.organ_id,
    bodyPart: organNames[i.organ_id] || i.organ_id, date: i.study_date || i.created_at.slice(0, 10),
    status: 'Available', description: i.image_type + ' · ' + i.shape.join(' × ') + ' voxels', sliceCount: i.slice_count }
}
export function mapRecord(r: RecordDTO): Report {
  return { organIds: r.organ_ids, id: String(r.record_id), patientId: String(r.patient_id), organId: r.organ_id,
    examinationId: r.examination_id || '', diagnosis: r.diagnosis, description: r.description, recommendation: r.recommendation,
    doctor: r.doctor_name, date: r.record_date, reviewed: r.reviewed }
}
