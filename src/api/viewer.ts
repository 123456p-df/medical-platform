import { api, request } from './client'
import type { SliceAxis } from '@/utils/volumePixels'
import { parseLabelVolume, parseVolume, type LabelVolume, type VolumeData } from '@/utils/volumePixels'

export interface ViewerOrgan {
  task_id: string
  label_id: number | null
  organ_id: string
  name: string
  display_name?: string | null
  group_id?: string | null
  status: 'queued' | 'running' | 'completed' | 'failed'
  progress: number
  model_id?: string | null
  mesh_name?: string | null
  face_count?: number | null
  size_bytes?: number | null
  volume_cm3?: number | null
  is_watertight?: boolean | null
  bounds?: { min_m?: number[]; max_m?: number[]; centroid_m?: number[] } | null
  color?: number[] | null
  outline_only?: boolean | null
  error_message?: string | null
}

export interface SegmentationBatch {
  batch_id: string
  image_id: string
  status: 'queued' | 'running' | 'completed' | 'partial' | 'failed' | 'unavailable'
  progress: number
  total_labels: number
  recognized_count: number
  completed_count: number
  failed_count: number
  atlas_model_id?: string | null
  items: ViewerOrgan[]
  error_message?: string | null
}

export interface ComparisonCandidate {
  image_id: string
  patient_id: number
  image_type: 'CT' | 'MRI'
  organ_id: string
  study_date: string | null
  shape?: number[] | null
  spacing?: number[] | null
  comparable: boolean
  reasons: string[]
  warnings: string[]
  device?: string | null
}

export const AXIS_FROM_XYZ: Record<'X' | 'Y' | 'Z', SliceAxis> = {
  X: 'sagittal',
  Y: 'coronal',
  Z: 'axial',
}

export const viewerApi = {
  startBatch(imageId: string) {
    return api<{ batch_id: string; status: string }>('/medical-images/' + imageId + '/segmentation-batch', {
      method: 'POST',
    })
  },
  getBatch(imageId: string) {
    return api<SegmentationBatch>('/medical-images/' + imageId + '/segmentation-batch')
  },
  getOrgans(imageId: string) {
    return api<ViewerOrgan[]>('/medical-images/' + imageId + '/organ-models')
  },
  getCandidates(imageId: string) {
    return api<ComparisonCandidate[]>('/medical-images/' + imageId + '/comparison-candidates')
  },
  async loadVolume(imageId: string, shape: [number, number, number]): Promise<VolumeData> {
    const response = await request('/medical-images/' + imageId + '/volume')
    return parseVolume(await response.arrayBuffer(), shape)
  },
  async loadLabels(imageId: string, shape: [number, number, number]): Promise<LabelVolume> {
    const response = await request('/medical-images/' + imageId + '/label-volume')
    return parseLabelVolume(await response.arrayBuffer(), shape)
  },
  async loadGlb(modelId: string) {
    const response = await request('/organ-models/' + modelId + '/file')
    return response.arrayBuffer()
  },
}
