import type { Examination } from '@/types'
import type { SliceAxis } from '@/utils/volumePixels'

type Vec3 = [number, number, number]

function affineOf(study: Examination) {
  const affine = study.acquisition?.affine
  return affine && affine.length >= 3 && affine.every(row => row.length >= 4) ? affine : null
}

function shapeOf(study: Examination): Vec3 {
  const shape = study.shape || [512, 512, study.sliceCount || 1]
  return [shape[0], shape[1], shape[2]]
}

function layerFor(axis: SliceAxis) {
  return axis === 'axial' ? 2 : axis === 'coronal' ? 1 : 0
}

function applyAffine(affine: number[][], voxel: Vec3): Vec3 {
  return [0, 1, 2].map(row =>
    affine[row][0] * voxel[0] + affine[row][1] * voxel[1] + affine[row][2] * voxel[2] + affine[row][3],
  ) as Vec3
}

function invertAffine(affine: number[][], world: Vec3): Vec3 | null {
  const m = affine
  const determinant =
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  if (Math.abs(determinant) < 1e-12) return null
  const inverse = [
    [(m[1][1] * m[2][2] - m[1][2] * m[2][1]) / determinant, (m[0][2] * m[2][1] - m[0][1] * m[2][2]) / determinant, (m[0][1] * m[1][2] - m[0][2] * m[1][1]) / determinant],
    [(m[1][2] * m[2][0] - m[1][0] * m[2][2]) / determinant, (m[0][0] * m[2][2] - m[0][2] * m[2][0]) / determinant, (m[0][2] * m[1][0] - m[0][0] * m[1][2]) / determinant],
    [(m[1][0] * m[2][1] - m[1][1] * m[2][0]) / determinant, (m[0][1] * m[2][0] - m[0][0] * m[2][1]) / determinant, (m[0][0] * m[1][1] - m[0][1] * m[1][0]) / determinant],
  ]
  const shifted: Vec3 = [world[0] - m[0][3], world[1] - m[1][3], world[2] - m[2][3]]
  return inverse.map(row => row[0] * shifted[0] + row[1] * shifted[1] + row[2] * shifted[2]) as Vec3
}

export function worldAtPosition(study: Examination, axis: SliceAxis, position: number, previous?: Vec3 | null): Vec3 | null {
  const affine = affineOf(study)
  if (!affine) return null
  const shape = shapeOf(study)
  const voxel = previous ? invertAffine(affine, previous) : shape.map(value => Math.max(0, (value - 1) / 2)) as Vec3
  if (!voxel) return null
  const layer = layerFor(axis)
  voxel[layer] = Math.max(0, Math.min(shape[layer] - 1, position * Math.max(shape[layer] - 1, 1)))
  return applyAffine(affine, voxel)
}

export function positionAtWorld(study: Examination, axis: SliceAxis, world: Vec3): number | null {
  const affine = affineOf(study)
  if (!affine) return null
  const voxel = invertAffine(affine, world)
  if (!voxel) return null
  const layer = layerFor(axis)
  const count = shapeOf(study)[layer]
  return count <= 1 ? 0 : Math.max(0, Math.min(1, voxel[layer] / (count - 1)))
}

export function hasWorldGeometry(study: Examination) {
  return Boolean(affineOf(study))
}
