import type { CutResult } from '../types'

export interface TopologySplit extends CutResult {
  positions: Float32Array
  indices: Uint32Array
}

type Vec3 = [number, number, number]

function normalize(value: Vec3): Vec3 {
  const length = Math.hypot(value[0], value[1], value[2])
  return length > 1e-10 ? [value[0] / length, value[1] / length, value[2] / length] : [0, 0, 0]
}

function edgeKey(a: number, b: number) {
  return a < b ? `${a}:${b}` : `${b}:${a}`
}

function vertex(positions: Float32Array, id: number): Vec3 {
  const offset = id * 3
  return [positions[offset], positions[offset + 1], positions[offset + 2]]
}

function sub(a: readonly number[], b: readonly number[]): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

function cross(a: readonly number[], b: readonly number[]): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

function dot(a: readonly number[], b: readonly number[]) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

function triangleSide(
  positions: Float32Array,
  indices: Uint32Array,
  triangleId: number,
  from: number,
  to: number,
) {
  const a = vertex(positions, from)
  const b = vertex(positions, to)
  const offset = triangleId * 3
  const va = vertex(positions, indices[offset])
  const vb = vertex(positions, indices[offset + 1])
  const vc = vertex(positions, indices[offset + 2])
  const normal = cross(sub(vb, va), sub(vc, va))
  const midpoint: Vec3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]
  const centroid: Vec3 = [(va[0] + vb[0] + vc[0]) / 3, (va[1] + vb[1] + vc[1]) / 3, (va[2] + vb[2] + vc[2]) / 3]
  return dot(cross(sub(b, a), sub(centroid, midpoint)), normal)
}

function vertexNormals(positions: Float32Array, indices: Uint32Array) {
  const normals = new Float32Array(positions.length)
  for (let offset = 0; offset < indices.length; offset += 3) {
    const ids = [indices[offset], indices[offset + 1], indices[offset + 2]]
    const a = vertex(positions, ids[0])
    const b = vertex(positions, ids[1])
    const c = vertex(positions, ids[2])
    const normal = cross(sub(b, a), sub(c, a))
    for (const id of ids) {
      normals[id * 3] += normal[0]
      normals[id * 3 + 1] += normal[1]
      normals[id * 3 + 2] += normal[2]
    }
  }
  return normals
}

/**
 * Duplicates the whole incident triangle fan on one side of the path. Rewiring
 * only triangles touching each path edge leaves fan triangles spanning both
 * sides and produces long spikes when an incision is opened.
 */
