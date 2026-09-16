<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RotateCcw, Grid, Sparkles } from 'lucide-vue-next'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { request } from '@/api/client'
import { t } from '@/i18n'

type OrganModelInfo = { model_id: string; source: string; available: boolean }

const props = defineProps<{ organId: string; modelInfo: OrganModelInfo | null }>()
const host = ref<HTMLDivElement | null>(null)
const status = ref(t('ui.model.loadingReal'))
const source = ref('')
const isPatientReconstruction = ref(false)
const wireframe = ref(false)

let renderer: THREE.WebGLRenderer | undefined
let controls: OrbitControls | undefined
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let model: THREE.Group | undefined
let version = 0
let observer: ResizeObserver | undefined
let loadController: AbortController | undefined

function renderScene() {
  if (renderer && scene && camera) renderer.render(scene, camera)
}

function onContextLost(event: Event) {
  event.preventDefault()
  version++
  loadController?.abort()
  status.value = t('ui.model.contextLost')
}

function onContextRestored() {
  status.value = t('ui.model.contextRestored')
  void load()
}

function dispose(object: THREE.Object3D) {
  object.traverse(child => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose()
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach(m => {
        for (const value of Object.values(m)) {
          if (value instanceof THREE.Texture) value.dispose()
        }
        m.dispose()
      })
    }
  })
}

function updateWireframe() {
  if (!model) return
  model.traverse(child => {
    if (child instanceof THREE.Mesh) {
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach(m => {
        if (m instanceof THREE.MeshStandardMaterial) {
          m.wireframe = wireframe.value
          m.side = THREE.DoubleSide
        }
      })
    }
  })
  renderScene()
}

function resetView() {
  controls?.reset()
  renderScene()
}

async function load() {
  if (!scene) return
  const revision = ++version
  loadController?.abort()
  const controller = new AbortController()
  loadController = controller
  if (model) {
    scene.remove(model)
    dispose(model)
    model = undefined
  }
  status.value = t('ui.model.loadingModel')
  source.value = ''
  isPatientReconstruction.value = false
  renderScene()

  const organModel = props.modelInfo
  if (!organModel) return

  try {
    let buffer: ArrayBuffer
    if (organModel.available) {
      isPatientReconstruction.value = organModel.source !== 'default'
      source.value = isPatientReconstruction.value
        ? t('ui.model.patientReconstruction', { source: organModel.source })
        : t('ui.model.teachingModel')
      const response = await request('/organ-models/' + organModel.model_id + '/file', { signal: controller.signal })
      buffer = await response.arrayBuffer()
    } else {
      isPatientReconstruction.value = false
      source.value = t('ui.model.teachingModel')
      const response = await fetch('/models/organ-' + props.organId + '.glb', { signal: controller.signal })
      if (!response.ok) {
        status.value = t('ui.model.notConfigured')
        renderScene()
        return
      }
      buffer = await response.arrayBuffer()
    }

    const gltf = await new GLTFLoader().parseAsync(buffer, '')
    if (revision !== version) {
      dispose(gltf.scene)
      return
    }

    model = gltf.scene
    model.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.material.side = THREE.DoubleSide
        child.material.roughness = 0.40
      }
    })
    updateWireframe()

    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    model.position.sub(center)
    model.scale.setScalar(2.8 / Math.max(size.x, size.y, size.z, 0.00001))
    model.position.multiplyScalar(model.scale.x)

    scene.add(model)
    status.value = ''
    controls?.reset()
    renderScene()
  } catch (reason) {
    if (controller.signal.aborted) return
    if (revision === version) status.value = reason instanceof Error ? reason.message : t('ui.model.loadFailed')
    renderScene()
  }
}

