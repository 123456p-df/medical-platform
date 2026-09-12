import type { SliceAxis, Shape3D } from './volumePixels'

/** Canonical RAS: i L→R, j P→A, k I→S. One table for 2D, stain, and 3D plane. */
export type AxisSpec = {
  layer: 0 | 1 | 2
  u: 0 | 1 | 2
  v: 0 | 1 | 2
  flipU: boolean
  flipV: boolean
  xyz: 'X' | 'Y' | 'Z'
  labels: { top: string; bottom: string; left: string; right: string }
}

export const SLICE_AXES: Record<SliceAxis, AxisSpec> = {
  axial: {
    layer: 2,
    u: 0,
    v: 1,
    flipU: true,
    flipV: true,
    xyz: 'Z',
    labels: { top: 'A', bottom: 'P', left: 'R', right: 'L' },
  },
  coronal: {
    layer: 1,
    u: 0,
    v: 2,
    flipU: true,
    flipV: true,
    xyz: 'Y',
    labels: { top: 'S', bottom: 'I', left: 'R', right: 'L' },
  },
  sagittal: {
    layer: 0,
    u: 1,
    v: 2,
    flipU: true,
    flipV: true,
    xyz: 'X',
    labels: { top: 'S', bottom: 'I', left: 'A', right: 'P' },
  },
}

export const AXIS_FROM_XYZ: Record<'X' | 'Y' | 'Z', SliceAxis> = {
  X: 'sagittal',
  Y: 'coronal',
  Z: 'axial',
}

export function sliceCount(axis: SliceAxis, shape: Shape3D) {
  return shape[SLICE_AXES[axis].layer]
}

export function sliceSize(axis: SliceAxis, shape: Shape3D) {
  const spec = SLICE_AXES[axis]
  return { width: shape[spec.u], height: shape[spec.v], count: shape[spec.layer] }
}

export function sliceFovMm(axis: SliceAxis, shape: Shape3D, spacing: [number, number, number]) {
  const spec = SLICE_AXES[axis]
  return {
    width: shape[spec.u] * spacing[spec.u],
    height: shape[spec.v] * spacing[spec.v],
    thickness: spacing[spec.layer],
  }
}

export function affineFromSpacing(spacing: [number, number, number]): number[][] {
  return [
    [spacing[0], 0, 0, 0],
    [0, spacing[1], 0, 0],
    [0, 0, spacing[2], 0],
  ]
}

export function voxelToRas(i: number, j: number, k: number, affine: number[][]): [number, number, number] {
  const a = affine
  return [
    a[0][0] * i + a[0][1] * j + a[0][2] * k + (a[0][3] || 0),
    a[1][0] * i + a[1][1] * j + a[1][2] * k + (a[1][3] || 0),
    a[2][0] * i + a[2][1] * j + a[2][2] * k + (a[2][3] || 0),
  ]
}

/** Patient RAS mm → glTF meters (Y-up): x, z, -y */
export function rasToGltf(ras: [number, number, number]): [number, number, number] {
  return [ras[0] * 0.001, ras[2] * 0.001, -ras[1] * 0.001]
}

export function gltfToRas(p: [number, number, number]): [number, number, number] {
  return [p[0] * 1000, -p[2] * 1000, p[1] * 1000]
}
