export interface MeshSnapshot {
  positions: Float32Array
  indices: Uint32Array
  topologyVersion: number
}

export interface PredictedTopologyHint {
  positions: Float32Array
  indices: Uint32Array
  basedOnTopologyVersion: number
}

export interface ReconciliationMetrics {
  maxError: number
  meanError: number
}

function copyPositions(value: Float32Array) {
  if (value.length % 3 !== 0 || [...value].some(item => !Number.isFinite(item))) {
    throw new Error('Position buffer must contain finite packed xyz values')
  }
  return new Float32Array(value)
}

function copyIndices(value: Uint32Array, vertexCount: number) {
  if (value.length % 3 !== 0 || [...value].some(item => item >= vertexCount)) {
    throw new Error('Triangle buffer contains an invalid index')
  }
  return new Uint32Array(value)
}

export class ObjectSimulationState {
  authoritativePositions: Float32Array
  predictedPositions: Float32Array
  visualPositions: Float32Array
  authoritativeIndices: Uint32Array
  predictedTopologyHint: PredictedTopologyHint | null = null
  topologyVersion: number
  authoritativeSequence = 0
  simulationTick = 0

  constructor(positions: Float32Array, indices: Uint32Array, topologyVersion = 1) {
    this.authoritativePositions = copyPositions(positions)
    this.predictedPositions = copyPositions(positions)
    this.visualPositions = copyPositions(positions)
    this.authoritativeIndices = copyIndices(indices, positions.length / 3)
    this.topologyVersion = topologyVersion
  }

  setPredictedPositions(positions: Float32Array) {
    if (positions.length !== this.predictedPositions.length) throw new Error('Prediction vertex count changed without a topology hint')
    this.predictedPositions = copyPositions(positions)
    this.visualPositions.set(positions)
  }

  setPredictedTopologyHint(positions: Float32Array, indices: Uint32Array) {
    this.predictedTopologyHint = {
      positions: copyPositions(positions),
      indices: copyIndices(indices, positions.length / 3),
      basedOnTopologyVersion: this.topologyVersion,
    }
    this.predictedPositions = copyPositions(positions)
    this.visualPositions = copyPositions(positions)
  }

  updatePredictedTopologyPositions(positions: Float32Array) {
    if (!this.predictedTopologyHint || positions.length !== this.predictedTopologyHint.positions.length) {
      throw new Error('Predicted topology is not active')
    }
    this.predictedTopologyHint.positions = copyPositions(positions)
    this.predictedPositions = copyPositions(positions)
    this.visualPositions.set(positions)
  }

  applyAuthoritativeDelta(
    changedIndices: Uint32Array,
    xyz: Float32Array,
    sequence: number,
    simulationTick: number,
    topologyVersion: number,
  ) {
    if (topologyVersion !== this.topologyVersion) return 'TOPOLOGY_MISMATCH' as const
    if (sequence <= this.authoritativeSequence) return 'STALE' as const
    if (xyz.length !== changedIndices.length * 3) throw new Error('State delta length mismatch')
    for (let index = 0; index < changedIndices.length; index++) {
      const vertexId = changedIndices[index]
      if (vertexId >= this.authoritativePositions.length / 3) throw new Error('State delta index is out of range')
      const source = index * 3
      const target = vertexId * 3
      const x = xyz[source]
      const y = xyz[source + 1]
      const z = xyz[source + 2]
      if (![x, y, z].every(Number.isFinite)) throw new Error('Authoritative state contains non-finite positions')
      this.authoritativePositions[target] = x
      this.authoritativePositions[target + 1] = y
      this.authoritativePositions[target + 2] = z
    }
    this.authoritativeSequence = sequence
    this.simulationTick = simulationTick
    return 'APPLIED' as const
  }

  applyAuthoritativeSnapshot(snapshot: MeshSnapshot, sequence: number, simulationTick: number) {
    if (snapshot.topologyVersion < this.topologyVersion) return false
    this.authoritativePositions = copyPositions(snapshot.positions)
    this.authoritativeIndices = copyIndices(snapshot.indices, snapshot.positions.length / 3)
    this.predictedPositions = copyPositions(snapshot.positions)
    this.visualPositions = copyPositions(snapshot.positions)
    this.topologyVersion = snapshot.topologyVersion
    this.authoritativeSequence = sequence
    this.simulationTick = simulationTick
    this.predictedTopologyHint = null
    return true
  }

  reconcile(deltaSeconds: number, slowRate = 3, fastRate = 18, fastThreshold = 0.02): ReconciliationMetrics {
    if (this.predictedTopologyHint || this.visualPositions.length !== this.authoritativePositions.length) {
      return { maxError: Number.POSITIVE_INFINITY, meanError: Number.POSITIVE_INFINITY }
    }
    let maxError = 0
    let sumError = 0
    const vertexCount = this.visualPositions.length / 3
    for (let vertex = 0; vertex < vertexCount; vertex++) {
      const offset = vertex * 3
      const error = Math.hypot(
        this.authoritativePositions[offset] - this.visualPositions[offset],
        this.authoritativePositions[offset + 1] - this.visualPositions[offset + 1],
        this.authoritativePositions[offset + 2] - this.visualPositions[offset + 2],
      )
      maxError = Math.max(maxError, error)
      sumError += error
      const rate = error > fastThreshold ? fastRate : slowRate
      const alpha = 1 - Math.exp(-rate * Math.max(0, deltaSeconds))
      this.visualPositions[offset] += (this.authoritativePositions[offset] - this.visualPositions[offset]) * alpha
      this.visualPositions[offset + 1] += (this.authoritativePositions[offset + 1] - this.visualPositions[offset + 1]) * alpha
      this.visualPositions[offset + 2] += (this.authoritativePositions[offset + 2] - this.visualPositions[offset + 2]) * alpha
    }
    return { maxError, meanError: vertexCount ? sumError / vertexCount : 0 }
  }
}
