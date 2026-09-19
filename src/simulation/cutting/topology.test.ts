import { describe, expect, it } from 'vitest'
import { openPredictedSeam, splitMeshAlongVertexPath } from './topology'

describe('topology split', () => {
  it('duplicates seam vertices and creates independent left/right boundaries', () => {
    // Two triangles sharing edge 0-2 form the smallest deterministic incision fixture.
    const positions = new Float32Array([
      0, 0, 0,
      1, 0, 0,
      1, 1, 0,
      0, 1, 0,
    ])
    const indices = new Uint32Array([0, 1, 2, 0, 2, 3])
    const result = splitMeshAlongVertexPath(positions, indices, Uint32Array.of(0, 2))
    expect(result.positions.length / 3).toBe(6)
    expect([...result.leftBoundary]).toEqual([0, 2])
    expect([...result.rightBoundary]).toEqual([4, 5])
    expect(result.affectedTriangles.length).toBe(2)
    expect([...result.indices].every(index => index < 6)).toBe(true)
    expect([...result.positions].every(Number.isFinite)).toBe(true)
    const firstUsesOriginal = result.indices.slice(0, 3).some(index => index === 0 || index === 2)
    const secondUsesDuplicate = result.indices.slice(3, 6).some(index => index === 4 || index === 5)
    expect(firstUsesOriginal && secondUsesDuplicate).toBe(true)
  })

  it('rejects paths that do not follow mesh edges', () => {
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 3, 3, 3])
    const indices = new Uint32Array([0, 1, 2])
    expect(() => splitMeshAlongVertexPath(positions, indices, Uint32Array.of(0, 3))).toThrow(/surface edges/)
  })

  it('rewires the complete triangle fan on one side of a seam', () => {
    const positions = new Float32Array([
      -1, -1, 0, 0, -1, 0, 1, -1, 0,
      -1, 0, 0, 0, 0, 0, 1, 0, 0,
      -1, 1, 0, 0, 1, 0, 1, 1, 0,
    ])
    const indices = new Uint32Array([
      0, 1, 4, 0, 4, 3,
      1, 2, 5, 1, 5, 4,
      3, 4, 7, 3, 7, 6,
      4, 5, 8, 4, 8, 7,
    ])
    const split = splitMeshAlongVertexPath(positions, indices, Uint32Array.of(1, 4, 7))
    const originals = new Set([1, 4, 7])
    const duplicates = new Set(split.rightBoundary)
    const seamSide = (triangleId: number) => {
      const triangle = [...split.indices.slice(triangleId * 3, triangleId * 3 + 3)]
      if (triangle.some(id => duplicates.has(id))) return 'duplicate'
      if (triangle.some(id => originals.has(id))) return 'original'
      return 'none'
    }
    const rightSide = [2, 3, 6, 7].map(seamSide)
    const leftSide = [0, 1, 4, 5].map(seamSide)
    expect(new Set(rightSide).size).toBe(1)
    expect(new Set(leftSide).size).toBe(1)
    expect(rightSide[0]).not.toBe(leftSide[0])
  })

  it('keeps A/B closed and opens the middle of a predicted seam', () => {
    const positions = new Float32Array([
      0, -1, 0, -1, -0.5, 0, 1, -0.5, 0,
      0, 0, 0, -1, 0.5, 0, 1, 0.5, 0, 0, 1, 0,
    ])
    const indices = new Uint32Array([
      0, 1, 3, 0, 3, 2,
      3, 1, 4, 3, 4, 5, 3, 5, 6, 3, 6, 2,
    ])
    const split = splitMeshAlongVertexPath(positions, indices, Uint32Array.of(0, 3, 6))
    const opened = openPredictedSeam(split, 0.2)
    const startGap = Math.hypot(
      opened[split.leftBoundary[0] * 3] - opened[split.rightBoundary[0] * 3],
      opened[split.leftBoundary[0] * 3 + 1] - opened[split.rightBoundary[0] * 3 + 1],
    )
    const middle = 1
    const middleGap = Math.hypot(
      opened[split.leftBoundary[middle] * 3] - opened[split.rightBoundary[middle] * 3],
      opened[split.leftBoundary[middle] * 3 + 1] - opened[split.rightBoundary[middle] * 3 + 1],
    )
    expect(startGap).toBeCloseTo(0)
    expect(middleGap).toBeCloseTo(0.4)
    const neighborOffset = 1 * 3
    const neighborMotion = Math.hypot(
      opened[neighborOffset] - split.positions[neighborOffset],
      opened[neighborOffset + 1] - split.positions[neighborOffset + 1],
      opened[neighborOffset + 2] - split.positions[neighborOffset + 2],
    )
    expect(neighborMotion).toBeGreaterThan(0)
  })
})
