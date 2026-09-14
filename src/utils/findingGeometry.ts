import type { ImageAcquisition } from '@/types'

type Vec3 = [number, number, number]
type Box6 = [number, number, number, number, number, number]

function finite(value: number) {
  return Number.isFinite(value) ? value : 0
}

function columnScale(matrix: number[][], column: number): number {
  return Math.hypot(
    finite(matrix[0]?.[column]),
    finite(matrix[1]?.[column]),
    finite(matrix[2]?.[column]),
  ) || 1
}

export function findingGeometryFromVoxel(
  centerVoxel: Vec3,
  boxVoxel: Box6,
  spacing: number[] = [1, 1, 1],
  acquisition?: ImageAcquisition,
) {
  const fallback: number[][] = [
    [spacing[0] || 1, 0, 0, 0],
    [0, spacing[1] || 1, 0, 0],
    [0, 0, spacing[2] || 1, 0],
    [0, 0, 0, 1],
  ]
  const matrix = acquisition?.affine?.length === 4 ? acquisition.affine : fallback
  const centerWorldMm: Vec3 = [0, 1, 2].map(row => finite(
    matrix[row]?.[0] * centerVoxel[0] +
    matrix[row]?.[1] * centerVoxel[1] +
    matrix[row]?.[2] * centerVoxel[2] +
    matrix[row]?.[3],
  )) as Vec3
  const boxWorldMm: Box6 = [
    ...centerWorldMm,
    Math.abs(boxVoxel[3]) * columnScale(matrix, 0),
    Math.abs(boxVoxel[4]) * columnScale(matrix, 1),
    Math.abs(boxVoxel[5]) * columnScale(matrix, 2),
  ]
  return { centerWorldMm, boxWorldMm }
}
