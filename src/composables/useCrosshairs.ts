import { ref, computed } from 'vue'
import type { Shape3D, SliceAxis } from '@/utils/volumePixels'
import { canvasToVoxel, voxelToCanvas } from '@/utils/volumePixels'

export interface CrosshairsState {
  vx: number
  vy: number
  vz: number
  visible: boolean
}

// Global or shared crosshairs instance for synchronized orthogonal MPR views
const crosshairsState = ref<CrosshairsState>({
  vx: 0,
  vy: 0,
  vz: 0,
  visible: true,
})

export function useCrosshairs() {
  const visible = computed({
    get: () => crosshairsState.value.visible,
    set: (v: boolean) => {
      crosshairsState.value.visible = v
    },
  })

  function initCrosshairs(shape: Shape3D) {
    const [nx, ny, nz] = shape
    crosshairsState.value.vx = Math.floor(nx / 2)
    crosshairsState.value.vy = Math.floor(ny / 2)
    crosshairsState.value.vz = Math.floor(nz / 2)
  }

  function setVoxel(vx: number, vy: number, vz: number, shape: Shape3D) {
    const [nx, ny, nz] = shape
    crosshairsState.value.vx = Math.max(0, Math.min(nx - 1, Math.round(vx)))
    crosshairsState.value.vy = Math.max(0, Math.min(ny - 1, Math.round(vy)))
    crosshairsState.value.vz = Math.max(0, Math.min(nz - 1, Math.round(vz)))
  }

  function updateFromCanvas(
    axis: SliceAxis,
    col: number,
    row: number,
    sliceIndex: number,
    shape: Shape3D,
  ) {
    const [vx, vy, vz] = canvasToVoxel(axis, col, row, sliceIndex, shape)
    setVoxel(vx, vy, vz, shape)
  }

  function getCanvasProjection(axis: SliceAxis, shape: Shape3D) {
    return voxelToCanvas(
      axis,
      crosshairsState.value.vx,
      crosshairsState.value.vy,
      crosshairsState.value.vz,
      shape,
    )
  }

  const axisColors: Record<SliceAxis, string> = {
    axial: '#ef4444',     // Red for Axial
    coronal: '#22c55e',   // Green for Coronal
    sagittal: '#eab308',  // Yellow for Sagittal
  }

  return {
    crosshairs: crosshairsState,
    visible,
    axisColors,
    initCrosshairs,
    setVoxel,
    updateFromCanvas,
    getCanvasProjection,
  }
}
