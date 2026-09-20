import { describe, expect, it } from 'vitest'
import { ObjectSimulationState } from './SimulationState'

describe('predicted and authoritative simulation state', () => {
  const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0])
  const indices = new Uint32Array([0, 1, 2])

  it('drops stale sequence numbers and detects topology mismatch', () => {
    const state = new ObjectSimulationState(positions, indices, 3)
    expect(state.applyAuthoritativeDelta(Uint32Array.of(1), new Float32Array([2, 0, 0]), 2, 10, 3)).toBe('APPLIED')
    expect(state.applyAuthoritativeDelta(Uint32Array.of(1), new Float32Array([3, 0, 0]), 1, 11, 3)).toBe('STALE')
    expect(state.applyAuthoritativeDelta(Uint32Array.of(1), new Float32Array([3, 0, 0]), 3, 12, 4)).toBe('TOPOLOGY_MISMATCH')
    expect(state.authoritativePositions[3]).toBe(2)
  })

  it('keeps a predicted topology hint separate until an authoritative snapshot arrives', () => {
    const state = new ObjectSimulationState(positions, indices, 1)
    state.setPredictedTopologyHint(
      new Float32Array([...positions, 0, 0, 0]),
      new Uint32Array([0, 1, 2, 3, 1, 2]),
    )
    expect(state.authoritativePositions.length).toBe(9)
    expect(state.visualPositions.length).toBe(12)
    expect(state.topologyVersion).toBe(1)
    expect(state.applyAuthoritativeSnapshot({ positions, indices, topologyVersion: 2 }, 4, 20)).toBe(true)
    expect(state.predictedTopologyHint).toBeNull()
    expect(state.topologyVersion).toBe(2)
  })

  it('reconciles faster when prediction error is large', () => {
    const state = new ObjectSimulationState(positions, indices)
    state.setPredictedPositions(new Float32Array([0.1, 0, 0, 1, 0, 0, 0, 1, 0]))
    const before = state.visualPositions[0]
    const metrics = state.reconcile(1 / 60, 3, 18, 0.02)
    expect(metrics.maxError).toBeCloseTo(0.1)
    expect(state.visualPositions[0]).toBeLessThan(before)
  })
})
