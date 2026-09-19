<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Crosshair, Eye, EyeOff, Focus, RotateCcw, Scissors, Undo2 } from 'lucide-vue-next'
import { loadSimulationManifest } from '@/api/simulations'
import { useSimulationStore } from '@/stores/simulation'
import { SceneManager } from '@/simulation/core/SceneManager'
import { ModelManager } from '@/simulation/core/ModelManager'
import { CutManager } from '@/simulation/cutting/CutManager'
import { PhysicsManager } from '@/simulation/deformation/PhysicsManager'
import { InteractionManager } from '@/simulation/interaction/InteractionManager'
import { t } from '@/i18n'

const DEMO_MANIFEST = '/simulation/demo/manifest.json'
const CT_MANIFEST = '/simulation/tcga-zf-aa5n/manifest.json'
const store = useSimulationStore()
const host = ref<HTMLDivElement | null>(null)
const message = ref(t('ui.simulation.instructions'))
const previewReady = ref(false)
const abortController = new AbortController()
let sceneManager: SceneManager | undefined
let modelManager: ModelManager | undefined
let cutManager: CutManager | undefined
let physicsManager: PhysicsManager | undefined
let interactionManager: InteractionManager | undefined

const canCut = computed(() => store.interactionMode === 'PREVIEW_CUT' && previewReady.value)
const isDev = import.meta.env.DEV
const modeLabel = computed(() => ({
  SELECT_FIRST_POINT: t('ui.simulation.selectA'),
  SELECT_SECOND_POINT: t('ui.simulation.selectB'),
  PREVIEW_CUT: t('ui.simulation.previewCut'),
  CUT_PENDING: t('ui.simulation.cutPending'),
  CUT_COMMITTED: t('ui.simulation.cutCommitted'),
  DRAG: t('ui.simulation.dragBoundary'),
}[store.interactionMode]))

async function initialize() {
  if (!host.value) return
  store.beginLoad('teaching-human-demo')
  store.resetInteraction()
  try {
    let manifest: Awaited<ReturnType<typeof loadSimulationManifest>>
    try {
      manifest = await loadSimulationManifest(CT_MANIFEST, abortController.signal)
    } catch (reason) {
      if (abortController.signal.aborted) throw reason
      manifest = await loadSimulationManifest(DEMO_MANIFEST, abortController.signal)
    }
    store.currentCase = manifest.caseId
    store.setManifest(manifest)
    await nextTick()
    if (!host.value) return
    sceneManager = new SceneManager(host.value)
    modelManager = new ModelManager(sceneManager.scene)
    cutManager = new CutManager()
    physicsManager = new PhysicsManager()
    physicsManager.onStep = milliseconds => { store.physicsStepTime = milliseconds }
    interactionManager = new InteractionManager(
      sceneManager,
      modelManager,
      cutManager,
      physicsManager,
      {
        modeChanged: mode => { store.interactionMode = mode },
        pointChanged: (label, point) => {
          previewReady.value = false
          store.setPoint(label, point)
          message.value = label === 'A' ? t('ui.simulation.pointASelected') : t('ui.simulation.pathReady')
        },
        structureSelected: id => selectStructure(id),
        previewReady: count => {
          previewReady.value = true
          message.value = t('ui.simulation.previewVertices', { count })
        },
        predictedOpeningReady: cut => {
          message.value = t('ui.simulation.predictedOpeningReady', { count: cut.result.leftBoundary.length })
        },
        error: error => { message.value = error },
      },
    )
    sceneManager.setStatsListener(stats => { store.fps = stats.fps })
    const bounds = await modelManager.load(manifest, (completed, total) => {
      store.loadProgress = Math.round(completed / total * 100)
    })
    modelManager.setBodyOpacity(store.bodyOpacity)
    sceneManager.fitTo(bounds)
    applyDebugVisibility()
    store.loadState = 'READY'
  } catch (reason) {
    if (abortController.signal.aborted) return
    store.fail(reason instanceof Error ? reason.message : '3D simulation failed to initialize')
  }
}

function selectStructure(id: string) {
  store.selectedOrgan = id
  modelManager?.setSelected(id)
}

