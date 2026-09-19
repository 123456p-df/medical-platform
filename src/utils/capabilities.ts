import type { Examination, PortalRole } from '@/types'
import { localPreview } from './runtime'

export interface Capability {
  enabled: boolean
  reason: string
}

export interface StudyCapabilities {
  view: Capability
  aiAssistant: Capability
  lungAnalysis: Capability
  segmentation: Capability
  reconstruction3d: Capability
}

const available = (reason = ''): Capability => ({ enabled: true, reason })
const unavailable = (reason: string): Capability => ({ enabled: false, reason })

export function capabilityForStudy(study: Examination | null | undefined, role: PortalRole | null): StudyCapabilities {
  if (!study) {
    const missing = unavailable('请先选择一项影像检查。')
    return { view: missing, aiAssistant: missing, lungAnalysis: missing, segmentation: missing, reconstruction3d: missing }
  }
  const locallyStored = study.source === 'local-upload'
  const backendUnavailable = localPreview || locallyStored
  const backendReason = locallyStored
    ? '本地影像可直接阅片；请先上传到后端后再运行模型。'
    : '当前为合成演示环境，不会提交真实模型任务。'
  return {
    view: available(),
    aiAssistant: localPreview
      ? available()
      : available(),
    lungAnalysis: backendUnavailable
      ? unavailable(backendReason)
      : study.type !== 'CT' || study.organId !== 'lung'
        ? unavailable('肺结节候选检测只支持肺部 CT。')
        : role !== 'doctor'
          ? unavailable('肺结节候选检测由医生发起。')
          : available(),
    segmentation: backendUnavailable
      ? unavailable(backendReason)
      : study.type !== 'CT'
        ? unavailable('当前分割模型只支持 CT。')
        : ['eye', 'other'].includes(study.organId || '')
          ? unavailable('当前器官没有可用的分割模型。')
          : role !== 'doctor'
            ? unavailable('器官分割由医生发起。')
            : available(),
    reconstruction3d: locallyStored
      ? unavailable('本地影像尚未生成服务端三维模型。')
      : study.type !== 'CT'
        ? unavailable('当前三维重建流程只支持 CT。')
        : available(),
  }
}
