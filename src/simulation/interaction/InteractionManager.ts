import * as THREE from 'three'
import type { Intersection } from 'three'
import type { InteractionMode, SurfacePoint } from '../types'
import type { ModelManager } from '../core/ModelManager'
import type { SceneManager } from '../core/SceneManager'
import type { CutManager, AppliedCut } from '../cutting/CutManager'
import type { PhysicsManager } from '../deformation/PhysicsManager'
import { vertexFromBarycentric } from '../cutting/graph'
import { IncisionStateMachine } from './stateMachine'

export interface InteractionEvents {
  modeChanged: (mode: InteractionMode) => void
  pointChanged: (label: 'A' | 'B', point: SurfacePoint) => void
  structureSelected: (structureId: string) => void
  previewReady: (pathVertices: number) => void
  predictedOpeningReady: (cut: AppliedCut) => void
  error: (message: string) => void
}

export class InteractionManager {
  private readonly state = new IncisionStateMachine()
  private readonly raycaster = new THREE.Raycaster()
  private readonly dragPlane = new THREE.Plane()
  private pointerStart?: THREE.Vector2
  private dragControl?: THREE.Mesh
  private dragMesh?: THREE.Mesh
  private disposed = false

  constructor(
    private readonly scene: SceneManager,
    private readonly models: ModelManager,
    private readonly cuts: CutManager,
    private readonly physics: PhysicsManager,
    private readonly events: InteractionEvents,
  ) {
    const canvas = this.scene.renderer.domElement
    canvas.addEventListener('pointerdown', this.onPointerDown)
    canvas.addEventListener('pointermove', this.onPointerMove)
    canvas.addEventListener('pointerup', this.onPointerUp)
    canvas.addEventListener('pointercancel', this.onPointerUp)
    this.physics.setGeometryListener(mesh => {
      this.cuts.acceptPredictedGeometry(mesh)
      this.cuts.updateControlPositions(mesh)
    })
    this.physics.onError = message => this.events.error(message)
  }

