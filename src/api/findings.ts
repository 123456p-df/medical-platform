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
  }
}

export const findingApi = {
  async getFindingsByExamination(id: string): Promise<Finding[]> {
    return (await api<FindingDTO[]>('/medical-images/' + id + '/findings')).map(mapFinding)
  },
  async getFindingsByPatient(id: string): Promise<Finding[]> {
    return (await api<FindingDTO[]>('/patients/' + id + '/findings')).map(mapFinding)
  },
  async updateFindingStatus(id: string, status: Finding['status']): Promise<Finding> {
    const result = await api<FindingDTO>('/findings/' + id, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    return mapFinding(result)
  },
}
