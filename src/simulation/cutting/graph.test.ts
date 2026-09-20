import { describe, expect, it } from 'vitest'
import { buildSurfaceGraph, shortestSurfacePath, vertexFromBarycentric } from './graph'

describe('surface graph', () => {
  const positions = new Float32Array([
    0, 0, 0,
    1, 0, 0,
    1, 1, 0,
    0, 1, 0,
  ])
  const indices = new Uint32Array([0, 1, 2, 0, 2, 3])

  it('finds a connected shortest path without scanning triangles per frame', () => {
    const graph = buildSurfaceGraph(positions, indices)
    expect([...shortestSurfacePath(graph, 1, 3)]).toEqual([1, 0, 3])
  })

  it('selects the nearest triangle vertex from barycentric coordinates', () => {
    expect(vertexFromBarycentric(indices, 0, [0.1, 0.8, 0.1])).toBe(1)
  })

  it('rejects out-of-range triangle indices', () => {
    expect(() => buildSurfaceGraph(positions, new Uint32Array([0, 1, 8]))).toThrow(/out of range/)
  })
})
