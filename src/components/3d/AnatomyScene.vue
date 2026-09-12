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

type OrganMetaItem = {
  label_id?: number | null
  name?: string
  display_name?: string | null
  group_id?: string | null
  group_name?: string | null
  color?: number[] | null
  outline_only?: boolean | null
}

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
    organMeta?: Record<number, OrganMetaItem> | null
  }>(),
  { modelId: null, spacing: null, affine: null, status: '', organMeta: null },
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
let version = 0
let pointerDown: { x: number; y: number } | null = null
const meshes = new Map<string, THREE.Mesh[]>()

const planeColors: Record<SliceAxis, number> = {
  axial: 0x4ba3a6,
  coronal: 0x527bbf,
  sagittal: 0xc5862f,
}

const FALLBACK_LABELS: Record<number, string> = {
  1: 'spleen',
  2: 'right kidney',
  3: 'left kidney',
  4: 'gallbladder',
  5: 'liver',
  6: 'stomach',
  7: 'aorta',
  8: 'inferior vena cava',
  9: 'portal vein and splenic vein',
  10: 'pancreas',
  11: 'right adrenal gland',
  12: 'left adrenal gland',
  13: 'left lung',
  14: 'right lung',
  15: 'trachea',
  16: 'airways',
  17: 'heart',
  22: 'brain',
  28: 'left lung',
  29: 'right lung',
  30: 'airways',
  31: 'trachea',
  32: 'lung',
  50: 'aorta',
  51: 'inferior vena cava',
  52: 'portal vein and splenic vein',
  53: 'superior vena cava',
  54: 'pulmonary artery',
  115: 'heart',
}

function rgbToThreeColor(rgb?: number[] | null): THREE.Color | null {
  if (!rgb || rgb.length < 3) return null
  return new THREE.Color(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255)
}

function hashHueColor(str: string): THREE.Color {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  const hue = Math.abs(hash % 360) / 360
  const color = new THREE.Color()
  color.setHSL(hue, 0.55, 0.52)
  return color
}

function renderScene() {
  if (!scene || !camera || !renderer) return
  renderer.render(scene, camera)
}

