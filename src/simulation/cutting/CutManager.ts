import * as THREE from 'three'
import type { CutResult } from '../types'
import { rebuildBoundsTree } from '../core/bvh'
import { ObjectSimulationState } from '../physics/SimulationState'
import {
  nearestBoundaryVertexAtFraction,
  woundBoundaryGeometry,
  woundSidewallGeometry,
} from './woundGeometry'

interface PredictedOpening extends CutResult {
  positions: Float32Array
  indices: Uint32Array
}

export interface AppliedCut {
  mesh: THREE.Mesh
  result: CutResult
  path: Uint32Array
  predictionOnly: true
  basedOnTopologyVersion: number
  depthPercent: number
  depthMeters: number
}

interface PredictedWound {
  id: number
  mesh: THREE.Mesh
  leftBoundary: Uint32Array
  rightBoundary: Uint32Array
  boundaryOverlay: THREE.Mesh
  sidewallOverlay: THREE.Mesh
  depthMeters: number
}

function packedGeometry(mesh: THREE.Mesh) {
  const geometry = mesh.geometry
  const position = geometry.getAttribute('position')
  if (!(position instanceof THREE.BufferAttribute) || position.itemSize !== 3) {
    throw new Error('Incision requires a packed xyz position attribute')
  }
  if (!geometry.index) throw new Error('Incision requires indexed triangle geometry')
  return {
    positions: new Float32Array(position.array),
    indices: new Uint32Array(geometry.index.array),
  }
}

export class CutManager {
  private states = new WeakMap<THREE.Mesh, ObjectSimulationState>()
  private readonly wounds: PredictedWound[] = []
  private nextWoundId = 1
  private readonly overlays = new Set<THREE.Object3D>()
  private readonly controls: THREE.Mesh[] = []
  private previewLine?: THREE.Line
  private previewMesh?: THREE.Mesh
  private previewPath?: Uint32Array
  private pathWorker?: Worker
  private pathRequestId = 0
  private rejectPath?: (reason: Error) => void
  private cutWorker?: Worker
  private cutRequestId = 0
  private rejectCut?: (reason: Error) => void
  private showPath = true
  private showBoundary = true
  private showControls = true

  setDebugVisibility(options: { path: boolean; boundary: boolean; controls: boolean }) {
    this.showPath = options.path
    this.showBoundary = options.boundary
    this.showControls = options.controls
    if (this.previewLine) this.previewLine.visible = options.path
    for (const overlay of this.overlays) {
      if (overlay.userData.kind === 'boundary') overlay.visible = options.boundary
      if (overlay.userData.kind === 'control') overlay.visible = options.controls
    }
  }