export function splitMeshAlongVertexPath(
  positions: Float32Array,
  indices: Uint32Array,
  pathInput: Uint32Array,
): TopologySplit {
  const vertexCount = positions.length / 3
  const triangleCount = indices.length / 3
  if (!Number.isInteger(vertexCount) || !Number.isInteger(triangleCount)) throw new Error('Invalid packed mesh buffers')
  const path = [...pathInput]
  if (path.length < 2) throw new Error('A cut path needs at least two vertices')
  if (new Set(path).size !== path.length) throw new Error('A cut path cannot repeat vertices')
  if (path.some(id => id >= vertexCount)) throw new Error('Cut path vertex is out of range')

  const pathIndex = new Int32Array(vertexCount)
  pathIndex.fill(-1)
  path.forEach((id, index) => { pathIndex[id] = index })
  const normals = vertexNormals(positions, indices)
  const edgeTriangles = new Map<string, number[]>()
  for (let triangleId = 0; triangleId < triangleCount; triangleId++) {
    const offset = triangleId * 3
    const triangle = [indices[offset], indices[offset + 1], indices[offset + 2]]
    if (triangle.some(id => id >= vertexCount)) throw new Error('Triangle index is out of range')
    for (const [a, b] of [[triangle[0], triangle[1]], [triangle[1], triangle[2]], [triangle[2], triangle[0]]]) {
      const key = edgeKey(a, b)
      const adjacent = edgeTriangles.get(key) ?? []
      adjacent.push(triangleId)
      edgeTriangles.set(key, adjacent)
    }
  }

  for (let index = 0; index < path.length - 1; index++) {
    if (!edgeTriangles.get(edgeKey(path[index], path[index + 1]))?.length) {
      throw new Error('Cut path must follow surface edges')
    }
  }

  const votes = new Float64Array(triangleCount)
  const affected = new Set<number>()
  for (let triangleId = 0; triangleId < triangleCount; triangleId++) {
    const offset = triangleId * 3
    const ids = [indices[offset], indices[offset + 1], indices[offset + 2]]
    const centroid: Vec3 = [
      (positions[ids[0] * 3] + positions[ids[1] * 3] + positions[ids[2] * 3]) / 3,
      (positions[ids[0] * 3 + 1] + positions[ids[1] * 3 + 1] + positions[ids[2] * 3 + 1]) / 3,
      (positions[ids[0] * 3 + 2] + positions[ids[1] * 3 + 2] + positions[ids[2] * 3 + 2]) / 3,
    ]
    for (const id of ids) {
      const index = pathIndex[id]
      if (index < 0) continue
      affected.add(triangleId)
      const before = vertex(positions, path[Math.max(0, index - 1)])
      const after = vertex(positions, path[Math.min(path.length - 1, index + 1)])
      const tangent = normalize(sub(after, before))
      const normal = normalize(vertex(normals, id))
      votes[triangleId] += dot(cross(tangent, sub(centroid, vertex(positions, id))), normal)
    }
  }

  const rewired = new Set<number>()
  for (const triangleId of affected) if (votes[triangleId] > 0) rewired.add(triangleId)

  // Every manifold seam edge must end with one triangle on each side.
  for (let index = 0; index < path.length - 1; index++) {
    const from = path[index]
    const to = path[index + 1]
    const adjacent = edgeTriangles.get(edgeKey(from, to)) as number[]
    if (adjacent.length < 2) continue
    const states = adjacent.map(triangleId => rewired.has(triangleId))
    if (states.some(Boolean) && states.some(state => !state)) continue
    const ranked = adjacent
      .map(triangleId => ({ triangleId, score: triangleSide(positions, indices, triangleId, from, to) }))
      .sort((a, b) => b.score - a.score)
    adjacent.forEach(triangleId => rewired.delete(triangleId))
    rewired.add(ranked[0].triangleId)
  }

  const duplicateByVertex = new Map<number, number>()
  const nextPositions = new Float32Array(positions.length + path.length * 3)
  nextPositions.set(positions)
  path.forEach((original, index) => {
    const duplicate = vertexCount + index
    duplicateByVertex.set(original, duplicate)
    nextPositions.set(positions.subarray(original * 3, original * 3 + 3), duplicate * 3)
  })

  const nextIndices = new Uint32Array(indices)
  for (const triangleId of rewired) {
    const offset = triangleId * 3
    for (let corner = 0; corner < 3; corner++) {
      const duplicate = duplicateByVertex.get(nextIndices[offset + corner])
      if (duplicate !== undefined) nextIndices[offset + corner] = duplicate
    }
  }

  if (![...nextPositions].every(Number.isFinite)) throw new Error('Cut generated non-finite vertices')
  if ([...nextIndices].some(id => id >= nextPositions.length / 3)) throw new Error('Cut generated an invalid triangle index')

  return {
    positions: nextPositions,
    indices: nextIndices,
    leftBoundary: Uint32Array.from(path),
    rightBoundary: Uint32Array.from(path.map(id => duplicateByVertex.get(id) as number)),
    affectedTriangles: Uint32Array.from([...affected].sort((a, b) => a - b)),
    newVertices: Uint32Array.from(path.map(id => duplicateByVertex.get(id) as number)),
    removedConstraints: Uint32Array.from(path.slice(0, -1).flatMap((id, index) => [id, path[index + 1]])),
  }
}

function adjacencyFor(indices: Uint32Array, vertexCount: number) {
  const sets = Array.from({ length: vertexCount }, () => new Set<number>())
  for (let offset = 0; offset < indices.length; offset += 3) {
    const a = indices[offset]
    const b = indices[offset + 1]
    const c = indices[offset + 2]
    sets[a].add(b); sets[a].add(c)
    sets[b].add(a); sets[b].add(c)
    sets[c].add(a); sets[c].add(b)
  }
  return sets.map(set => [...set])
}

