import type { ExaminationType } from '@/types'
import type { MedicalTool } from '@/composables/useViewportGestures'

export interface ViewerCapabilities {
  tools: MedicalTool[]
  presets: string[]
  layouts: Array<'mpr' | 'compare' | 'ai' | '3d' | 'single'>
  cine: boolean
  intensityUnit: 'HU' | 'signal' | 'grayscale'
}

const capabilities: Record<ExaminationType, ViewerCapabilities> = {
  CT: {
    tools: ['pointer', 'crosshairs', 'ww_wl', 'pan', 'ruler', 'probe'],
    presets: ['auto', 'lung', 'soft', 'bone', 'brain'],
    layouts: ['mpr', 'compare', 'ai', '3d', 'single'],
    cine: true,
    intensityUnit: 'HU',
  },
  MRI: {
    tools: ['pointer', 'crosshairs', 'ww_wl', 'pan', 'ruler'],
    presets: ['auto'],
    layouts: ['mpr', 'single'],
    cine: true,
    intensityUnit: 'signal',
  },
  'X-Ray': {
    tools: ['pointer', 'ww_wl', 'pan', 'ruler'],
    presets: ['auto'],
    layouts: ['single'],
    cine: false,
    intensityUnit: 'grayscale',
  },
}

export function viewerCapabilities(modality: ExaminationType) {
  return capabilities[modality]
}
