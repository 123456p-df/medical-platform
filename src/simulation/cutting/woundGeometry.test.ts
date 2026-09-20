import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { closedWoundBoundary, nearestBoundaryVertexAtFraction, woundSidewallGeometry } from './woundGeometry'

describe('wound geometry', () => {
  it('forms one ordered loop through both sides without duplicated endpoints', () => {
    expect([...closedWoundBoundary(Uint32Array.of(0, 1, 2, 3), Uint32Array.of(4, 5, 6, 7))])
      .toEqual([0, 1, 2, 3, 6, 5])
  })

  it('maps controls to the nearest boundary vertex by arc length', () => {
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 3, 0, 0, 6, 0, 0])
    const boundary = Uint32Array.of(0, 1, 2, 3)
    expect(nearestBoundaryVertexAtFraction(positions, boundary, 0.5)).toBe(2)
    expect(nearestBoundaryVertexAtFraction(positions, boundary, 0.9)).toBe(3)
  })

  it('builds inward side walls at the requested physical depth', () => {
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0])
    const normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1])
    const geometry = woundSidewallGeometry(
      new THREE.BufferAttribute(positions, 3),
      new THREE.BufferAttribute(normals, 3),
      Uint32Array.of(0, 1),
      Uint32Array.of(2, 3),
      0.02,
    )
    const wall = geometry.getAttribute('position')
    expect(wall.count).toBe(8)
    expect(wall.getZ(1)).toBeCloseTo(-0.02)
    expect([...geometry.index!.array].every(index => index < wall.count)).toBe(true)
  })
})
