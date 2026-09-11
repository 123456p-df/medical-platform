import { ref } from 'vue'
import type { SliceAxis } from '@/utils/volumePixels'

export interface RulerMeasurement {
  id: string
  axis: SliceAxis
  sliceIndex: number
  startCol: number
  startRow: number
  endCol: number
  endRow: number
  lengthMm: number
}

export interface ProbeInfo {
  col: number
  row: number
  vx: number
  vy: number
  vz: number
  hu: number | null
  tissueLabel?: string
}

export function useMeasurementTools() {
  const rulers = ref<RulerMeasurement[]>([])
  const activeRuler = ref<{
    startCol: number
    startRow: number
    endCol: number
    endRow: number
    lengthMm: number
  } | null>(null)

  const liveProbe = ref<ProbeInfo | null>(null)

  function getTissueDescription(hu: number | null): string {
    if (hu === null || Number.isNaN(hu)) return ''
    if (hu <= -900) return '空气'
    if (hu <= -450) return '肺实质'
    if (hu <= -30) return '脂肪'
    if (hu <= 15) return '水/液体'
    if (hu <= 55) return '软组织/肌肉'
    if (hu <= 100) return '高密度血液/实质'
    if (hu <= 300) return '松质骨/增强血管'
    return '皮质骨/钙化'
  }

  function calculateDistanceMm(
    col1: number,
    row1: number,
    col2: number,
    row2: number,
    axis: SliceAxis,
    spacing: [number, number, number],
  ): number {
    // Determine 2D plane spacing based on orthogonal projection
    // axial: x=spacing[0], y=spacing[1]
    // coronal: x=spacing[0], y=spacing[2]
    // sagittal: x=spacing[1], y=spacing[2]
    const sx = axis === 'sagittal' ? spacing[1] : spacing[0]
    const sy = axis === 'axial' ? spacing[1] : spacing[2]
    const dxMm = (col2 - col1) * sx
    const dyMm = (row2 - row1) * sy
    return Math.sqrt(dxMm * dxMm + dyMm * dyMm)
  }

  function startRuler(col: number, row: number) {
    activeRuler.value = {
      startCol: col,
      startRow: row,
      endCol: col,
      endRow: row,
      lengthMm: 0,
    }
  }

  function updateRuler(
    col: number,
    row: number,
    axis: SliceAxis,
    spacing: [number, number, number],
  ) {
    if (!activeRuler.value) return
    activeRuler.value.endCol = col
    activeRuler.value.endRow = row
    activeRuler.value.lengthMm = calculateDistanceMm(
      activeRuler.value.startCol,
      activeRuler.value.startRow,
      col,
      row,
      axis,
      spacing,
    )
  }

  function finishRuler(axis: SliceAxis, sliceIndex: number) {
    if (!activeRuler.value) return
    if (activeRuler.value.lengthMm > 0.5) {
      rulers.value.push({
        id: 'ruler_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        axis,
        sliceIndex,
        ...activeRuler.value,
      })
    }
    activeRuler.value = null
  }

  function deleteRuler(id: string) {
    rulers.value = rulers.value.filter(r => r.id !== id)
  }

  function clearRulers() {
    rulers.value = []
    activeRuler.value = null
  }

  function sampleHU(
    col: number,
    row: number,
    rawPlane: Float32Array | undefined,
    width: number,
    height: number,
    fallbackEstimate?: number,
  ): number | null {
    if (col < 0 || col >= width || row < 0 || row >= height) return null
    if (rawPlane && rawPlane.length >= width * height) {
      const idx = Math.floor(row) * width + Math.floor(col)
      const val = rawPlane[idx]
      return Math.round(val)
    }
    if (fallbackEstimate !== undefined) {
      return Math.round(fallbackEstimate)
    }
    return null
  }

  return {
    rulers,
    activeRuler,
    liveProbe,
    getTissueDescription,
    calculateDistanceMm,
    startRuler,
    updateRuler,
    finishRuler,
    deleteRuler,
    clearRulers,
    sampleHU,
  }
}
