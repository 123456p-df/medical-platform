interface InitializeMessage {
  type: 'initialize'
  generation: number
  positions: ArrayBuffer
  indices: ArrayBuffer
  anchor: number
  radius: number
}

interface UpdateMessage {
  type: 'update'
  generation: number
  target: [number, number, number]
}

type WorkerMessage = InitializeMessage | UpdateMessage | { type: 'release'; generation: number }

let generation = 0
let base = new Float32Array()
let anchor = 0
let weights = new Float32Array()
let adjacency: number[][] = []
let lastDisplacement = new Float32Array()
let releaseTimer: ReturnType<typeof setInterval> | undefined

function clearRelease() {
  if (releaseTimer !== undefined) clearInterval(releaseTimer)
  releaseTimer = undefined
}

function sendDeformation(displacement: Float32Array, started: number) {
  const result = new Float32Array(base.length)
  for (let index = 0; index < base.length; index++) result[index] = base[index] + displacement[index]
  self.postMessage(
    { type: 'deformed', generation, positions: result.buffer, stepMs: performance.now() - started },
    { transfer: [result.buffer] },
  )
}

function edgeLength(positions: Float32Array, a: number, b: number) {
  return Math.hypot(
    positions[a * 3] - positions[b * 3],
    positions[a * 3 + 1] - positions[b * 3 + 1],
    positions[a * 3 + 2] - positions[b * 3 + 2],
  )
}

function deformationWeights(positions: Float32Array, indices: Uint32Array, source: number, radius: number) {
  const weightedAdjacency = Array.from({ length: positions.length / 3 }, () => new Map<number, number>())
  for (let index = 0; index < indices.length; index += 3) {
    const triangle = [indices[index], indices[index + 1], indices[index + 2]]
    for (const [a, b] of [[triangle[0], triangle[1]], [triangle[1], triangle[2]], [triangle[2], triangle[0]]]) {
      const length = edgeLength(positions, a, b)
      weightedAdjacency[a].set(b, length)
      weightedAdjacency[b].set(a, length)
    }
  }
  const distances = new Float32Array(weightedAdjacency.length)
  distances.fill(Number.POSITIVE_INFINITY)
  distances[source] = 0
  const queue: Array<[number, number]> = [[source, 0]]
  while (queue.length) {
    queue.sort((a, b) => b[1] - a[1])
    const [current, distance] = queue.pop() as [number, number]
    if (distance !== distances[current] || distance > radius) continue
    for (const [next, length] of weightedAdjacency[current]) {
      const candidate = distance + length
      if (candidate >= distances[next] || candidate > radius) continue
      distances[next] = candidate
      queue.push([next, candidate])
    }
  }
  const result = new Float32Array(weightedAdjacency.length)
  for (let index = 0; index < result.length; index++) {
    if (!Number.isFinite(distances[index])) continue
    const x = Math.max(0, 1 - distances[index] / radius)
    result[index] = x * x * (3 - 2 * x)
  }
  return {
    weights: result,
    adjacency: weightedAdjacency.map(neighbors => [...neighbors.keys()]),
  }
}

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const message = event.data
  if (message.type === 'initialize') {
    clearRelease()
    generation = message.generation
    base = new Float32Array(message.positions)
    const indices = new Uint32Array(message.indices)
    anchor = message.anchor
    const deformation = deformationWeights(base, indices, anchor, message.radius)
    weights = deformation.weights
    adjacency = deformation.adjacency
    lastDisplacement = new Float32Array(base.length)
    self.postMessage({ type: 'ready', generation })
    return
  }
  if (message.generation !== generation) return
  if (message.type === 'release') {
    clearRelease()
    const released = new Float32Array(lastDisplacement)
    let frame = 0
    const frameCount = 18
    releaseTimer = setInterval(() => {
      const started = performance.now()
      frame++
      const remaining = Math.max(0, 1 - frame / frameCount)
      const eased = remaining * remaining * (3 - 2 * remaining)
      const displacement = new Float32Array(released.length)
      for (let index = 0; index < released.length; index++) displacement[index] = released[index] * eased
      lastDisplacement = displacement
      sendDeformation(displacement, started)
      if (frame >= frameCount) {
        clearRelease()
        self.postMessage({ type: 'settled', generation })
      }
    }, 16)
    return
  }
  const started = performance.now()
  const anchorOffset = anchor * 3
  const delta = [
    message.target[0] - base[anchorOffset],
    message.target[1] - base[anchorOffset + 1],
    message.target[2] - base[anchorOffset + 2],
  ]
  let displacement = new Float32Array(base.length)
  for (let index = 0; index < weights.length; index++) {
    const weight = weights[index]
    if (!weight) continue
    displacement[index * 3] = delta[0] * weight
    displacement[index * 3 + 1] = delta[1] * weight
    displacement[index * 3 + 2] = delta[2] * weight
  }
  // Jacobi relaxation approximates a local membrane spring solve. The dragged
  // node remains constrained while its one-ring neighborhood shares strain.
  for (let iteration = 0; iteration < 8; iteration++) {
    const relaxed = new Float32Array(displacement)
    for (let index = 0; index < weights.length; index++) {
      const weight = weights[index]
      if (!weight || index === anchor || weight > 0.999) continue
      const neighbors = adjacency[index]
      if (!neighbors.length) continue
      for (let axis = 0; axis < 3; axis++) {
        let average = 0
        for (const neighbor of neighbors) average += displacement[neighbor * 3 + axis]
        average /= neighbors.length
        const desired = delta[axis] * weight
        relaxed[index * 3 + axis] = desired * 0.42 + average * 0.58
      }
    }
    displacement = relaxed
  }
  lastDisplacement = displacement
  sendDeformation(displacement, started)
}

export {}
