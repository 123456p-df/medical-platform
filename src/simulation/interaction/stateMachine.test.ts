import { describe, expect, it } from 'vitest'
import { IncisionStateMachine } from './stateMachine'
import type { SurfacePoint } from '../types'

function point(vertexId: number, meshId = 'body-mesh'): SurfacePoint {
  return {
    structureId: 'body', meshId, triangleId: 0, vertexId,
    barycentric: [1, 0, 0], worldPosition: [0, 0, 0], localPosition: [0, 0, 0],
  }
}

describe('incision state machine', () => {
  it('requires A and B before cut and enters drag after completion', () => {
    const machine = new IncisionStateMachine()
    expect(machine.select(point(0))).toBe('SELECT_SECOND_POINT')
    expect(machine.select(point(1))).toBe('PREVIEW_CUT')
    machine.beginCut()
    expect(machine.mode).toBe('CUT_PENDING')
    machine.completePrediction()
    expect(machine.mode).toBe('DRAG')
  })

  it('rejects points on different meshes', () => {
    const machine = new IncisionStateMachine()
    machine.select(point(0))
    expect(() => machine.select(point(1, 'other'))).toThrow(/same surface/)
  })

  it('starts a new incision from drag mode without a one-cut lock', () => {
    const machine = new IncisionStateMachine()
    machine.select(point(0))
    machine.select(point(1))
    machine.beginCut()
    machine.completePrediction()
    expect(machine.select(point(2))).toBe('SELECT_SECOND_POINT')
    expect(machine.pointA?.vertexId).toBe(2)
    expect(machine.pointB).toBeNull()
  })
})
