export interface GraphEdge {
  to: number
  weight: number
}

export type SurfaceGraph = GraphEdge[][]

function distance(positions: Float32Array, a: number, b: number) {
  const ai = a * 3
  const bi = b * 3
  return Math.hypot(
    positions[ai] - positions[bi],
    positions[ai + 1] - positions[bi + 1],
    positions[ai + 2] - positions[bi + 2],
  )
}

export function buildSurfaceGraph(positions: Float32Array, indices: Uint32Array): SurfaceGraph {
  if (positions.length % 3 !== 0 || indices.length % 3 !== 0) {
    throw new Error('Mesh buffers must contain packed xyz vertices and triangle indices')
  }
  const vertexCount = positions.length / 3
  const maps = Array.from({ length: vertexCount }, () => new Map<number, number>())
  for (let offset = 0; offset < indices.length; offset += 3) {
    const triangle = [indices[offset], indices[offset + 1], indices[offset + 2]]
    if (triangle.some(vertex => vertex >= vertexCount)) throw new Error('Triangle index is out of range')
    for (const [a, b] of [[triangle[0], triangle[1]], [triangle[1], triangle[2]], [triangle[2], triangle[0]]]) {
      const edgeLength = distance(positions, a, b)
      maps[a].set(b, Math.min(maps[a].get(b) ?? Number.POSITIVE_INFINITY, edgeLength))
      maps[b].set(a, Math.min(maps[b].get(a) ?? Number.POSITIVE_INFINITY, edgeLength))
    }
  }
  return maps.map(neighbors => [...neighbors].map(([to, weight]) => ({ to, weight })))
}

interface HeapEntry {
  vertex: number
  score: number
}

class MinHeap {
  private readonly entries: HeapEntry[] = []

  push(entry: HeapEntry) {
    const entries = this.entries
    entries.push(entry)
    let index = entries.length - 1
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2)
      if (entries[parent].score <= entry.score) break
      entries[index] = entries[parent]
      index = parent
    }
    entries[index] = entry
  }

  pop(): HeapEntry | undefined {
    const entries = this.entries
    const first = entries[0]
    const last = entries.pop()
    if (!first || !last || entries.length === 0) return first
    let index = 0
    while (true) {
      const left = index * 2 + 1
      if (left >= entries.length) break
      const right = left + 1
      const child = right < entries.length && entries[right].score < entries[left].score ? right : left
      if (entries[child].score >= last.score) break
      entries[index] = entries[child]
      index = child
    }
    entries[index] = last
    return first
  }

  get size() { return this.entries.length }
}

export function shortestSurfacePath(graph: SurfaceGraph, start: number, end: number): Uint32Array {
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < 0 || start >= graph.length || end >= graph.length) {
    throw new Error('Path endpoint is outside the surface graph')
  }
  if (start === end) return Uint32Array.of(start)
  const distances = new Float64Array(graph.length)
  distances.fill(Number.POSITIVE_INFINITY)
  distances[start] = 0
  const previous = new Int32Array(graph.length)
  previous.fill(-1)
  const queue = new MinHeap()
  queue.push({ vertex: start, score: 0 })
  while (queue.size) {
    const current = queue.pop() as HeapEntry
    if (current.score !== distances[current.vertex]) continue
    if (current.vertex === end) break
    for (const edge of graph[current.vertex]) {
      const next = current.score + edge.weight
      if (next >= distances[edge.to]) continue
      distances[edge.to] = next
      previous[edge.to] = current.vertex
      queue.push({ vertex: edge.to, score: next })
    }
  }
  if (previous[end] < 0) throw new Error('Surface points are not connected')
  const reversed: number[] = []
  for (let vertex = end; vertex >= 0; vertex = previous[vertex]) {
    reversed.push(vertex)
    if (vertex === start) break
  }
  reversed.reverse()
  return Uint32Array.from(reversed)
}

export function vertexFromBarycentric(indices: Uint32Array, triangleId: number, barycentric: readonly number[]) {
  const offset = triangleId * 3
  if (offset < 0 || offset + 2 >= indices.length) throw new Error('Triangle id is out of range')
  let component = 0
  if (barycentric[1] > barycentric[component]) component = 1
  if (barycentric[2] > barycentric[component]) component = 2
  return indices[offset + component]
}