onMounted(() => {
  if (!host.value) return
  try {
    scene = new THREE.Scene()
    scene.background = new THREE.Color('#f0f7f7')
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    host.value.appendChild(renderer.domElement)
    renderer.domElement.addEventListener('webglcontextlost', onContextLost)
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored)

    camera = new THREE.PerspectiveCamera(40, 1, 0.01, 100)
    camera.position.set(0, 0.3, 5.5)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = false
    controls.addEventListener('change', renderScene)
    controls.saveState()

    scene.add(new THREE.HemisphereLight(0xffffff, 0x79918f, 2.0))
    const key = new THREE.DirectionalLight(0xfff6ee, 3.0)
    key.position.set(3, 4, 5)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0xc1ebe5, 2.2)
    rim.position.set(-3, -2, -3)
    scene.add(rim)
    const fill = new THREE.DirectionalLight(0xffffff, 1.2)
    fill.position.set(0, -3, 2)
    scene.add(fill)

    observer = new ResizeObserver(() => {
      if (!host.value || !renderer) return
      const width = host.value.clientWidth
      const height = host.value.clientHeight
      renderer.setSize(width, height)
      camera.aspect = width / Math.max(height, 1)
      camera.updateProjectionMatrix()
      renderScene()
    })
    observer.observe(host.value)

    renderScene()
    void load()
  } catch {
    status.value = t('ui.model.webglUnavailable')
  }
})

onBeforeUnmount(() => {
  version++
  loadController?.abort()
  observer?.disconnect()
  controls?.removeEventListener('change', renderScene)
  controls?.dispose()
  if (model) dispose(model)
  scene?.clear()
  renderer?.domElement.removeEventListener('webglcontextlost', onContextLost)
  renderer?.domElement.removeEventListener('webglcontextrestored', onContextRestored)
  renderer?.dispose()
  renderer?.forceContextLoss()
  renderer?.domElement.remove()
})

watch(
  () => [props.organId, props.modelInfo?.model_id, props.modelInfo?.source, props.modelInfo?.available],
  () => void load(),
)
watch(wireframe, updateWireframe)
</script>

<template>
  <div class="organ-stage">
    <div ref="host" class="organ-canvas" />
    <div class="organ-toolbar">
      <button :class="{ active: wireframe }" :title="$t('ui.model.toggleWireframe')" @click="wireframe = !wireframe">
        <Grid :size="15" />
      </button>
      <button :title="$t('ui.model.resetView')" @click="resetView">
        <RotateCcw :size="15" />
      </button>
    </div>
    <div class="organ-badge">
      <span class="badge-title">{{ $t('ui.model.badge') }}</span>
      <p class="badge-source">
        <Sparkles v-if="isPatientReconstruction" :size="12" class="sparkle" />
        {{ source }}
      </p>
    </div>
    <p v-if="status" class="organ-status">{{ status }} <button v-if="status.includes($t('ui.model.failedWord'))" type="button" class="btn btn-sm btn-secondary" @click="load">{{ $t('Retry') }}</button></p>
  </div>
</template>

<style scoped>
.organ-stage {
  height: 480px;
  position: relative;
  overflow: hidden;
  background: radial-gradient(circle at 50% 45%, #ffffff 0%, #edf6f4 60%, #e1efec 100%);
  border-radius: 12px;
  border: 1px solid var(--border);
}
.organ-canvas {
  width: 100%;
  height: 100%;
  touch-action: none;
  cursor: grab;
}
.organ-canvas:active {
  cursor: grabbing;
}
.organ-toolbar {
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  gap: 8px;
  z-index: 2;
}
.organ-toolbar button {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(75, 140, 130, 0.25);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(6px);
  color: #2e4d48;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  transition: all 0.15s ease;
}
.organ-toolbar button:hover {
  background: #ffffff;
  color: #1b6059;
}
.organ-toolbar button.active {
  background: #236b66;
  color: #ffffff;
  border-color: #236b66;
}
.organ-badge {
  position: absolute;
  left: 16px;
  top: 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  pointer-events: none;
  z-index: 2;
}
.badge-title {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}
.badge-source {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #1a423e;
  display: flex;
  align-items: center;
  gap: 4px;
}
.sparkle {
  color: #10b981;
}
.organ-status {
  position: absolute;
  inset: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(240, 247, 247, 0.85);
  backdrop-filter: blur(4px);
  color: #2e5953;
  font-size: 13px;
  font-weight: 500;
}
</style>
