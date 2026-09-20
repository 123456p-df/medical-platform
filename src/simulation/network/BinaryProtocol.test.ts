import { describe, expect, it } from 'vitest'
import { decodeStateDelta, encodeStateDelta } from './BinaryProtocol'

describe('simulation binary protocol', () => {
  it('round-trips packed incremental positions with sequencing metadata', () => {
    const encoded = encodeStateDelta({
      objectId: 'liver', sequenceNumber: 42, simulationTick: 108, topologyVersion: 3,
      changedIndices: Uint32Array.of(2, 7),
      positions: new Float32Array([1, 2, 3, 4, 5, 6]),
    })
    const packet = decodeStateDelta(encoded)
    expect(packet.objectId).toBe('liver')
    expect(packet.sequenceNumber).toBe(42)
    expect(packet.simulationTick).toBe(108)
    expect(packet.topologyVersion).toBe(3)
    expect([...packet.changedIndices]).toEqual([2, 7])
    expect([...packet.positions]).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('rejects malformed packets', () => {
    expect(() => decodeStateDelta(new ArrayBuffer(12))).toThrow(/truncated/)
  })
})