  markPoint(mesh: THREE.Mesh, localPosition: THREE.Vector3, label: 'A' | 'B') {
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.012, 16, 12),
      new THREE.MeshBasicMaterial({ color: label === 'A' ? 0x4dd8ff : 0xffd166, depthTest: false }),
    )
    marker.position.copy(localPosition)
    marker.renderOrder = 20
    marker.userData.kind = 'point'
    mesh.add(marker)
    this.overlays.add(marker)
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const context = canvas.getContext('2d')
    if (context) {
      context.fillStyle = label === 'A' ? '#4dd8ff' : '#ffd166'
      context.font = '700 42px sans-serif'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(label, 32, 32)
      const texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true }))
      sprite.position.copy(localPosition).add(new THREE.Vector3(0, 0.035, 0))
      sprite.scale.setScalar(0.045)
      sprite.renderOrder = 22
      sprite.userData.kind = 'point'
      mesh.add(sprite)
      this.overlays.add(sprite)
    }
  }

  async preview(mesh: THREE.Mesh, start: number, end: number) {
    this.cancelPathCalculation()
    this.removePreview()
    const { positions, indices } = packedGeometry(mesh)
    this.ensureState(mesh, positions, indices)
    const path = await this.calculatePath(positions, indices, start, end)
    if (path.length < 4) throw new Error('Choose surface points farther apart to create a stable opening')
    const currentPositions = packedGeometry(mesh).positions
    const pathPositions = new Float32Array(path.length * 3)
    path.forEach((vertexId, index) => {
      pathPositions.set(currentPositions.subarray(vertexId * 3, vertexId * 3 + 3), index * 3)
    })
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(pathPositions, 3))
    const material = new THREE.LineBasicMaterial({ color: 0xff6b7a, depthTest: false, transparent: true, opacity: 0.95 })
    this.previewLine = new THREE.Line(geometry, material)
    this.previewLine.renderOrder = 19
    this.previewLine.visible = this.showPath
    this.previewLine.userData.kind = 'preview'
    mesh.add(this.previewLine)
    this.previewMesh = mesh
    this.previewPath = path
    return path
  }

  async commitPrediction(depthPercent: number): Promise<AppliedCut> {
    if (!this.previewMesh || !this.previewPath) throw new Error('No incision preview is ready')
    const mesh = this.previewMesh
    const path = this.previewPath
    const { positions, indices } = packedGeometry(mesh)
    const state = this.ensureState(mesh, positions, indices)
    mesh.geometry.computeBoundingSphere()
    const radius = mesh.geometry.boundingSphere?.radius ?? 1
    const normalizedDepth = THREE.MathUtils.clamp(depthPercent, 5, 100)
    const configuredThickness = Number(mesh.userData.cuttableThicknessMeters)
    const cuttableThickness = Number.isFinite(configuredThickness) && configuredThickness > 0
      ? configuredThickness
      : Math.min(0.05, Math.max(0.008, radius * 0.08))
    const depthMeters = cuttableThickness * normalizedDepth / 100
    const split = await this.calculateOpening(
      positions,
      indices,
      path,
      Math.min(0.04, Math.max(0.008, radius * 0.025)),
    )
    state.setPredictedTopologyHint(split.positions, split.indices)
    this.removePreview()

    const geometry = mesh.geometry
    for (const name of Object.keys(geometry.attributes)) geometry.deleteAttribute(name)
    geometry.setAttribute('position', new THREE.BufferAttribute(state.visualPositions, 3))
    geometry.setIndex(new THREE.BufferAttribute(split.indices, 1))
    geometry.computeVertexNormals()
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()
    rebuildBoundsTree(geometry)

    const wound = this.addWound(mesh, split.leftBoundary, split.rightBoundary, depthMeters)
    this.addControls(mesh, state.visualPositions, split.leftBoundary, 0x4dd8ff, 'left', wound.id)
    this.addControls(mesh, state.visualPositions, split.rightBoundary, 0xffd166, 'right', wound.id)

    return {
      mesh,
      path,
      predictionOnly: true,
      basedOnTopologyVersion: state.topologyVersion,
      depthPercent: normalizedDepth,
      depthMeters,
      result: {
        leftBoundary: split.leftBoundary,
        rightBoundary: split.rightBoundary,
        affectedTriangles: split.affectedTriangles,
        newVertices: split.newVertices,
        removedConstraints: split.removedConstraints,
      },
    }
  }

  acceptPredictedGeometry(mesh: THREE.Mesh) {
    const state = this.states.get(mesh)
    if (!state?.predictedTopologyHint) return
    const position = mesh.geometry.getAttribute('position')
    state.updatePredictedTopologyPositions(new Float32Array(position.array))
  }

  getState(mesh: THREE.Mesh) {
    return this.states.get(mesh)
  }

  isPredictedCut(mesh: THREE.Mesh) {
    return this.wounds.some(wound => wound.mesh === mesh)
  }

  hasPredictedCuts() {
    return this.wounds.length > 0
  }

  getControlMeshes() {
    return this.controls
  }

  updateControlPositions(mesh: THREE.Mesh) {
    const position = mesh.geometry.getAttribute('position')
    for (const control of this.controls) {
      if (control.userData.targetMesh !== mesh) continue
      control.position.fromBufferAttribute(position, Number(control.userData.vertexId))
    }
    const normal = mesh.geometry.getAttribute('normal')
    for (const wound of this.wounds) {
      if (wound.mesh !== mesh) continue
      wound.boundaryOverlay.geometry.dispose()
      wound.boundaryOverlay.geometry = woundBoundaryGeometry(position, wound.leftBoundary, wound.rightBoundary, 0.004)
      wound.sidewallOverlay.geometry.dispose()
      wound.sidewallOverlay.geometry = woundSidewallGeometry(
        position,
        normal,
        wound.leftBoundary,
        wound.rightBoundary,
        wound.depthMeters,
      )
    }
  }

  clear() {
    this.cancelPathCalculation()
    this.cancelCutCalculation()
    this.removePreview()
    for (const overlay of this.overlays) {
      overlay.removeFromParent()
      if (overlay instanceof THREE.Mesh || overlay instanceof THREE.Line) {
        overlay.geometry.dispose()
        const materials = Array.isArray(overlay.material) ? overlay.material : [overlay.material]
        materials.forEach(material => material.dispose())
      } else if (overlay instanceof THREE.Sprite) {
        overlay.material.map?.dispose()
        overlay.material.dispose()
      }
    }
    this.overlays.clear()
    this.controls.length = 0
    this.states = new WeakMap<THREE.Mesh, ObjectSimulationState>()
    this.wounds.length = 0
    this.nextWoundId = 1
  }

  private addWound(mesh: THREE.Mesh, left: Uint32Array, right: Uint32Array, depthMeters: number) {
    const position = mesh.geometry.getAttribute('position')
    const normal = mesh.geometry.getAttribute('normal')
    const boundaryMesh = new THREE.Mesh(
      woundBoundaryGeometry(position, left, right, 0.004),
      new THREE.MeshBasicMaterial({ color: 0x661b26, depthTest: false }),
    )
    boundaryMesh.renderOrder = 18
    boundaryMesh.visible = this.showBoundary
    boundaryMesh.userData.kind = 'boundary'
    boundaryMesh.userData.targetMesh = mesh
    boundaryMesh.userData.leftBoundary = left
    boundaryMesh.userData.rightBoundary = right
    mesh.add(boundaryMesh)
    this.overlays.add(boundaryMesh)
    const sidewall = new THREE.Mesh(
      woundSidewallGeometry(position, normal, left, right, depthMeters),
      new THREE.MeshPhysicalMaterial({
        color: 0x9b3f48,
        roughness: 0.72,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -1,
      }),
    )
    sidewall.renderOrder = 17
    sidewall.userData.kind = 'sidewall'
    sidewall.userData.targetMesh = mesh
    mesh.add(sidewall)
    this.overlays.add(sidewall)
    const wound: PredictedWound = {
      id: this.nextWoundId++, mesh, leftBoundary: left, rightBoundary: right,
      boundaryOverlay: boundaryMesh, sidewallOverlay: sidewall, depthMeters,
    }
    this.wounds.push(wound)
    return wound
  }

  private addControls(
    mesh: THREE.Mesh,
    positions: Float32Array,
    boundary: Uint32Array,
    color: number,
    side: string,
    woundId: number,
  ) {
    const mapped = new Set<number>()
    for (const fraction of [0.25, 0.5, 0.75]) {
      const vertexId = nearestBoundaryVertexAtFraction(positions, boundary, fraction)
      if (mapped.has(vertexId) || vertexId === boundary[0] || vertexId === boundary[boundary.length - 1]) continue
      mapped.add(vertexId)
      const control = new THREE.Mesh(
        new THREE.SphereGeometry(0.016, 14, 10),
        new THREE.MeshBasicMaterial({ color, depthTest: false }),
      )
      control.position.fromArray(positions, vertexId * 3)
      control.renderOrder = 21
      control.visible = this.showControls
      control.userData.kind = 'control'
      control.userData.side = side
      control.userData.woundId = woundId
      control.userData.arcFraction = fraction
      control.userData.vertexId = vertexId
      control.userData.targetMesh = mesh
      mesh.add(control)
      this.controls.push(control)
      this.overlays.add(control)
    }
  }

  private removePreview() {
    if (this.previewLine) {
      this.previewLine.removeFromParent()
      this.previewLine.geometry.dispose()
      ;(this.previewLine.material as THREE.Material).dispose()
    }
    this.previewLine = undefined
    this.previewMesh = undefined
    this.previewPath = undefined
  }

  private calculatePath(
    positions: Float32Array,
    indices: Uint32Array,
    start: number,
    end: number,
  ): Promise<Uint32Array> {
    const requestId = ++this.pathRequestId
    const worker = new Worker(new URL('../workers/geodesic.worker.ts', import.meta.url), { type: 'module' })
    this.pathWorker = worker
    return new Promise((resolve, reject) => {
      this.rejectPath = reject
      worker.onmessage = (event: MessageEvent<
        | { type: 'result'; requestId: number; path: ArrayBuffer }
        | { type: 'error'; requestId: number; message: string }
      >) => {
        const message = event.data
        if (message.requestId !== requestId) return
        this.finishPathCalculation(worker)
        if (message.type === 'error') reject(new Error(message.message))
        else resolve(new Uint32Array(message.path))
      }
      worker.onerror = () => {
        this.finishPathCalculation(worker)
        reject(new Error('Surface path worker crashed'))
      }
      worker.postMessage({
        type: 'compute', requestId, positions: positions.buffer, indices: indices.buffer, start, end,
      }, [positions.buffer, indices.buffer])
    })
  }

  private calculateOpening(
    positions: Float32Array,
    indices: Uint32Array,
    path: Uint32Array,
    maximumHalfWidth: number,
  ): Promise<PredictedOpening> {
    this.cancelCutCalculation()
    const requestId = ++this.cutRequestId
    const worker = new Worker(new URL('../workers/cut.worker.ts', import.meta.url), { type: 'module' })
    this.cutWorker = worker
    const transferablePath = new Uint32Array(path)
    return new Promise((resolve, reject) => {
      this.rejectCut = reject
      worker.onmessage = (event: MessageEvent<
        | {
          type: 'result'
          requestId: number
          positions: ArrayBuffer
          indices: ArrayBuffer
          leftBoundary: ArrayBuffer
          rightBoundary: ArrayBuffer
          affectedTriangles: ArrayBuffer
          newVertices: ArrayBuffer
          removedConstraints: ArrayBuffer
        }
        | { type: 'error'; requestId: number; message: string }
      >) => {
        const message = event.data
        if (message.requestId !== requestId) return
        this.finishCutCalculation(worker)
        if (message.type === 'error') {
          reject(new Error(message.message))
          return
        }
        resolve({
          positions: new Float32Array(message.positions),
          indices: new Uint32Array(message.indices),
          leftBoundary: new Uint32Array(message.leftBoundary),
          rightBoundary: new Uint32Array(message.rightBoundary),
          affectedTriangles: new Uint32Array(message.affectedTriangles),
          newVertices: new Uint32Array(message.newVertices),
          removedConstraints: new Uint32Array(message.removedConstraints),
        })
      }
      worker.onerror = () => {
        this.finishCutCalculation(worker)
        reject(new Error('Elastic incision worker crashed'))
      }
      worker.postMessage({
        type: 'open', requestId, positions: positions.buffer, indices: indices.buffer,
        path: transferablePath.buffer, maximumHalfWidth,
      }, [positions.buffer, indices.buffer, transferablePath.buffer])
    })
  }

  private finishPathCalculation(worker: Worker) {
    worker.terminate()
    if (this.pathWorker === worker) this.pathWorker = undefined
    this.rejectPath = undefined
  }

  private cancelPathCalculation() {
    this.pathRequestId++
    this.pathWorker?.terminate()
    this.pathWorker = undefined
    const reject = this.rejectPath
    this.rejectPath = undefined
    reject?.(new DOMException('Surface path calculation cancelled', 'AbortError'))
  }

  private finishCutCalculation(worker: Worker) {
    worker.terminate()
    if (this.cutWorker === worker) this.cutWorker = undefined
    this.rejectCut = undefined
  }

  private cancelCutCalculation() {
    this.cutRequestId++
    this.cutWorker?.terminate()
    this.cutWorker = undefined
    const reject = this.rejectCut
    this.rejectCut = undefined
    reject?.(new DOMException('Elastic incision calculation cancelled', 'AbortError'))
  }

  private ensureState(mesh: THREE.Mesh, positions: Float32Array, indices: Uint32Array) {
    let state = this.states.get(mesh)
    if (!state) {
      state = new ObjectSimulationState(positions, indices, 1)
      this.states.set(mesh, state)
    }
    return state
  }
}