function setVisible(id: string, visible: boolean) {
  store.organVisibility[id] = visible
  modelManager?.setVisible(id, visible)
}

function toggleIsolate() {
  store.isolateSelected = !store.isolateSelected
  modelManager?.isolate(store.isolateSelected ? store.selectedOrgan : null)
}

function applyCut() {
  interactionManager?.commitPredictedOpening(store.cutDepthPercent)
}

async function resetSimulation() {
  if (!store.manifest || !modelManager || !sceneManager) return
  interactionManager?.reset()
  previewReady.value = false
  store.resetInteraction()
  store.selectedOrgan = null
  store.isolateSelected = false
  message.value = t('ui.simulation.resetComplete')
  store.loadState = 'LOADING'
  const bounds = await modelManager.load(store.manifest, (completed, total) => {
    store.loadProgress = Math.round(completed / total * 100)
  })
  modelManager.setBodyOpacity(store.bodyOpacity)
  sceneManager.fitTo(bounds)
  store.loadState = 'READY'
}

function applyDebugVisibility() {
  cutManager?.setDebugVisibility({
    path: store.debug.showCutPath,
    boundary: store.debug.showCutBoundary,
    controls: store.debug.showConstraintPoints,
  })
}

watch(() => store.bodyOpacity, opacity => modelManager?.setBodyOpacity(opacity))
watch(() => store.debug, applyDebugVisibility, { deep: true })

onMounted(initialize)
onBeforeUnmount(() => {
  abortController.abort()
  interactionManager?.dispose()
  cutManager?.clear()
  modelManager?.dispose()
  sceneManager?.dispose()
})
</script>

