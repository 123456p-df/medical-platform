import { describe, expect, it } from 'vitest'
import { parseSimulationManifest } from './manifest'

const valid = {
  schemaVersion: '1.0',
  id: 'case_demo',
  caseId: 'case_demo',
  name: 'Demo',
  coordinateSystem: 'GLTF_Y_UP',
  units: 'meter',
  structures: [{
    id: 'body', name: 'Body', type: 'body', visualMesh: '/models/body.glb',
    physicsMesh: null, deformable: true, visible: true, physicsMode: 'KINEMATIC',
    material: { color: '#dab8a0', opacity: 0.4 }, metadata: { source: 'test' },
  }],
  metadata: {},
}

describe('simulation manifest parser', () => {
  it('accepts a dynamic structure manifest', () => {
    const manifest = parseSimulationManifest(valid)
    expect(manifest.structures[0].id).toBe('body')
    expect(manifest.structures[0].physicsMesh).toBeNull()
  })

  it('rejects duplicate ids and unsafe asset URLs', () => {
    expect(() => parseSimulationManifest({ ...valid, structures: [...valid.structures, valid.structures[0]] })).toThrow(/Duplicate/)
    expect(() => parseSimulationManifest({
      ...valid,
      structures: [{ ...valid.structures[0], visualMesh: 'javascript:alert(1)' }],
    })).toThrow(/unsupported asset URL/)
    expect(() => parseSimulationManifest({
      ...valid,
      structures: [{ ...valid.structures[0], labelId: Number.NaN }],
    })).toThrow(/labelId/)
  })
})
