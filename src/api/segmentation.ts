export type SegmentationModelItem = {
  task_id: string
  label_id: number | null
  organ_id: string
  name: string
  group_id: string | null
  status: 'queued' | 'running' | 'completed' | 'failed'
  progress: number
  model_id: string | null
  face_count: number | null
  size_bytes: number | null
  volume_cm3: number | null
  is_watertight: boolean | null
  bounds: { min_m?: number[]; max_m?: number[] } | null
  error_message: string | null
}
export type SegmentationBatch = {
  batch_id: string
  image_id: string
  status: 'queued' | 'running' | 'completed' | 'partial' | 'failed' | 'unavailable'
  progress: number
  total_labels: number
  recognized_count: number
  completed_count: number
  failed_count: number
  items: SegmentationModelItem[]
  error_message: string | null
}
import { api } from './client'
export const segmentationApi = {
  startBatch(imageId: string) {
    return api<{ batch_id: string; status: string }>('/medical-images/' + imageId + '/segmentation-batch', {
      method: 'POST',
    })
  },
  getBatch(imageId: string) {
    return api<SegmentationBatch>('/medical-images/' + imageId + '/segmentation-batch')
  },
  getModels(imageId: string) {
    return api<SegmentationModelItem[]>('/medical-images/' + imageId + '/organ-models')
  },
}