interface DiffusedDisplacement {
  values: Float32Array
  influence: Float32Array
}

function diffuseBoundaryDisplacement(
  positions: Float32Array,
  adjacency: number[][],
  boundary: Uint32Array,
  blockedBoundary: Uint32Array,
  targets: Float32Array,
  supportRings: number,
): DiffusedDisplacement {
  const vertexCount = positions.length / 3
  const distance = new Int16Array(vertexCount)
  distance.fill(-1)
  const source = new Int32Array(vertexCount)
  source.fill(-1)
  const blocked = new Uint8Array(vertexCount)
  blockedBoundary.forEach(id => { blocked[id] = 1 })
  const queue = new Int32Array(vertexCount)
  let head = 0
  let tail = 0
  boundary.forEach((id, index) => {
    distance[id] = 0
    source[id] = index
    queue[tail++] = id
  })
  while (head < tail) {
    const current = queue[head++]
    const nextDistance = distance[current] + 1
    if (nextDistance > supportRings) continue
    for (const neighbor of adjacency[current]) {
      if (blocked[neighbor] || distance[neighbor] >= 0) continue
      distance[neighbor] = nextDistance
      source[neighbor] = source[current]
      queue[tail++] = neighbor
    }
  }

  let values = new Float32Array(positions.length)
  const influence = new Float32Array(vertexCount)
  for (let id = 0; id < vertexCount; id++) {
    const ring = distance[id]
    if (ring < 0) continue
    const x = Math.max(0, 1 - ring / (supportRings + 1))
    const weight = x * x * (3 - 2 * x)
    influence[id] = weight
    const targetOffset = source[id] * 3
    values[id * 3] = targets[targetOffset] * weight
    values[id * 3 + 1] = targets[targetOffset + 1] * weight
    values[id * 3 + 2] = targets[targetOffset + 2] * weight
  }

  const constrained = new Uint8Array(vertexCount)
  boundary.forEach(id => { constrained[id] = 1 })
  for (let iteration = 0; iteration < 10; iteration++) {
    const relaxed = new Float32Array(values)
    for (let id = 0; id < vertexCount; id++) {
      if (distance[id] < 0 || constrained[id]) continue
      const neighbors = adjacency[id]
      if (!neighbors.length) continue
      for (let axis = 0; axis < 3; axis++) {
        let average = 0
        for (const neighbor of neighbors) average += distance[neighbor] >= 0 ? values[neighbor * 3 + axis] : 0
        average /= neighbors.length
        const desired = values[id * 3 + axis]
        relaxed[id * 3 + axis] = desired * 0.38 + average * 0.62
      }
    }
    values = relaxed
  }
  boundary.forEach((id, index) => {
    values.set(targets.subarray(index * 3, index * 3 + 3), id * 3)
    influence[id] = 1
  })
  return { values, influence }
}

function hasFoldovers(base: Float32Array, candidate: Float32Array, indices: Uint32Array) {
  for (let offset = 0; offset < indices.length; offset += 3) {
    const ids = [indices[offset], indices[offset + 1], indices[offset + 2]]
    const baseNormal = cross(sub(vertex(base, ids[1]), vertex(base, ids[0])), sub(vertex(base, ids[2]), vertex(base, ids[0])))
    const nextNormal = cross(
      sub(vertex(candidate, ids[1]), vertex(candidate, ids[0])),
      sub(vertex(candidate, ids[2]), vertex(candidate, ids[0])),
    )
    const baseArea = Math.hypot(...baseNormal)
    if (baseArea < 1e-10) continue
    const nextArea = Math.hypot(...nextNormal)
    if (nextArea < baseArea * 0.04 || dot(baseNormal, nextNormal) <= 0) return true
  }
  return false
}

/**
 * Treats seam targets as positional constraints and relaxes their displacement
 * through the local membrane graph. This approximates elastic skin instead of
 * stretching one triangle row. It never advances authoritative topologyVersion.
 */
