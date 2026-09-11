<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { SliceAxis } from '@/utils/volumePixels'
import {
  SLICE_AXES,
  affineFromSpacing,
  rasToGltf,
  voxelToRas,
} from '@/utils/sliceAxes'
import { viewerApi } from '@/api/viewer'

const props = withDefaults(
  defineProps<{
    modelId?: string | null
    visibleNames: string[]
    axis: SliceAxis
    sliceIndex: number
    shape: [number, number, number]
    spacing?: [number, number, number] | null
    affine?: number[][] | null
    status?: string
  }>(),
  { modelId: null, spacing: null, affine: null, status: '' },
)

const emit = defineEmits<{
  selectLabel: [labelId: number]
  loaded: []
}>()

const host = ref<HTMLDivElement | null>(null)
const progress = ref('')
let renderer: THREE.WebGLRenderer | undefined
let scene: THREE.Scene | undefined
let camera: THREE.PerspectiveCamera | undefined
let controls: OrbitControls | undefined
let model: THREE.Group | undefined
let plane: THREE.Mesh | undefined
let keyLight: THREE.DirectionalLight | undefined
let pmrem: THREE.PMREMGenerator | undefined
let observer: ResizeObserver | undefined
let frame = 0
let version = 0
let pointerDown: { x: number; y: number } | null = null
const meshes = new Map<string, THREE.Mesh[]>()

const planeColors: Record<SliceAxis, number> = {
  axial: 0x4ba3a6,
  coronal: 0x527bbf,
  sagittal: 0xc5862f,
}

const PBR_HINTS: { test: RegExp; color: number; roughness: number; metalness: number }[] = [
  { test: /rib|vertebra|skull|sternum|sacrum|hip|femur|humerus|scapula|clavicula|bone/i, color: 0xe6e0d2, roughness: 0.62, metalness: 0.04 },
  { test: /lung/i, color: 0x82b4cd, roughness: 0.5, metalness: 0.0 },
  { test: /heart|atrial|appendage/i, color: 0xbe2832, roughness: 0.35, metalness: 0.02 },
  { test: /aorta|artery|carotid|subclavian|brachiocephalic/i, color: 0xe12323, roughness: 0.28, metalness: 0.04 },
  { test: /vein|vena|cava/i, color: 0x236edc, roughness: 0.32, metalness: 0.04 },
  { test: /liver/i, color: 0xaf4b41, roughness: 0.38, metalness: 0.0 },
  { test: /spleen/i, color: 0x8c376e, roughness: 0.35, metalness: 0.0 },
  { test: /kidney/i, color: 0x9b2a2a, roughness: 0.35, metalness: 0.0 },
  { test: /iliopsoas|autochthon|gluteus|muscle/i, color: 0xaa4646, roughness: 0.55, metalness: 0.0 },
  { test: /costal|cartilage/i, color: 0xb9dce6, roughness: 0.32, metalness: 0.0 },
]

function styleMesh(mesh: THREE.Mesh, name: string) {
  const hint = PBR_HINTS.find((item) => item.test.test(name))
  const material = new THREE.MeshStandardMaterial({
    color: hint?.color ?? 0xb47878,
    roughness: hint?.roughness ?? 0.42,
    metalness: hint?.metalness ?? 0.02,
    envMapIntensity: 0.85,
    side: THREE.DoubleSide,
  })
  const previous = mesh.material
  mesh.material = material
  if (Array.isArray(previous)) previous.forEach((item) => item.dispose())
  else previous.dispose()
}

function currentAffine() {
  if (props.affine && props.affine.length >= 3 && props.affine[0].length >= 3) {
    const rows = props.affine.map((row) => [...row])
    if (rows[0].length < 4) {
      rows[0].push(0)
      rows[1].push(0)
      rows[2].push(0)
    }
    return rows
  }
  return affineFromSpacing(props.spacing && props.spacing[0] > 0 ? props.spacing : [1, 1, 1])
}

function voxelGltf(i: number, j: number, k: number) {
  return rasToGltf(voxelToRas(i, j, k, currentAffine()))
}

function applyVisibility() {
  const allowed = new Set(props.visibleNames)
  meshes.forEach((list, name) => {
    const visible = allowed.size === 0 ? false : allowed.has(name)
    list.forEach((mesh) => { mesh.visible = visible })
  })
}

function updatePlane() {
  if (!plane) return
  const spec = SLICE_AXES[props.axis]
  const size = props.shape
  const index = Math.max(0, Math.min(size[spec.layer] - 1, props.sliceIndex))
  const u0 = spec.flipU ? size[spec.u] - 1 : 0
  const u1 = spec.flipU ? 0 : size[spec.u] - 1
  const v0 = spec.flipV ? size[spec.v] - 1 : 0
  const v1 = spec.flipV ? 0 : size[spec.v] - 1
  const voxel = (u: number, v: number): [number, number, number] => {
    const ijk: [number, number, number] = [0, 0, 0]
    ijk[spec.layer] = index
    ijk[spec.u] = u
    ijk[spec.v] = v
    return ijk
  }
  const p00 = new THREE.Vector3(...voxelGltf(...voxel(u0, v0)))
  const p10 = new THREE.Vector3(...voxelGltf(...voxel(u1, v0)))
  const p01 = new THREE.Vector3(...voxelGltf(...voxel(u0, v1)))
  const x = p10.clone().sub(p00)
  const y = p01.clone().sub(p00)
  const width = Math.max(x.length(), 0.001)
  const height = Math.max(y.length(), 0.001)
  x.normalize()
  y.normalize()
  const z = new THREE.Vector3().crossVectors(x, y).normalize()
  y.copy(new THREE.Vector3().crossVectors(z, x).normalize())
  const matrix = new THREE.Matrix4().makeBasis(x, y, z)
  plane.quaternion.setFromRotationMatrix(matrix)
  plane.position.copy(p00).add(p10).add(p01).add(new THREE.Vector3(...voxelGltf(...voxel(u1, v1)))).multiplyScalar(0.25)
  plane.scale.set(width, height, 1)
  ;(plane.material as THREE.MeshBasicMaterial).color.setHex(planeColors[props.axis])
}

