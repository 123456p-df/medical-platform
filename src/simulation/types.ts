export type Vec3Tuple = [number, number, number]
export type Vec4Tuple = [number, number, number, number]

export type PhysicsMode = 'SOFT_BODY' | 'KINEMATIC' | 'RIGID' | 'STATIC'
export type InteractionMode =
  | 'SELECT_FIRST_POINT'
  | 'SELECT_SECOND_POINT'
  | 'PREVIEW_CUT'
  | 'CUT_PENDING'
  | 'CUT_COMMITTED'
  | 'DRAG'

export type SimulationConnectionState =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'SYNCING'
  | 'CONNECTED'
  | 'DESYNC'
  | 'RECONNECTING'

export type SimulationResourceStatus =
  | 'PENDING'
  | 'SEGMENTING'
  | 'MESH_PROCESSING'
  | 'READY'
  | 'FAILED'

export interface SimulationMaterial {
  color: string
  opacity?: number
  roughness?: number
  metalness?: number
  doubleSided?: boolean
}

export interface SimulationTransform {
  position?: Vec3Tuple
  rotation?: Vec3Tuple
  scale?: Vec3Tuple
}

export interface SimulationStructure {
  id: string
  name: string
  type: string
  labelId?: number | null
  visualMesh: string
  physicsMesh?: string | null
  binding?: string | null
  nodeNames?: string[]
  deformable: boolean
  visible: boolean
  physicsMode: PhysicsMode
  materialProfile?: string | null
  material: SimulationMaterial
  transform?: SimulationTransform
  metadata: Record<string, unknown>
}

export interface SimulationManifest {
  schemaVersion: '1.0'
  id: string
  caseId: string
  name: string
  coordinateSystem: 'GLTF_Y_UP'
  units: 'meter'
  structures: SimulationStructure[]
  metadata: Record<string, unknown>
  sourceToSimulation?: number[]
}

export interface SurfacePoint {
  structureId: string
  meshId: string
  triangleId: number
  barycentric: Vec3Tuple
  worldPosition: Vec3Tuple
  localPosition: Vec3Tuple
  vertexId: number
}

export interface CutResult {
  leftBoundary: Uint32Array
  rightBoundary: Uint32Array
  affectedTriangles: Uint32Array
  newVertices: Uint32Array
  removedConstraints: Uint32Array
}

export interface SimulationDebugOptions {
  showVisualMesh: boolean
  showPhysicsMesh: boolean
  showTetrahedra: boolean
  showBVH: boolean
  showCutPath: boolean
  showCutBoundary: boolean
  showConstraintPoints: boolean
  showPrediction: boolean
  showAuthoritative: boolean
  showPredictionError: boolean
  showFPS: boolean
  showPhysicsStepTime: boolean
  showSOFATickRate: boolean
  showNetworkRTT: boolean
  showSOFATime: boolean
}

export interface PhysicsBinaryHeader {
  version: number
  positions: Float32Array
  tetrahedra: Uint32Array
  surfaceTriangles: Uint32Array
  visualTetIds: Uint32Array
  visualWeights: Float32Array
}

export interface SimulationPacketMeta {
  sessionId: string
  objectId: string
  sequenceNumber: number
  simulationTick: number
  topologyVersion: number
}

export interface VisualPhysicsBinding {
  tetId: number
  weights: Vec4Tuple
}