export function openPredictedSeam(split: TopologySplit, maximumHalfWidth: number) {
  if (!(maximumHalfWidth > 0) || !Number.isFinite(maximumHalfWidth)) throw new Error('Opening width must be positive')
  const base = new Float32Array(split.positions)
  const normals = vertexNormals(base, split.indices)

  let centers = [...split.leftBoundary].map(id => vertex(base, id))
  for (let pass = 0; pass < 3; pass++) {
    const smoothed = centers.map(point => [...point] as Vec3)
    for (let index = 1; index < centers.length - 1; index++) {
      for (let axis = 0; axis < 3; axis++) {
        smoothed[index][axis] = centers[index][axis] * 0.25
          + (centers[index - 1][axis] + centers[index + 1][axis]) * 0.375
      }
    }
    centers = smoothed
  }

  const arcLengths = new Float32Array(centers.length)
  for (let index = 1; index < centers.length; index++) {
    arcLengths[index] = arcLengths[index - 1] + Math.hypot(...sub(centers[index], centers[index - 1]))
  }
  const totalLength = arcLengths[arcLengths.length - 1] || 1
  const laterals: Vec3[] = []
  for (let index = 0; index < split.leftBoundary.length; index++) {
    const left = split.leftBoundary[index]
    const right = split.rightBoundary[index]
    const tangent = normalize(sub(
      centers[Math.min(centers.length - 1, index + 1)],
      centers[Math.max(0, index - 1)],
    ))
    const leftNormal = vertex(normals, left)
    const rightNormal = vertex(normals, right)
    const normal = normalize([
      leftNormal[0] + rightNormal[0],
      leftNormal[1] + rightNormal[1],
      leftNormal[2] + rightNormal[2],
    ])
    let lateral = normalize(cross(tangent, normal))
    const prior = laterals[index - 1]
    if (prior && dot(lateral, prior) < 0) lateral = [-lateral[0], -lateral[1], -lateral[2]]
    laterals.push(lateral)
  }
  for (let pass = 0; pass < 3; pass++) {
    const smoothed = laterals.map(direction => [...direction] as Vec3)
    for (let index = 1; index < laterals.length - 1; index++) {
      smoothed[index] = normalize([
        laterals[index - 1][0] + laterals[index][0] * 2 + laterals[index + 1][0],
        laterals[index - 1][1] + laterals[index][1] * 2 + laterals[index + 1][1],
        laterals[index - 1][2] + laterals[index][2] * 2 + laterals[index + 1][2],
      ])
    }
    laterals.splice(0, laterals.length, ...smoothed)
  }

  const leftTargets = new Float32Array(split.leftBoundary.length * 3)
  const rightTargets = new Float32Array(split.rightBoundary.length * 3)
  for (let index = 0; index < split.leftBoundary.length; index++) {
    const progress = arcLengths[index] / totalLength
    const halfWidth = maximumHalfWidth * Math.sin(Math.PI * progress) ** 0.92
    const leftBase = vertex(base, split.leftBoundary[index])
    const rightBase = vertex(base, split.rightBoundary[index])
    for (let axis = 0; axis < 3; axis++) {
      leftTargets[index * 3 + axis] = centers[index][axis] + laterals[index][axis] * halfWidth - leftBase[axis]
      rightTargets[index * 3 + axis] = centers[index][axis] - laterals[index][axis] * halfWidth - rightBase[axis]
    }
  }

  const adjacency = adjacencyFor(split.indices, base.length / 3)
  const left = diffuseBoundaryDisplacement(base, adjacency, split.leftBoundary, split.rightBoundary, leftTargets, 8)
  const right = diffuseBoundaryDisplacement(base, adjacency, split.rightBoundary, split.leftBoundary, rightTargets, 8)
  const displacement = new Float32Array(base.length)
  for (let id = 0; id < base.length / 3; id++) {
    const source = left.influence[id] >= right.influence[id] ? left : right
    displacement.set(source.values.subarray(id * 3, id * 3 + 3), id * 3)
  }

  let scale = 1
  let candidate = new Float32Array(base.length)
  for (let attempt = 0; attempt < 7; attempt++) {
    for (let index = 0; index < base.length; index++) candidate[index] = base[index] + displacement[index] * scale
    if (!hasFoldovers(base, candidate, split.indices)) break
    scale *= 0.72
  }
  if (![...candidate].every(Number.isFinite)) throw new Error('Elastic opening generated non-finite vertices')
  return candidate
}
