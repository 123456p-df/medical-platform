export type PortalRole = 'doctor' | 'patient'

export type RiskLevel = 'Low' | 'Medium' | 'High'

export type ExaminationType = 'CT' | 'MRI' | 'X-Ray'

export type ReviewStatus =
  | 'Pending Review'
  | 'AI Completed'
  | 'Reviewed'
  | 'Abnormal'
  | 'Completed'

export interface Patient {
  id: string
  name: string
  age: number
  gender: 'Male' | 'Female'
  phone: string
  email: string
  bloodType: string
  rhType: 'Positive' | 'Negative' | 'Unknown'
  allergies: string[]
  risk: RiskLevel
  status: ReviewStatus
  lastExamDate: string
  modality: ExaminationType
  organ: string
  aiStatus: ReviewStatus
  avatarColor: string
}

export interface Examination {
  id: string
  patientId: string
  type: ExaminationType
  organ: string
  bodyPart: string
  date: string
  status: ReviewStatus
  description: string
  sliceCount: number
}

export interface Finding {
  id: string
  examinationId: string
  patientId: string
  organ: string
  side: 'left' | 'right'
  location: string
  label: string
  severity: RiskLevel
  confidence: number
  description: string
  status: 'pending' | 'confirmed' | 'modified' | 'dismissed'
}

export interface Report {
  id: string
  patientId: string
  examinationId: string
  diagnosis: string
  description: string
  recommendation: string
  doctor: string
  date: string
  reviewed: boolean
}

export interface MedicalImage {
  id: string
  examinationId: string
  type: ExaminationType
  series: string
  sliceCount: number
  currentSlice: number
}

export interface OrganModel {
  id: string
  organ: string
  label: string
  color: string
  description: string
  modelUrl: string
  position: [number, number, number]
}

export interface Doctor {
  id: string
  name: string
  title: string
  department: string
}

export interface UserSession {
  id: string
  name: string
  role: PortalRole
  title?: string
}