  async commitPredictedOpening(depthPercent: number) {
    try {
      this.state.beginCut()
      this.events.modeChanged(this.state.mode)
      const result = await this.cuts.commitPrediction(depthPercent)
      this.state.completePrediction()
      this.events.modeChanged(this.state.mode)
      this.events.predictedOpeningReady(result)
      return result
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === 'AbortError') return null
      this.state.failPrediction()
      this.events.modeChanged(this.state.mode)
      this.events.error(reason instanceof Error ? reason.message : 'Unable to apply incision')
      return null
    }
  }

  reset() {
    this.physics.endDrag()
    this.cuts.clear()
    this.state.reset()
    this.events.modeChanged(this.state.mode)
  }

  dispose() {
    this.disposed = true
    const canvas = this.scene.renderer.domElement
    canvas.removeEventListener('pointerdown', this.onPointerDown)
    canvas.removeEventListener('pointermove', this.onPointerMove)
    canvas.removeEventListener('pointerup', this.onPointerUp)
    canvas.removeEventListener('pointercancel', this.onPointerUp)
    this.physics.dispose()
  }

  private pointer(event: PointerEvent) {
    const rect = this.scene.renderer.domElement.getBoundingClientRect()
    return new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    )
  }

  private hits(event: PointerEvent, objects: THREE.Object3D[]) {
    this.raycaster.setFromCamera(this.pointer(event), this.scene.camera)
    ;(this.raycaster as THREE.Raycaster & { firstHitOnly?: boolean }).firstHitOnly = true
    return this.raycaster.intersectObjects(objects, false)
  }

  private onPointerDown = (event: PointerEvent) => {
    if (this.disposed || event.button !== 0) return
    this.pointerStart = new THREE.Vector2(event.clientX, event.clientY)
    if (this.state.mode !== 'DRAG') return
    const controlHit = this.hits(event, this.cuts.getControlMeshes())[0]
    if (!controlHit) return
    const control = controlHit.object as THREE.Mesh
    const mesh = control.userData.targetMesh as THREE.Mesh
    const world = control.getWorldPosition(new THREE.Vector3())
    const normal = this.scene.camera.getWorldDirection(new THREE.Vector3())
    this.dragPlane.setFromNormalAndCoplanarPoint(normal, world)
    this.dragControl = control
    this.dragMesh = mesh
    const radius = Math.min(0.18, Math.max(0.04, mesh.geometry.boundingSphere?.radius ? mesh.geometry.boundingSphere.radius * 0.08 : 0.1))
    this.physics.beginDrag(mesh, Number(control.userData.vertexId), radius)
    this.scene.setInteractionLocked(true)
    this.scene.renderer.domElement.setPointerCapture(event.pointerId)
    event.preventDefault()
  }

  private onPointerMove = (event: PointerEvent) => {
    if (!this.dragControl || !this.dragMesh) return
    this.raycaster.setFromCamera(this.pointer(event), this.scene.camera)
    const worldTarget = this.raycaster.ray.intersectPlane(this.dragPlane, new THREE.Vector3())
    if (!worldTarget) return
    const localTarget = this.dragMesh.worldToLocal(worldTarget.clone())
    this.physics.updateDrag(localTarget)
    event.preventDefault()
  }

  private onPointerUp = (event: PointerEvent) => {
    if (event.button !== 0 || !this.pointerStart) return
    const draggedControl = Boolean(this.dragControl)
    if (draggedControl) {
      this.physics.endDrag()
      this.dragControl = undefined
      this.dragMesh = undefined
      this.scene.setInteractionLocked(false)
      if (this.scene.renderer.domElement.hasPointerCapture(event.pointerId)) {
        this.scene.renderer.domElement.releasePointerCapture(event.pointerId)
      }
    }
    const moved = this.pointerStart.distanceTo(new THREE.Vector2(event.clientX, event.clientY)) > 5
    this.pointerStart = undefined
    if (draggedControl || moved) return
    void this.handleClick(event)
  }

  private async handleClick(event: PointerEvent) {
    if (['PREVIEW_CUT', 'CUT_PENDING', 'CUT_COMMITTED'].includes(this.state.mode)) return
    if (event.altKey) {
      const organHit = this.hits(event, this.models.getPickableMeshes().filter(mesh => mesh.userData.structureType !== 'body'))[0]
      if (organHit) this.events.structureSelected(String(organHit.object.userData.structureId))
      return
    }
    const surfaceHit = this.hits(event, this.models.getPickableMeshes())[0]
    if (!surfaceHit) return
    const mesh = surfaceHit.object as THREE.Mesh
    const structureId = String(mesh.userData.structureId)
    this.events.structureSelected(structureId)
    if (!mesh.userData.deformable) {
      this.events.error('The selected structure is static and cannot be incised')
      return
    }
    try {
      const point = this.surfacePoint(surfaceHit)
      const label = this.state.mode === 'SELECT_SECOND_POINT' ? 'B' : 'A'
      const nextMode = this.state.select(point)
      this.cuts.markPoint(mesh, new THREE.Vector3().fromArray(point.localPosition), label)
      this.events.pointChanged(label, point)
      this.events.modeChanged(this.state.mode)
      if (nextMode === 'PREVIEW_CUT' && this.state.pointA && this.state.pointB) {
        const path = await this.cuts.preview(
          mesh,
          this.state.pointA.vertexId,
          this.state.pointB.vertexId,
        )
        this.events.previewReady(path.length)
      }
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === 'AbortError') return
      this.events.error(reason instanceof Error ? reason.message : 'Surface selection failed')
    }
  }

  private surfacePoint(hit: Intersection): SurfacePoint {
    const mesh = hit.object as THREE.Mesh
    const triangleId = hit.faceIndex
    if (triangleId === undefined || triangleId === null || !mesh.geometry.index) {
      throw new Error('Selected mesh does not expose indexed triangle topology')
    }
    const index = mesh.geometry.index
    const position = mesh.geometry.getAttribute('position')
    const offset = triangleId * 3
    const a = index.getX(offset)
    const b = index.getX(offset + 1)
    const c = index.getX(offset + 2)
    const local = mesh.worldToLocal(hit.point.clone())
    const barycentric = THREE.Triangle.getBarycoord(
      local,
      new THREE.Vector3().fromBufferAttribute(position, a),
      new THREE.Vector3().fromBufferAttribute(position, b),
      new THREE.Vector3().fromBufferAttribute(position, c),
      new THREE.Vector3(),
    )
    if (!barycentric) throw new Error('Unable to calculate barycentric surface coordinates')
    const packedIndex = new Uint32Array(index.array)
    const barycentricTuple: [number, number, number] = [barycentric.x, barycentric.y, barycentric.z]
    return {
      structureId: String(mesh.userData.structureId),
      meshId: mesh.uuid,
      triangleId,
      barycentric: barycentricTuple,
      worldPosition: [hit.point.x, hit.point.y, hit.point.z],
      localPosition: [local.x, local.y, local.z],
      vertexId: vertexFromBarycentric(packedIndex, triangleId, barycentricTuple),
    }
  }
}
