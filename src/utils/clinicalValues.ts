import type { Patient, ReviewStatus } from '@/types'

const reviewStatuses = new Set<ReviewStatus>([
  'Pending Review', 'AI Completed', 'Reviewed', 'Abnormal', 'Completed', 'Available', 'Not assessed', 'Unknown',
])

export function reviewStatus(value: unknown): ReviewStatus {
  return typeof value === 'string' && reviewStatuses.has(value as ReviewStatus)
    ? value as ReviewStatus
    : 'Unknown'
}

export function displayBloodType(patient: Pick<Patient, 'bloodType' | 'rhType'>): string {
  if (!patient.bloodType || patient.bloodType === '—') return '—'
  if (/[+-]$/.test(patient.bloodType)) return patient.bloodType
  if (patient.rhType === 'Positive') return `${patient.bloodType}+`
  if (patient.rhType === 'Negative') return `${patient.bloodType}-`
  return `${patient.bloodType} · Rh 未知`
}
