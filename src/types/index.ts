export type PortalRole = 'doctor' | 'patient'

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Unknown'

export type ExaminationType = 'CT' | 'MRI' | 'X-Ray'

export type ReviewStatus =
  | 'Pending Review'
  | 'AI Completed'
  | 'Reviewed'
  | 'Abnormal'
  | 'Completed'
  | 'Available'
  | 'Not assessed'
  | 'Unknown'

export interface ImageAcquisition {
  affine?: number[][]
  original_affine?: number[][]
  spacing_mm?: number[]
  orientation?: string
  original_orientation?: string
  plane?: string
  framesPerFile?: number[]
  [key: string]: unknown
}

export interface Patient {
  id: string
  name: string
  idNumber?: string
  age: number | null
  gender: 'Male' | 'Female' | 'Unknown'
  phone: string
  email: string
  rhType?: string
  bloodType: string
  allergies: string[]
  risk: RiskLevel
  status: ReviewStatus
  lastExamDate: string
  lastUploadedAt?: string
  modality: ExaminationType | '—'
  organ: string
  aiStatus: ReviewStatus
  avatarColor: string
}

export interface Examination {
  shape?: number[]
  spacing?: number[]
  organId?: string
  acquisition?: ImageAcquisition
  source?: 'remote' | 'preview' | 'local-upload'
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
  analysisTaskId?: string
  examinationId: string
  patientId: string
  organ: string
  side: 'left' | 'right' | 'unknown'
  location: string
  label: string
  severity: RiskLevel
  confidence: number
  diameterMm?: number
  modelName?: string
  modelLabel?: string
  coordinateSystem?: 'RAS'
  boxMode?: 'cccwhd'
  centerWorldMm?: [number, number, number]
  boxWorldMm?: [number, number, number, number, number, number]
  centerVoxel?: [number, number, number]
  boxVoxel?: [number, number, number, number, number, number]
  description: string
  status: 'pending' | 'confirmed' | 'modified' | 'dismissed'
  revision?: number
}

export interface Report {
  organIds?: string[]
  organId?: string
  id: string
  patientId: string
  examinationId: string
  diagnosis: string
  description: string
  recommendation: string
  doctor: string
  date: string
  reviewed: boolean
  signedAt?: string | null
  createdAt?: string
  updatedAt?: string
  addenda?: ReportAddendum[]
}

export interface ReportAddendum {
  id: string
  reportId: string
  authorUserId: string
  authorName?: string
  reason: string
  content: string
  createdAt: string
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
  accessToken: string
  id: string
  name: string
  username?: string
  role: PortalRole
  accountRole?: 'admin' | 'doctor' | 'patient'
  profileCompleted?: boolean
  title?: string
}

export interface ArchivedPatient {
  patientId: string
  name: string
  reason: string
  archivedAt: string
}