function styleMesh(mesh: THREE.Mesh, name: string) {
  const match = /label_(\d+)/.exec(name)
  const labelId = match ? Number(match[1]) : null
  const meta = labelId != null ? props.organMeta?.[labelId] : null
  const anatomicalName = (
    meta?.name ||
    meta?.group_id ||
    meta?.display_name ||
    (labelId != null ? FALLBACK_LABELS[labelId] : '') ||
    name
  ).toLowerCase()

  let color: THREE.Color
  let roughness = 0.38
  const metalness = 0.0 // 人体生物组织均为介电质绝缘体，严格为 0
  let clearcoat = 0.90  // 浆膜/腹膜/外膜表面体液湿润反光层
  let clearcoatRoughness = 0.10
  let ior = 1.40        // 软组织物理折射率
  let transmission = 0.0
  let thickness = 0.0
  let transparent = false
  let opacity = 1.0
  let depthWrite = true

  if (/rib|vertebra|skull|sternum|sacrum|hip|femur|humerus|scapula|clavicula|bone|spine|pelv/i.test(anatomicalName)) {
    // 骨骼系统：天然象牙钙质白/暖灰，皮质骨干燥致密，无清漆湿润层，高哑光漫反射
    color = new THREE.Color(0xdcd5c4)
    roughness = 0.78
    clearcoat = 0.0
    ior = 1.55
  } else if (/costal|cartilage/i.test(anatomicalName)) {
    // 软骨系统（肋软骨）：乳白半透光微浅蓝，含大量蛋白聚糖与水，具半透明感
    color = new THREE.Color(0xc2d7e0)
    roughness = 0.30
    clearcoat = 0.50
    clearcoatRoughness = 0.15
    transmission = 0.35
    thickness = 0.5
    transparent = true
    opacity = 0.92
    ior = 1.42
  } else if (/lung/i.test(anatomicalName)) {
    // 肺叶组织：健康成人肺呈淡粉灰玫瑰色，富含肺泡海绵多孔质感，微弱透光与微弱胸膜反光
    color = new THREE.Color(0xb88a8a)
    roughness = 0.60
    clearcoat = 0.25
    clearcoatRoughness = 0.25
    transmission = 0.20
    thickness = 0.8
    transparent = true
    opacity = 0.85
    depthWrite = true
    ior = 1.38
  } else if (/heart|atrial|ventricle|myocardium/i.test(anatomicalName)) {
    // 心脏/心肌：深红心肌组织，心外膜被覆心包浆液，高光清亮晶莹
    color = new THREE.Color(0x7a1f1e)
    roughness = 0.26
    clearcoat = 0.96
    clearcoatRoughness = 0.08
  } else if (/aorta|artery|carotid|subclavian|brachiocephalic|celiac/i.test(anatomicalName)) {
    // 动脉系统：充盈含氧血的高压弹性血管，厚壁深红，光滑圆润
    color = new THREE.Color(0x9e1d1d)
    roughness = 0.28
    clearcoat = 0.88
    clearcoatRoughness = 0.10
  } else if (/vein|vena|cava|jugular/i.test(anatomicalName)) {
    // 静脉系统：充盈暗红静脉血的薄壁血管，呈暗蓝灰紫暗调
    color = new THREE.Color(0x284668)
    roughness = 0.30
    clearcoat = 0.85
    clearcoatRoughness = 0.10
  } else if (/airway|trachea|bronch/i.test(anatomicalName)) {
    // 气道/气管：软骨环淡灰黄白，膜部微透光
    color = new THREE.Color(0xd0d8dc)
    roughness = 0.35
    clearcoat = 0.40
    transmission = 0.15
    thickness = 0.3
  } else if (/liver/i.test(anatomicalName)) {
    // 肝脏：实性大脏器，富含血窦呈深暗红褐色（肝红），腹膜反光光亮湿润
    color = new THREE.Color(0x5c241c)
    roughness = 0.35
    clearcoat = 0.95
    clearcoatRoughness = 0.10
  } else if (/spleen/i.test(anatomicalName)) {
    // 脾脏：质脆血窦器官，呈暗紫李色，表面包膜光滑
    color = new THREE.Color(0x4a1c2c)
    roughness = 0.30
    clearcoat = 0.92
    clearcoatRoughness = 0.09
  } else if (/kidney/i.test(anatomicalName)) {
    // 肾脏：实质深豆红褐色，表面肾纤维膜光滑润泽
    color = new THREE.Color(0x632828)
    roughness = 0.32
    clearcoat = 0.92
    clearcoatRoughness = 0.10
  } else if (/pancreas/i.test(anatomicalName)) {
    // 胰腺：分叶状腺体，呈淡暖赭黄褐
    color = new THREE.Color(0xb08c50)
    roughness = 0.42
    clearcoat = 0.80
    clearcoatRoughness = 0.15
  } else if (/gallbladder/i.test(anatomicalName)) {
    // 胆囊：充盈浓缩胆汁呈暗墨绿/橄榄绿，囊壁极湿润光亮
    color = new THREE.Color(0x3a5730)
    roughness = 0.22
    clearcoat = 0.98
    clearcoatRoughness = 0.06
  } else if (/stomach|duodenum|colon|bowel|esophagus|intestine/i.test(anatomicalName)) {
    // 消化道管壁：粘膜/浆膜暖肉粉色，蠕动湿润
    color = new THREE.Color(0xb8746c)
    roughness = 0.36
    clearcoat = 0.92
    clearcoatRoughness = 0.12
  } else if (/bladder/i.test(anatomicalName)) {
    // 膀胱：肌性囊性脏器，淡粉肌色，湿润
    color = new THREE.Color(0xb37870)
    roughness = 0.32
    clearcoat = 0.92
    clearcoatRoughness = 0.10
  } else if (/muscle|iliopsoas|autochthon|gluteus/i.test(anatomicalName)) {
    // 骨骼肌：条纹肌纤维暗牛肉红，哑光漫散射
    color = new THREE.Color(0x852d27)
    roughness = 0.65
    clearcoat = 0.12
    clearcoatRoughness = 0.30
  } else if (/brain/i.test(anatomicalName)) {
    // 脑组织：灰质淡粉灰，软脑膜湿润
    color = new THREE.Color(0xbda3a2)
    roughness = 0.38
    clearcoat = 0.85
    clearcoatRoughness = 0.12
  } else {
    // 未知/其他器官
    color = rgbToThreeColor(meta?.color) || hashHueColor(anatomicalName)
    roughness = 0.38
    clearcoat = 0.80
    clearcoatRoughness = 0.12
  }

  const material = new THREE.MeshPhysicalMaterial({
    color,
    roughness,
    metalness,
    clearcoat,
    clearcoatRoughness,
    ior,
    transmission,
    thickness,
    envMapIntensity: 1.25,
    side: THREE.DoubleSide,
    transparent,
    opacity,
    depthWrite,
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
  renderScene()
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
  renderScene()
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
    renderScene()
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
      child.geometry.computeVertexNormals()
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
    renderScene()
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
  scene.add(camera)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = false
  controls.addEventListener('change', renderScene)

  pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

  // 1. 全向半球漫反射环境光：天顶浅灰蓝，天底深底色，给背光面柔和轮廓
  scene.add(new THREE.HemisphereLight(0xddeeff, 0x182026, 1.2))

  // 2. 主高光定向光 (Headlight) 挂载到相机：无论视角如何旋转，始终从观察正面立体照明
  keyLight = new THREE.DirectionalLight(0xfff6ee, 2.6)
  keyLight.position.set(0.6, 0.8, 1.4)
  camera.add(keyLight)

  // 3. 辅助补光灯挂载到相机左下方，柔化暗部阴影
  const cameraFill = new THREE.DirectionalLight(0x90c5e8, 1.2)
  cameraFill.position.set(-0.9, -0.5, 1.2)
  camera.add(cameraFill)

  // 4. 全局背面轮廓光
  const rim = new THREE.DirectionalLight(0x5eead4, 0.8)
  rim.position.set(0, 2.0, -3.0)
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
    renderScene()
  })
  observer.observe(host.value)
  renderer.domElement.addEventListener('pointerdown', onPointerDown)
  renderer.domElement.addEventListener('pointerup', onPointerUp)
  renderScene()
  void load()
})

watch(() => props.modelId, load)
watch(() => props.visibleNames.join('|'), applyVisibility)
watch(() => props.axis, updatePlane)
watch(() => props.sliceIndex, updatePlane)
watch(() => props.spacing?.join(','), updatePlane)
watch(() => props.affine, updatePlane, { deep: true })
watch(
  () => props.organMeta,
  () => {
    meshes.forEach((list, name) => {
      list.forEach((mesh) => styleMesh(mesh, name))
    })
    renderScene()
  },
  { deep: true },
)

onBeforeUnmount(() => {
  version++
  observer?.disconnect()
  renderer?.domElement.removeEventListener('pointerdown', onPointerDown)
  renderer?.domElement.removeEventListener('pointerup', onPointerUp)
  controls?.removeEventListener('change', renderScene)
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
