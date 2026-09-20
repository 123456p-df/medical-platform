import * as THREE from 'three'
import { refitBoundsTree } from '../core/bvh'

interface DeformedMessage {
  type: 'deformed'
  generation: number
  positions: ArrayBuffer
  stepMs: number
}

interface SettledMessage {
  type: 'settled'
  generation: number
}

export class PhysicsManager {
  private worker?: Worker
  private mesh?: THREE.Mesh
  private generation = 0
  private target: [number, number, number] | null = null
  private ready = false
  private onGeometryUpdated?: (mesh: THREE.Mesh) => void
  onError?: (message: string) => void
  onStep?: (milliseconds: number) => void

  setGeometryListener(listener: (mesh: THREE.Mesh) => void) {
    this.onGeometryUpdated = listener
  }

  beginDrag(mesh: THREE.Mesh, vertexId: number, radius: number) {
    this.ensureWorker()
    this.generation++
    this.mesh = mesh
    this.ready = false
    const position = mesh.geometry.getAttribute('position')
    const index = mesh.geometry.index
    if (!index || vertexId >= position.count) throw new Error('Drag constraint references invalid mesh topology')
    const positions = new Float32Array(position.array)
    const indices = new Uint32Array(index.array)
    this.target = [position.getX(vertexId), position.getY(vertexId), position.getZ(vertexId)]
    this.worker?.postMessage({
      type: 'initialize', generation: this.generation,
      positions: positions.buffer, indices: indices.buffer, anchor: vertexId, radius,
    }, [positions.buffer, indices.buffer])
  }

  updateDrag(target: THREE.Vector3) {
    this.target = [target.x, target.y, target.z]
    if (this.ready) this.postTarget()
  }

  endDrag() {
    this.worker?.postMessage({ type: 'release', generation: this.generation })
    this.target = null
    this.ready = false
  }

  dispose() {
    this.generation++
    this.worker?.terminate()
    this.worker = undefined
    this.mesh = undefined
  }

  private ensureWorker() {
    if (this.worker) return
    this.worker = new Worker(new URL('../workers/mesh.worker.ts', import.meta.url), { type: 'module' })
    this.worker.onmessage = (event: MessageEvent<DeformedMessage | SettledMessage | { type: 'ready'; generation: number }>) => {
      const message = event.data
      if (message.generation !== this.generation) return
      if (message.type === 'settled') {
        this.mesh = undefined
        return
      }
      if (message.type === 'ready') {
        this.ready = true
        this.postTarget()
        return
      }
      if (!this.mesh) return
      const next = new Float32Array(message.positions)
      if (![...next].every(Number.isFinite)) {
        this.onError?.('Physics worker produced non-finite vertices; deformation was stopped')
        this.endDrag()
        return
      }
      const attribute = this.mesh.geometry.getAttribute('position') as THREE.BufferAttribute
      if (next.length !== attribute.array.length) return
      attribute.array.set(next)
      attribute.needsUpdate = true
      this.mesh.geometry.computeVertexNormals()
      refitBoundsTree(this.mesh.geometry)
      this.onGeometryUpdated?.(this.mesh)
      this.onStep?.(message.stepMs)
    }
    this.worker.onerror = () => {
      this.onError?.('Mesh deformation worker crashed')
      this.dispose()
    }
  }

  private postTarget() {
    if (!this.target || !this.ready) return
    this.worker?.postMessage({ type: 'update', generation: this.generation, target: this.target })
  }
}
