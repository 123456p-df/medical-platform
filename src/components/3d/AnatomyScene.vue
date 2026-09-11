<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { SliceAxis } from '@/utils/volumePixels'
import { viewerApi } from '@/api/viewer'

const props = withDefaults(
  defineProps<{
    modelId?: string | null
    visibleNames: string[]
    axis: SliceAxis
    sliceIndex: number
    shape: [number, number, number]
    affine?: number[][] | null
    status?: string
  }>(),
  { modelId: null, affine: null, status: '' },
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
let observer: ResizeObserver | undefined
let frame = 0
let version = 0
const meshes = new Map<string, THREE.Object3D>()

const planeColors: Record<SliceAxis, number> = {
  axial: 0x4ba3a6,
  coronal: 0x527bbf,
  sagittal: 0xc5862f,
}

function voxelToGltf(i: number, j: number, k: number): THREE.Vector3 {
  const affine = props.affine
  let ras: [number, number, number]
  if (affine && affine.length >= 3) {
    ras = [
      affine[0][0] * i + affine[0][1] * j + affine[0][2] * k + affine[0][3],
      affine[1][0] * i + affine[1][1] * j + affine[1][2] * k + affine[1][3],
      affine[2][0] * i + affine[2][1] * j + affine[2][2] * k + affine[2][3],
    ]
  } else {
    const spacing = [1, 1, 1]
    ras = [i * spacing[0], j * spacing[1], k * spacing[2]]
  }
  return new THREE.Vector3(ras[0] * 0.001, ras[2] * 0.001, -ras[1] * 0.001)
}

function applyVisibility() {
  const allowed = new Set(props.visibleNames)
  if (!allowed.size) {
    meshes.forEach((object) => { object.visible = true })
    return
  }
  let matched = 0
  meshes.forEach((object, name) => {
    const visible = allowed.has(name)
    object.visible = visible
    if (visible) matched += 1
  })
  if (!matched) meshes.forEach((object) => { object.visible = true })
}

function updatePlane() {
  if (!scene || !plane) return
  const [nx, ny, nz] = props.shape
  const index = props.sliceIndex
  const a = voxelToGltf(0, 0, 0)
  const b = voxelToGltf(nx - 1, 0, 0)
  const c = voxelToGltf(0, ny - 1, 0)
  const d = voxelToGltf(0, 0, nz - 1)
  let origin: THREE.Vector3
  let width: number
  let height: number
  let quaternion = new THREE.Quaternion()
  if (props.axis === 'axial') {
    origin = voxelToGltf(nx / 2, ny / 2, index)
    width = a.distanceTo(b)
    height = a.distanceTo(c)
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), d.clone().sub(a).normalize())
  } else if (props.axis === 'coronal') {
    origin = voxelToGltf(nx / 2, index, nz / 2)
    width = a.distanceTo(b)
    height = a.distanceTo(d)
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), c.clone().sub(a).normalize())
  } else {
    origin = voxelToGltf(index, ny / 2, nz / 2)
    width = a.distanceTo(c)
    height = a.distanceTo(d)
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), b.clone().sub(a).normalize())
  }
  plane.geometry.dispose()
  plane.geometry = new THREE.PlaneGeometry(Math.max(width, 0.01), Math.max(height, 0.01))
  ;(plane.material as THREE.MeshBasicMaterial).color.setHex(planeColors[props.axis])
  plane.position.copy(origin)
  plane.quaternion.copy(quaternion)
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
      meshes.set(name, child)
      const match = /label_(\d+)/.exec(name)
      if (match) child.userData.labelId = Number(match[1])
    })
    scene.add(model)
    applyVisibility()
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    controls?.target.copy(center)
    camera?.position.copy(center).add(new THREE.Vector3(size.x * 1.6, size.y * 1.1, size.z * 1.6))
    controls?.update()
    updatePlane()
    progress.value = ''
    emit('loaded')
  } catch (reason) {
    if (revision === version) progress.value = reason instanceof Error ? reason.message : '模型加载失败'
  }
}

function onPointer(event: PointerEvent) {
  if (!camera || !renderer || event.button !== 0) return
  const rect = renderer.domElement.getBoundingClientRect()
  const pointer = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  )
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(pointer, camera)
  const hits = raycaster.intersectObjects([...meshes.values()], false)
  const hit = hits.find((item) => item.object.visible && item.object.userData.labelId != null)
  if (hit) emit('selectLabel', Number(hit.object.userData.labelId))
}

onMounted(() => {
  if (!host.value) return
  scene = new THREE.Scene()
  scene.background = new THREE.Color('#eef6f6')
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  host.value.appendChild(renderer.domElement)
  camera = new THREE.PerspectiveCamera(40, 1, 0.001, 50)
  camera.position.set(0.4, 0.4, 0.6)
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6d8684, 1.4))
  const light = new THREE.DirectionalLight(0xffffff, 1.8)
  light.position.set(2, 3, 4)
  scene.add(light)
  plane = new THREE.Mesh(
    new THREE.PlaneGeometry(0.1, 0.1),
    new THREE.MeshBasicMaterial({
      color: planeColors.axial,
      transparent: true,
      opacity: 0.28,
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
  renderer.domElement.addEventListener('pointerup', onPointer)
  const animate = () => {
    frame = requestAnimationFrame(animate)
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

onBeforeUnmount(() => {
  version++
  cancelAnimationFrame(frame)
  observer?.disconnect()
  renderer?.domElement.removeEventListener('pointerup', onPointer)
  controls?.dispose()
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
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #eef6f6;
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
  color: var(--text-muted);
  pointer-events: none;
}
</style>
