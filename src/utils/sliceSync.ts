export function clampPosition(value: number): number {
  if (!Number.isFinite(value)) return 0.5
  return Math.min(1, Math.max(0, value))
}

export function positionToSlice(position: number, sliceCount: number): number {
  const count = Math.max(1, Math.floor(sliceCount))
  return Math.round(clampPosition(position) * (count - 1))
}

export function sliceToPosition(sliceIndex: number, sliceCount: number): number {
  const count = Math.max(1, Math.floor(sliceCount))
  if (count === 1) return 0
  return clampPosition(sliceIndex / (count - 1))
}