<template>
  <section class="simulation-page" aria-label="Surgery simulation teaching module">
    <header class="simulation-header">
      <div>
        <span class="eyebrow">RESEARCH / TEACHING DEMO</span>
        <h2>{{ $t('ui.simulation.title') }}</h2>
        <p>{{ $t('ui.simulation.disclaimer') }}</p>
      </div>
      <div class="header-actions">
        <button type="button" class="tool-button" @click="sceneManager?.resetCamera()"><RotateCcw :size="16" />{{ $t('ui.simulation.resetCamera') }}</button>
        <button type="button" class="tool-button" @click="resetSimulation"><Undo2 :size="16" />{{ $t('ui.simulation.reset') }}</button>
        <button type="button" class="cut-button" :disabled="!canCut" @click="applyCut"><Scissors :size="16" />{{ $t('ui.simulation.previewOpening') }}</button>
      </div>
    </header>

    <div class="simulation-layout">
      <div class="viewport-card">
        <div class="viewport-toolbar">
          <span class="mode"><Crosshair :size="15" />{{ modeLabel }}</span>
          <span class="runtime-badge prediction">{{ $t('ui.simulation.predictionOnly') }}</span>
          <span class="runtime-badge">{{ store.connectionState }} · topology v{{ store.topologyVersion }}</span>
          <label>{{ $t('ui.simulation.bodyOpacity') }} <input v-model.number="store.bodyOpacity" type="range" min="0.08" max="1" step="0.02"></label>
          <span v-if="store.debug.showFPS" class="metric">{{ store.fps.toFixed(0) }} FPS</span>
          <span v-if="store.debug.showPhysicsStepTime" class="metric">Worker {{ store.physicsStepTime.toFixed(2) }} ms</span>
        </div>
        <div ref="host" class="simulation-canvas" />
        <div v-if="store.loadState === 'LOADING'" class="viewport-state">{{ $t('ui.simulation.loading') }} {{ store.loadProgress }}%</div>
        <div v-else-if="store.loadState === 'ERROR'" class="viewport-state error">{{ store.error }}</div>
        <div class="interaction-hint">{{ message }}</div>
      </div>

      <aside class="simulation-panel">
        <section>
          <div class="panel-heading"><h3>{{ $t('ui.simulation.structures') }}</h3><span>{{ store.structures.length }}</span></div>
          <button
            v-for="structure in store.structures"
            :key="structure.id"
            type="button"
            class="structure-row"
            :class="{ selected: store.selectedOrgan === structure.id }"
            @click="selectStructure(structure.id)"
          >
            <span class="color-dot" :style="{ background: structure.material.color }" />
            <span><strong>{{ structure.name }}</strong><small>{{ structure.type }} · {{ structure.physicsMode }}</small></span>
            <span class="visibility" @click.stop="setVisible(structure.id, !store.organVisibility[structure.id])">
              <Eye v-if="store.organVisibility[structure.id]" :size="16" /><EyeOff v-else :size="16" />
            </span>
          </button>
          <button type="button" class="panel-action" :disabled="!store.selectedOrgan" @click="toggleIsolate">
            <Focus :size="15" />{{ store.isolateSelected ? $t('ui.simulation.showAll') : $t('ui.simulation.isolate') }}
          </button>
        </section>

        <section class="point-data">
          <div class="panel-heading"><h3>{{ $t('ui.simulation.incisionData') }}</h3><span>{{ store.interactionMode }}</span></div>
          <label class="depth-control">
            <span>{{ $t('ui.simulation.cutDepth') }}</span>
            <strong>{{ store.cutDepthPercent }}%</strong>
            <input v-model.number="store.cutDepthPercent" type="range" min="5" max="100" step="5">
            <small>{{ $t('ui.simulation.cutDepthHint') }}</small>
          </label>
          <dl>
            <div><dt>{{ $t('ui.simulation.pointA') }}</dt><dd>{{ store.selectedPointA ? `triangle ${store.selectedPointA.triangleId}` : '—' }}</dd></div>
            <div><dt>{{ $t('ui.simulation.pointB') }}</dt><dd>{{ store.selectedPointB ? `triangle ${store.selectedPointB.triangleId}` : '—' }}</dd></div>
            <div><dt>{{ $t('ui.simulation.deformation') }}</dt><dd>{{ $t('ui.simulation.kinematicWorker') }}</dd></div>
            <div><dt>{{ $t('ui.simulation.acceleration') }}</dt><dd>{{ $t('ui.simulation.bvh') }}</dd></div>
          </dl>
        </section>

        <details v-if="isDev" class="debug-panel">
          <summary>{{ $t('ui.simulation.debug') }}</summary>
          <label><input v-model="store.debug.showCutPath" type="checkbox">{{ $t('ui.simulation.cutPath') }}</label>
          <label><input v-model="store.debug.showCutBoundary" type="checkbox">{{ $t('ui.simulation.cutBoundaries') }}</label>
          <label><input v-model="store.debug.showConstraintPoints" type="checkbox">{{ $t('ui.simulation.constraintPoints') }}</label>
          <label><input v-model="store.debug.showPrediction" type="checkbox">{{ $t('ui.simulation.showPrediction') }}</label>
          <label><input v-model="store.debug.showAuthoritative" type="checkbox" disabled>{{ $t('ui.simulation.showAuthoritative') }}</label>
          <label><input v-model="store.debug.showPredictionError" type="checkbox" disabled>{{ $t('ui.simulation.showPredictionError') }}</label>
          <label><input v-model="store.debug.showFPS" type="checkbox">{{ $t('ui.simulation.fps') }}</label>
          <label><input v-model="store.debug.showPhysicsStepTime" type="checkbox">{{ $t('ui.simulation.workerStep') }}</label>
          <small>{{ $t('ui.simulation.phase2Debug') }}</small>
        </details>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.depth-control{display:grid;grid-template-columns:1fr auto;gap:5px 8px;margin-bottom:12px;padding:9px;border-radius:8px;background:#f2f8f8;color:#526d73;font-size:10px}.depth-control strong{color:#b44753}.depth-control input{grid-column:1/-1;width:100%;accent-color:#bd4e59}.depth-control small{grid-column:1/-1;color:#859a9f;line-height:1.4}
.simulation-page{display:grid;gap:14px}.simulation-header{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:18px 20px;border:1px solid #1d353c;border-radius:14px;background:linear-gradient(120deg,#0b2026,#102d34);color:#f4fbfc}.eyebrow{color:#68d7e5;font-size:9px;font-weight:800;letter-spacing:.16em}.simulation-header h2{margin:5px 0 4px;font-size:21px}.simulation-header p{max-width:720px;margin:0;color:#a9c0c6;font-size:11px}.header-actions{display:flex;flex-wrap:wrap;gap:8px}.tool-button,.cut-button,.panel-action{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:36px;padding:8px 12px;border:1px solid #31505a;border-radius:8px;background:#16343c;color:#dbecef;font-size:12px}.cut-button{border-color:#e66f79;background:#bd4e59;color:#fff}.cut-button:disabled,.panel-action:disabled{cursor:not-allowed;opacity:.42}.simulation-layout{display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:14px;min-height:680px}.viewport-card{position:relative;overflow:hidden;border:1px solid #1d353c;border-radius:14px;background:#071418}.viewport-toolbar{display:flex;min-height:44px;align-items:center;gap:10px;padding:7px 12px;border-bottom:1px solid #1d353c;background:#0d2329;color:#bad0d5;font-size:11px}.viewport-toolbar label{display:flex;align-items:center;gap:8px}.viewport-toolbar input{width:110px;accent-color:#5fd2df}.mode{display:flex;align-items:center;gap:6px;color:#70d9e5;font-weight:750}.runtime-badge{padding:3px 6px;border:1px solid #34515a;border-radius:999px;color:#91aeb5;font-size:8px}.runtime-badge.prediction{border-color:#8c6d37;background:#3c321e;color:#f2ca79}.metric{margin-left:auto;color:#87a8b0;font-variant-numeric:tabular-nums}.metric+.metric{margin-left:0}.simulation-canvas{height:624px;touch-action:none}.viewport-state{position:absolute;inset:44px 0 39px;display:grid;place-items:center;background:#071418e8;color:#c6dce1}.viewport-state.error{color:#ff9ca5}.interaction-hint{position:absolute;right:12px;bottom:11px;left:12px;padding:8px 11px;border:1px solid #2c4c55;border-radius:8px;background:#08191fe8;color:#b9d2d7;font-size:11px;pointer-events:none}.simulation-panel{display:flex;flex-direction:column;gap:12px}.simulation-panel>section,.debug-panel{padding:13px;border:1px solid #d7e4e5;border-radius:12px;background:#fff}.panel-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px}.panel-heading h3{margin:0;font-size:12px}.panel-heading span{color:#6e8a91;font-size:9px;overflow-wrap:anywhere}.structure-row{display:grid;width:100%;grid-template-columns:10px 1fr 24px;align-items:center;gap:9px;padding:8px 6px;border:0;border-bottom:1px solid #edf2f2;background:transparent;color:#294248;text-align:left}.structure-row.selected{border-radius:7px;background:#e7f6f7}.color-dot{width:8px;height:8px;border-radius:50%}.structure-row strong,.structure-row small{display:block}.structure-row strong{font-size:11px}.structure-row small{margin-top:2px;color:#84999e;font-size:8px}.visibility{display:grid;place-items:center;color:#617e84}.panel-action{width:100%;margin-top:10px;border-color:#bdd9dc;background:#eff8f8;color:#236f78}.point-data dl{display:grid;gap:7px;margin:0}.point-data dl>div{display:flex;justify-content:space-between;gap:8px}.point-data dt,.point-data dd{margin:0;font-size:9px}.point-data dt{color:#71878c}.point-data dd{max-width:170px;color:#294248;text-align:right;overflow-wrap:anywhere}.debug-panel summary{margin-bottom:9px;color:#2e5961;font-size:11px;font-weight:700}.debug-panel label{display:flex;align-items:center;gap:7px;margin:6px 0;color:#526d73;font-size:10px}.debug-panel small{display:block;margin-top:9px;color:#859a9f;font-size:9px;line-height:1.5}@media(max-width:1000px){.simulation-header{align-items:flex-start;flex-direction:column}.simulation-layout{grid-template-columns:1fr}.simulation-panel{display:grid;grid-template-columns:1fr 1fr}.simulation-canvas{height:520px}}@media(max-width:650px){.simulation-panel{grid-template-columns:1fr}.viewport-toolbar{flex-wrap:wrap}.simulation-canvas{height:430px}}
</style>
