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

export type ReportStatus = 'draft' | 'pending_review' | 'signed' | 'cancelled'
export type ReportTaskStatus = 'pending_draft' | 'drafting' | 'in_review' | 'signed' | 'cancelled'
export type AIInvocationStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'

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
  boxExtentMm?: number | null
  measurementMm?: number | null
  measurementMethod?: string | null
  measurementStatus?: 'candidate' | 'manual' | 'reviewed' | 'rejected'
  sideEvidence?: string | null
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
  status?: ReportStatus
  revision?: number
  signedByUserId?: string | null
  signedByUsername?: string | null
  createdAt?: string
  updatedAt?: string
  addenda?: ReportAddendum[]
}

export interface ReportEvent {
  eventId: string
  reportId: string
  revision: number
  action: string
  fromStatus: ReportStatus | null
  toStatus: ReportStatus | null
  actorUserId: string | null
  reason: string | null
  metadata: Record<string, unknown>
  createdAt: string
}

export interface ReportTask {
  id: string
  patientId: string
  examinationId: string
  status: ReportTaskStatus
  primaryRecordId: string | null
  assignedDoctorId: string | null
  updatedAt: string
  createdAt: string
}

export interface AICapability {
  purpose: 'record_summary' | 'report_draft' | 'report_qa'
  available: boolean
  providerId: string | null
  modelId: string | null
  reason: string | null
}

export interface AIInvocation {
  id: string
  patientId: string
  examinationId: string | null
  organId: string
  purpose: AICapability['purpose']
  status: AIInvocationStatus
  providerId: string | null
  modelId: string | null
  baseRevision: number | null
  result: Record<string, unknown> | null
  errorCode: number | null
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

export interface AIInvocationAttempt {
  id: string
  invocationId: string
  attemptNumber: number
  status: AIInvocationStatus
  providerId: string | null
  modelId: string | null
  startedAt: string | null
  finishedAt: string | null
  errorCode: number | null
  errorMessage: string | null
  usage: Record<string, unknown>
  createdAt: string
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
