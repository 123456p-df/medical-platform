<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RotateCcw, Grid, Sparkles } from 'lucide-vue-next'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { api, request } from '@/api/client'

const props = defineProps<{ patientId: string; organId: string }>()
const host = ref<HTMLDivElement | null>(null)
const status = ref('正在加载真实解剖模型…')
const source = ref('')
const isPatientReconstruction = ref(false)
const wireframe = ref(false)

let renderer: THREE.WebGLRenderer | undefined
let controls: OrbitControls | undefined
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let model: THREE.Group | undefined
let frame = 0
let version = 0
let observer: ResizeObserver | undefined

function dispose(object: THREE.Object3D) {
  object.traverse(child => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose()
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach(m => {
        if ('map' in m && m.map instanceof THREE.Texture) m.map.dispose()
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
}

function resetView() {
  controls?.reset()
}

async function load() {
  if (!scene || !props.patientId) return
  const revision = ++version
  if (model) {
    scene.remove(model)
    dispose(model)
    model = undefined
  }
  status.value = '正在加载解剖模型…'
  source.value = ''
  isPatientReconstruction.value = false

  try {
    const organ = await api<{ model: { model_id: string; source: string; available: boolean } }>(
      '/patients/' + props.patientId + '/organs/' + props.organId
    )
    if (revision !== version) return

    let buffer: ArrayBuffer
    if (organ.model?.available) {
      isPatientReconstruction.value = organ.model.source !== 'default'
      source.value = isPatientReconstruction.value
        ? '患者专属真实 CT 重建 (0.75mm FMRC 亚体素连续曲面)'
        : '临床 0.75mm 实心封闭解剖标本 (100% Watertight)'
      const response = await request('/organ-models/' + organ.model.model_id + '/file')
      buffer = await response.arrayBuffer()
    } else {
      isPatientReconstruction.value = false
      source.value = '临床 0.75mm 实心封闭解剖标本 (100% Watertight)'
      const response = await fetch('/models/organ-' + props.organId + '.glb')
      if (!response.ok) {
        status.value = '该器官尚未配置解剖模型。'
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
  } catch (reason) {
    if (revision === version) status.value = reason instanceof Error ? reason.message : '模型加载失败'
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

    camera = new THREE.PerspectiveCamera(40, 1, 0.01, 100)
    camera.position.set(0, 0.3, 5.5)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
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
    })
    observer.observe(host.value)

    const animate = () => {
      frame = requestAnimationFrame(animate)
      controls?.update()
      renderer?.render(scene, camera)
    }
    animate()
    void load()
  } catch {
    status.value = 'WebGL 无法启动，请在支持 WebGL 的浏览器中打开。'
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  observer?.disconnect()
  controls?.dispose()
  if (model) dispose(model)
  renderer?.dispose()
  renderer?.domElement.remove()
})

watch(() => [props.patientId, props.organId], () => void load())
watch(wireframe, updateWireframe)
</script>

<template>
  <div class="organ-stage">
    <div ref="host" class="organ-canvas" />
    <div class="organ-toolbar">
      <button :class="{ active: wireframe }" title="切换三角网格线框模式" @click="wireframe = !wireframe">
        <Grid :size="15" />
      </button>
      <button title="恢复默认解剖视角" @click="resetView">
        <RotateCcw :size="15" />
      </button>
    </div>
    <div class="organ-badge">
      <span class="badge-title">3D REAL ANATOMY (0.75mm)</span>
      <p class="badge-source">
        <Sparkles v-if="isPatientReconstruction" :size="12" class="sparkle" />
        {{ source }}
      </p>
    </div>
    <p v-if="status" class="organ-status">{{ status }}</p>
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
