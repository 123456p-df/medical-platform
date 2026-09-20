import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  InteractionMode,
  PhysicsMode,
  SimulationConnectionState,
  SimulationDebugOptions,
  SimulationManifest,
  SurfacePoint,
} from '@/simulation/types'

export type SimulationLoadState = 'IDLE' | 'LOADING' | 'READY' | 'ERROR'

const defaultDebug = (): SimulationDebugOptions => ({
  showVisualMesh: true,
  showPhysicsMesh: false,
  showTetrahedra: false,
  showBVH: false,
  showCutPath: true,
  showCutBoundary: true,
  showConstraintPoints: true,
  showPrediction: true,
  showAuthoritative: false,
  showPredictionError: false,
  showFPS: true,
  showPhysicsStepTime: true,
  showSOFATickRate: false,
  showNetworkRTT: false,
  showSOFATime: false,
})

export const useSimulationStore = defineStore('simulation', () => {
  const currentCase = ref<string | null>(null)
  const manifest = ref<SimulationManifest | null>(null)
  const loadState = ref<SimulationLoadState>('IDLE')
  const loadProgress = ref(0)
  const error = ref('')
  const selectedOrgan = ref<string | null>(null)
  const selectedPointA = ref<SurfacePoint | null>(null)
  const selectedPointB = ref<SurfacePoint | null>(null)
  const interactionMode = ref<InteractionMode>('SELECT_FIRST_POINT')
  const physicsEnabled = ref(true)
  const physicsMode = ref<PhysicsMode>('KINEMATIC')
  const sessionId = ref<string | null>(null)
  const connectionState = ref<SimulationConnectionState>('DISCONNECTED')
  const simulationStatus = ref<'PREDICTION_ONLY' | 'AUTHORITATIVE'>('PREDICTION_ONLY')
  const topologyVersion = ref(1)
  const bodyOpacity = ref(0.3)
  const cutDepthPercent = ref(35)
  const organVisibility = ref<Record<string, boolean>>({})
  const isolateSelected = ref(false)
  const debug = ref<SimulationDebugOptions>(defaultDebug())
  const fps = ref(0)
  const physicsStepTime = ref(0)
  const predictionError = ref(0)
  const sofaTickRate = ref(0)
  const networkRtt = ref(0)
  const sofaStepTime = ref(0)

  const structures = computed(() => manifest.value?.structures ?? [])

  function beginLoad(caseId: string) {
    currentCase.value = caseId
    loadState.value = 'LOADING'
    loadProgress.value = 0
    error.value = ''
  }

  function setManifest(value: SimulationManifest) {
    manifest.value = value
    organVisibility.value = Object.fromEntries(value.structures.map(structure => [structure.id, structure.visible]))
    bodyOpacity.value = value.structures.find(structure => structure.type === 'body')?.material.opacity ?? 0.3
  }

  function setPoint(label: 'A' | 'B', point: SurfacePoint) {
    if (label === 'A') selectedPointA.value = point
    else selectedPointB.value = point
  }

  function resetInteraction() {
    selectedPointA.value = null
    selectedPointB.value = null
    interactionMode.value = 'SELECT_FIRST_POINT'
    physicsStepTime.value = 0
  }

  function fail(message: string) {
    loadState.value = 'ERROR'
    error.value = message
  }

  return {
    currentCase, manifest, loadState, loadProgress, error, selectedOrgan,
    selectedPointA, selectedPointB, interactionMode, physicsEnabled, physicsMode,
    sessionId, connectionState, simulationStatus, topologyVersion,
    bodyOpacity, cutDepthPercent, organVisibility, isolateSelected, debug, fps, physicsStepTime,
    predictionError, sofaTickRate, networkRtt, sofaStepTime, structures,
    beginLoad, setManifest, setPoint, resetInteraction, fail,
  }
})
