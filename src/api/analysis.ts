import { api } from '@/api/client'

export type AnalysisTaskStatus = 'queued' | 'running' | 'completed' | 'failed'

export interface AnalysisStatus {
  configured: boolean
  analysis_type: 'lung_nodule_detection'
  model_name: string
  supported_image_types: string[]
  supported_organs: string[]
}

export interface AnalysisTask {
  task_id: string
  status: AnalysisTaskStatus
  analysis_type?: 'lung_nodule_detection'
  model_name?: string
  score_threshold?: number
  progress?: number
  result?: {
    findings_count: number
    findings_url: string
  } | null
  error_message?: string | null
}

export const analysisApi = {
  getStatus() {
    return api<AnalysisStatus>('/analysis/status')
  },
  create(imageId: string, scoreThreshold = 0.1) {
    return api<AnalysisTask>('/medical-images/' + imageId + '/analysis', {
      method: 'POST',
      body: JSON.stringify({
        analysis_type: 'lung_nodule_detection',
        score_threshold: scoreThreshold,
      }),
    })
  },
  getTask(taskId: string) {
    return api<AnalysisTask>('/analysis/tasks/' + taskId)
  },
}
