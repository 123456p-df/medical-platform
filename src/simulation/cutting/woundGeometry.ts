import * as THREE from 'three'

export function closedWoundBoundary(left: Uint32Array, right: Uint32Array) {
  if (left.length < 2 || right.length < 2) throw new Error('A wound requires two non-empty seam boundaries')
  const ordered = [...left]
  for (let index = right.length - 2; index > 0; index--) ordered.push(right[index])
  return Uint32Array.from(ordered)
}

export function boundaryPoints(
  position: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
  boundary: Uint32Array,
) {
  return [...boundary].map(vertexId => new THREE.Vector3().fromBufferAttribute(position, vertexId))
}

export function nearestBoundaryVertexAtFraction(
  positions: Float32Array,
  boundary: Uint32Array,
  fraction: number,
) {
  if (!boundary.length) throw new Error('Cannot map a control onto an empty wound boundary')
  if (boundary.length === 1) return boundary[0]
  const cumulative = new Float32Array(boundary.length)
  let length = 0
  for (let index = 1; index < boundary.length; index++) {
    const previous = boundary[index - 1] * 3
    const current = boundary[index] * 3
    length += Math.hypot(
      positions[current] - positions[previous],
      positions[current + 1] - positions[previous + 1],
      positions[current + 2] - positions[previous + 2],
    )
    cumulative[index] = length
  }
  const target = THREE.MathUtils.clamp(fraction, 0, 1) * length
  let best = 0
  let bestDistance = Number.POSITIVE_INFINITY
  for (let index = 0; index < cumulative.length; index++) {
    const distance = Math.abs(cumulative[index] - target)
    if (distance < bestDistance) {
      best = index
      bestDistance = distance
    }
  }
  return boundary[best]
}

export function woundBoundaryGeometry(
  position: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
  left: Uint32Array,
  right: Uint32Array,
  tubeRadius: number,
) {
  const points = boundaryPoints(position, closedWoundBoundary(left, right))
  if (points.length < 3) return new THREE.BufferGeometry().setFromPoints(points)
  const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.45)
  return new THREE.TubeGeometry(curve, Math.max(24, points.length * 3), tubeRadius, 8, true)
}

export function woundSidewallGeometry(
  position: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
  normal: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
  left: Uint32Array,
  right: Uint32Array,
  depth: number,
) {
  const vertices: number[] = []
  const triangles: number[] = []
  const appendStrip = (boundary: Uint32Array) => {
    const start = vertices.length / 3
    for (const vertexId of boundary) {
      const outer = new THREE.Vector3().fromBufferAttribute(position, vertexId)
      const inward = new THREE.Vector3().fromBufferAttribute(normal, vertexId).normalize().multiplyScalar(-depth)
      vertices.push(outer.x, outer.y, outer.z, outer.x + inward.x, outer.y + inward.y, outer.z + inward.z)
    }
    for (let index = 0; index < boundary.length - 1; index++) {
      const outer0 = start + index * 2
      const inner0 = outer0 + 1
      const outer1 = outer0 + 2
      const inner1 = outer0 + 3
      triangles.push(outer0, outer1, inner0, outer1, inner1, inner0)
    }
  }
  appendStrip(left)
  appendStrip(right)
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setIndex(triangles)
  geometry.computeVertexNormals()
  return geometry
}
