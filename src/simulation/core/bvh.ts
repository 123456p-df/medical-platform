import * as THREE from 'three'
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh'

let installed = false

export function installBVHAcceleration() {
  if (installed) return
  installed = true
  THREE.Mesh.prototype.raycast = acceleratedRaycast
}

export function rebuildBoundsTree(geometry: THREE.BufferGeometry) {
  disposeBoundsTree.call(geometry)
  computeBoundsTree.call(geometry, { maxLeafTris: 12 })
}

export function refitBoundsTree(geometry: THREE.BufferGeometry) {
  const boundsTree = (geometry as THREE.BufferGeometry & { boundsTree?: { refit: () => void } }).boundsTree
  boundsTree?.refit()
}

export function disposeBoundsTreeFor(geometry: THREE.BufferGeometry) {
  disposeBoundsTree.call(geometry)
}
