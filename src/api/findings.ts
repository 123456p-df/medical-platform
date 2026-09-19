import { api } from '@/api/client'
import type { Finding } from '@/types'

interface FindingDTO {
  finding_id: string
  task_id: string
  image_id: string
  patient_id: number
  finding_type: 'lung_nodule'
  model_label: string
  label: string
  description: string
  confidence: number
  diameter_mm: number
  box_extent_mm: number | null
  measurement_mm: number | null
  measurement_method: string | null
  measurement_status: 'candidate' | 'manual' | 'reviewed' | 'rejected'
  side_evidence: string | null
  coordinate_system: 'RAS'
  box_mode: 'cccwhd'
  center_world_mm: [number, number, number]
  box_world_mm: [number, number, number, number, number, number]
  center_voxel: [number, number, number]
  box_voxel: [number, number, number, number, number, number]
  side: 'left' | 'right' | null
  lobe: string | null
  status: Finding['status']
  model_name: string
  revision: number
}

function mapFinding(item: FindingDTO): Finding {
  return {
    id: item.finding_id,
    analysisTaskId: item.task_id,
    examinationId: item.image_id,
    patientId: String(item.patient_id),
    organ: 'Lung',
    side: item.side || 'unknown',
    location: item.lobe || 'lung',
    label: item.label,
    severity: 'Unknown',
    confidence: item.confidence,
    diameterMm: item.diameter_mm,
    boxExtentMm: item.box_extent_mm,
    measurementMm: item.measurement_mm,
    measurementMethod: item.measurement_method,
    measurementStatus: item.measurement_status,
    sideEvidence: item.side_evidence,
    modelName: item.model_name,
    modelLabel: item.model_label,
    coordinateSystem: item.coordinate_system,
    boxMode: item.box_mode,
    centerWorldMm: item.center_world_mm,
    boxWorldMm: item.box_world_mm,
    centerVoxel: item.center_voxel,
    boxVoxel: item.box_voxel,
    description: item.description,
    status: item.status,
    revision: item.revision,
  }
}

export const findingApi = {
  async getFindingsByExamination(id: string): Promise<Finding[]> {
    return (await api<FindingDTO[]>('/medical-images/' + id + '/findings')).map(mapFinding)
  },
  async getFindingsByPatient(id: string): Promise<Finding[]> {
    return (await api<FindingDTO[]>('/patients/' + id + '/findings')).map(mapFinding)
  },
  async updateFindingStatus(id: string, status: Finding['status'], expectedRevision?: number): Promise<Finding> {
    const result = await api<FindingDTO>('/findings/' + id, {
      method: 'PATCH',
      body: JSON.stringify({ status, ...(expectedRevision ? { expected_revision: expectedRevision } : {}) }),
    })
    return mapFinding(result)
  },
  async updateFindingGeometry(id: string, geometry: {
    diameterMm: number
    centerWorldMm: [number, number, number]
    boxWorldMm: [number, number, number, number, number, number]
    centerVoxel: [number, number, number]
    boxVoxel: [number, number, number, number, number, number]
    reason: string
    expectedRevision?: number
  }): Promise<Finding> {
    const result = await api<FindingDTO>('/findings/' + id, {
      method: 'PATCH',
      body: JSON.stringify({
        diameter_mm: geometry.diameterMm,
        center_world_mm: geometry.centerWorldMm,
        box_world_mm: geometry.boxWorldMm,
        center_voxel: geometry.centerVoxel,
        box_voxel: geometry.boxVoxel,
        modification_reason: geometry.reason,
        ...(geometry.expectedRevision ? { expected_revision: geometry.expectedRevision } : {}),
      }),
    })
    return mapFinding(result)
  },
}