function registerMesh(name: string, mesh: THREE.Mesh) {
  const list = meshes.get(name) || []
  list.push(mesh)
  meshes.set(name, list)
  const match = /label_(\d+)/.exec(name)
  if (match) mesh.userData.labelId = Number(match[1])
}

async function load() {
  if (!scene) return
  const revision = ++version
  if (model) {
    scene.remove(model)
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach((material) => material.dispose())
      }
    })
    model = undefined
  }
  meshes.clear()
  if (!props.modelId) {
    progress.value = props.status || '等待分割完成…'
    return
  }
  progress.value = '正在加载 3D 模型…'
  try {
    const buffer = await viewerApi.loadGlb(props.modelId)
    if (revision !== version) return
    const gltf = await new GLTFLoader().parseAsync(buffer, '')
    if (revision !== version) return
    model = gltf.scene
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      const name = child.name || child.parent?.name || ''
      if (!name) return
      styleMesh(child, name)
      registerMesh(name, child)
    })
    scene.add(model)
    applyVisibility()
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    controls?.target.copy(center)
    camera?.position.copy(center).add(new THREE.Vector3(size.x * 1.8, size.y * 1.15, size.z * 1.8))
    controls?.update()
    updatePlane()
    progress.value = ''
    emit('loaded')
  } catch (reason) {
    if (revision === version) progress.value = reason instanceof Error ? reason.message : '模型加载失败'
  }
}

function onPointerDown(event: PointerEvent) {
  if (event.button === 0) pointerDown = { x: event.clientX, y: event.clientY }
}

function onPointerUp(event: PointerEvent) {
  if (!camera || !renderer || event.button !== 0 || !pointerDown) return
  const dragged = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 5
  pointerDown = null
  if (dragged) return
  const rect = renderer.domElement.getBoundingClientRect()
  const pointer = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  )
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(pointer, camera)
  const objects = [...meshes.values()].flat().filter((mesh) => mesh.visible)
  const hit = raycaster.intersectObjects(objects, false)[0]
  if (hit?.object.userData.labelId != null) emit('selectLabel', Number(hit.object.userData.labelId))
}

onMounted(() => {
  if (!host.value) return
  scene = new THREE.Scene()
  scene.background = new THREE.Color('#0c1418')
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2
  host.value.appendChild(renderer.domElement)
  camera = new THREE.PerspectiveCamera(40, 1, 0.001, 50)
  camera.position.set(0.4, 0.35, 0.7)
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.add(new THREE.HemisphereLight(0x9eb4c8, 0x1a1210, 0.4))
  keyLight = new THREE.DirectionalLight(0xfff1dc, 2.3)
  keyLight.position.set(-2.2, 3.2, 4)
  scene.add(keyLight)
  const fill = new THREE.DirectionalLight(0x9bb7ff, 0.85)
  fill.position.set(3.4, 0.8, 1.6)
  scene.add(fill)
  const rim = new THREE.DirectionalLight(0x7ee0d2, 1.7)
  rim.position.set(0.2, 1.4, -4.2)
  scene.add(rim)
  plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      color: planeColors.axial,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  )
  scene.add(plane)
  observer = new ResizeObserver(() => {
    if (!host.value || !renderer || !camera) return
    const width = host.value.clientWidth, height = host.value.clientHeight
    renderer.setSize(width, height)
    camera.aspect = width / Math.max(height, 1)
    camera.updateProjectionMatrix()
  })
  observer.observe(host.value)
  renderer.domElement.addEventListener('pointerdown', onPointerDown)
  renderer.domElement.addEventListener('pointerup', onPointerUp)
  const animate = () => {
    frame = requestAnimationFrame(animate)
    if (keyLight && camera) {
      keyLight.position.copy(camera.position).add(new THREE.Vector3(-0.4, 0.8, 0.3))
    }
    controls?.update()
    if (scene && camera) renderer?.render(scene, camera)
  }
  animate()
  void load()
})

watch(() => props.modelId, load)
watch(() => props.visibleNames.join('|'), applyVisibility)
watch(() => props.axis, updatePlane)
watch(() => props.sliceIndex, updatePlane)
watch(() => props.spacing?.join(','), updatePlane)
watch(() => props.affine, updatePlane, { deep: true })

onBeforeUnmount(() => {
  version++
  cancelAnimationFrame(frame)
  observer?.disconnect()
  renderer?.domElement.removeEventListener('pointerdown', onPointerDown)
  renderer?.domElement.removeEventListener('pointerup', onPointerUp)
  controls?.dispose()
  pmrem?.dispose()
  renderer?.dispose()
  renderer?.domElement.remove()
})
</script>

<template>
  <div class="anatomy-scene">
    <div ref="host" class="canvas" />
    <div v-if="progress" class="status">{{ progress }}</div>
  </div>
</template>

<style scoped>
.anatomy-scene {
  position: relative;
  min-height: 280px;
  overflow: hidden;
  border: 1px solid #1c2c34;
  border-radius: 10px;
  background: #0c1418;
}
.canvas {
  height: 100%;
  min-height: 280px;
  width: 100%;
}
.status {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  color: #8aa3ab;
  pointer-events: none;
}
</style>
