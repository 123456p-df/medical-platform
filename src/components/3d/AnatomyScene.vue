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
import type { Finding } from '@/types'
import { createFinding3DObject, type Finding3DObject } from '@/utils/bounding3d'
import { t } from '@/i18n'

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
    axis?: SliceAxis
    sliceIndex?: number
    shape?: [number, number, number]
    spacing?: [number, number, number] | null
    affine?: number[][] | null
    status?: string
    organMeta?: Record<number, OrganMetaItem> | null
    theme?: 'light' | 'dark'
    background?: string
    showPlane?: boolean
    findings?: Finding[]
    activeFindingId?: string | null
    showFindings?: boolean
  }>(),
  {
    modelId: null,
    axis: 'axial',
    sliceIndex: 0,
    shape: () => [512, 512, 128],
    spacing: null,
    affine: null,
    status: '',
    organMeta: null,
    theme: 'dark',
    background: undefined,
    showPlane: true,
    findings: () => [],
    activeFindingId: null,
    showFindings: true,
  },
)

const emit = defineEmits<{
  selectLabel: [labelId: number]
  selectFinding: [finding: Finding]
  loaded: []
}>()

const host = ref<HTMLDivElement | null>(null)
const progress = ref('')
const hoveredFinding = ref<Finding | null>(null)
const tooltipPos = ref<{ x: number; y: number }>({ x: 0, y: 0 })

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
let loadController: AbortController | undefined
let pointerDown: { x: number; y: number } | null = null
const meshes = new Map<string, THREE.Mesh[]>()

let findingsGroup: THREE.Group | undefined
const findingObjects = new Map<string, Finding3DObject>()
const findingHitMeshes: THREE.Mesh[] = []

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

function onContextLost(event: Event) {
  event.preventDefault()
  version++
  loadController?.abort()
  progress.value = t('ui.model.contextLost')
}

function onContextRestored() {
  progress.value = t('ui.model.contextRestored')
  void load()
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
  const metalness = 0.0
  let clearcoat = 0.90
  let clearcoatRoughness = 0.10
  let ior = 1.40
  let transmission = 0.0
  let thickness = 0.0
  let transparent = false
  let opacity = 1.0
  let depthWrite = true

  if (/rib|vertebra|skull|sternum|sacrum|hip|femur|humerus|scapula|clavicula|bone|spine|pelv/i.test(anatomicalName)) {
    color = new THREE.Color(0xdcd5c4)
    roughness = 0.78
    clearcoat = 0.0
    ior = 1.55
  } else if (/costal|cartilage/i.test(anatomicalName)) {
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
    color = new THREE.Color(0x7a1f1e)
    roughness = 0.26
    clearcoat = 0.96
    clearcoatRoughness = 0.08
  } else if (/aorta|artery|carotid|subclavian|brachiocephalic|celiac/i.test(anatomicalName)) {
    color = new THREE.Color(0x9e1d1d)
    roughness = 0.28
    clearcoat = 0.88
    clearcoatRoughness = 0.10
  } else if (/vein|vena|cava|jugular/i.test(anatomicalName)) {
    color = new THREE.Color(0x284668)
    roughness = 0.30
    clearcoat = 0.85
    clearcoatRoughness = 0.10
  } else if (/airway|trachea|bronch/i.test(anatomicalName)) {
    color = new THREE.Color(0xd0d8dc)
    roughness = 0.35
    clearcoat = 0.40
    transmission = 0.15
    thickness = 0.3
  } else if (/liver/i.test(anatomicalName)) {
    color = new THREE.Color(0x5c241c)
    roughness = 0.35
    clearcoat = 0.95
    clearcoatRoughness = 0.10
  } else if (/spleen/i.test(anatomicalName)) {
    color = new THREE.Color(0x4a1c2c)
    roughness = 0.30
    clearcoat = 0.92
    clearcoatRoughness = 0.09
  } else if (/kidney/i.test(anatomicalName)) {
    color = new THREE.Color(0x632828)
    roughness = 0.32
    clearcoat = 0.92
    clearcoatRoughness = 0.10
  } else if (/pancreas/i.test(anatomicalName)) {
    color = new THREE.Color(0xb08c50)
    roughness = 0.42
    clearcoat = 0.80
    clearcoatRoughness = 0.15
  } else if (/gallbladder/i.test(anatomicalName)) {
    color = new THREE.Color(0x3a5730)
    roughness = 0.22
    clearcoat = 0.98
    clearcoatRoughness = 0.06
  } else if (/stomach|duodenum|colon|bowel|esophagus|intestine/i.test(anatomicalName)) {
    color = new THREE.Color(0xb8746c)
    roughness = 0.36
    clearcoat = 0.92
    clearcoatRoughness = 0.12
  } else if (/bladder/i.test(anatomicalName)) {
    color = new THREE.Color(0xb37870)
    roughness = 0.32
    clearcoat = 0.92
    clearcoatRoughness = 0.10
  } else if (/muscle|iliopsoas|autochthon|gluteus/i.test(anatomicalName)) {
    color = new THREE.Color(0x852d27)
    roughness = 0.65
    clearcoat = 0.12
    clearcoatRoughness = 0.30
  } else if (/brain/i.test(anatomicalName)) {
    color = new THREE.Color(0xbda3a2)
    roughness = 0.38
    clearcoat = 0.85
    clearcoatRoughness = 0.12
  } else {
    color = rgbToThreeColor(meta?.color) || hashHueColor(anatomicalName)
    roughness = 0.38
    clearcoat = 0.80
    clearcoatRoughness = 0.12
  }

  if (mesh.geometry) {
    mesh.geometry.computeVertexNormals()
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
  plane.visible = Boolean(props.showPlane)
  if (!props.showPlane) {
    renderScene()
    return
  }
  const spec = SLICE_AXES[props.axis || 'axial']
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

const STATIC_ORGAN_NAMES: Record<string, number> = {
  brain: 1,
  eye: 2,
  heart: 3,
  liver: 4,
  lung: 5,
  kidney: 6,
  spleen: 7,
  pancreas: 8,
  stomach: 9,
}

function registerMesh(name: string, mesh: THREE.Mesh) {
  const list = meshes.get(name) || []
  list.push(mesh)
  meshes.set(name, list)
  const match = /label_(\d+)/.exec(name)
  if (match) {
    mesh.userData.labelId = Number(match[1])
  } else {
    const lower = name.toLowerCase()
    for (const [key, id] of Object.entries(STATIC_ORGAN_NAMES)) {
      if (lower.includes(key)) {
        mesh.userData.labelId = id
        break
      }
    }
  }
}

function updateFindings() {
  if (!scene) return
  if (findingsGroup) {
    scene.remove(findingsGroup)
    findingsGroup.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
        child.geometry.dispose()
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach((m) => m.dispose())
      }
    })
    findingsGroup = undefined
  }
  findingObjects.clear()
  findingHitMeshes.length = 0

  findingsGroup = new THREE.Group()
  findingsGroup.name = 'findings_group'
  findingsGroup.visible = Boolean(props.showFindings)

  if (props.findings && props.findings.length > 0) {
    const aff = currentAffine()
    for (const f of props.findings) {
      const obj = createFinding3DObject(f, aff, f.id === props.activeFindingId)
      findingObjects.set(f.id, obj)
      findingHitMeshes.push(obj.userData.hitMesh)
      findingsGroup.add(obj)
    }
  }

  scene.add(findingsGroup)
  renderScene()
}

function focusFinding(findingId: string | null | undefined) {
  if (!findingId || !controls || !camera) return
  const targetObj = findingObjects.get(findingId)
  if (!targetObj) return

  const worldPos = new THREE.Vector3()
  targetObj.getWorldPosition(worldPos)

  const offset = camera.position.clone().sub(controls.target)
  controls.target.copy(worldPos)
  const dist = offset.length()
  const desiredDist = Math.max(0.15, Math.min(dist, 0.45))
  offset.normalize().multiplyScalar(desiredDist)
  camera.position.copy(worldPos).add(offset)
  controls.update()
  renderScene()
}

function applyActiveFinding() {
  findingObjects.forEach((obj, id) => {
    obj.userData.updateActive(id === props.activeFindingId)
  })
  if (props.activeFindingId) {
    focusFinding(props.activeFindingId)
  }
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
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach((material) => {
          for (const value of Object.values(material)) {
            if (value instanceof THREE.Texture) value.dispose()
          }
          material.dispose()
        })
      }
    })
    model = undefined
  }
  meshes.clear()

  updateFindings()

  if (!props.modelId) {
  progress.value = props.status || t('ui.model.waitingSegmentation')
    renderScene()
    return
  }
  progress.value = t('ui.model.loadingModel')
  try {
    let buffer: ArrayBuffer
    if (props.modelId.startsWith('/') || props.modelId.startsWith('http')) {
      const resp = await fetch(props.modelId, { signal: controller.signal })
      if (!resp.ok) throw new Error('加载模型失败: ' + resp.statusText)
      buffer = await resp.arrayBuffer()
    } else {
      buffer = await viewerApi.loadGlb(props.modelId, controller.signal)
    }
    if (revision !== version) return

    const gltf = await new GLTFLoader().parseAsync(buffer, '')
    if (revision !== version) {
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach((m) => m.dispose())
        }
      })
      return
    }

    model = gltf.scene
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        registerMesh(child.name, child)
        styleMesh(child, child.name)
      }
    })

    applyVisibility()
    scene.add(model)
    updateFindings()

    const box = new THREE.Box3().setFromObject(model)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    controls?.target.copy(center)
    camera?.position.copy(center).add(new THREE.Vector3(size.x * 1.8, size.y * 1.15, size.z * 1.8))
    controls?.update()
    updatePlane()
    progress.value = ''
    emit('loaded')
  } catch (reason) {
    if (controller.signal.aborted) return
    if (revision === version) progress.value = reason instanceof Error ? reason.message : t('ui.model.loadFailed')
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

  if (props.showFindings && findingHitMeshes.length > 0) {
    const findingHits = raycaster.intersectObjects(findingHitMeshes, false)
    if (findingHits[0]?.object.userData.finding) {
      emit('selectFinding', findingHits[0].object.userData.finding)
      return
    }
  }

  const objects = [...meshes.values()].flat().filter((mesh) => mesh.visible)
  const hit = raycaster.intersectObjects(objects, false)[0]
  if (hit?.object.userData.labelId != null) emit('selectLabel', Number(hit.object.userData.labelId))
}

function onPointerMove(event: PointerEvent) {
  if (!camera || !renderer || !host.value) return
  if (!props.showFindings || findingHitMeshes.length === 0) {
    if (hoveredFinding.value) {
      hoveredFinding.value = null
      renderer.domElement.style.cursor = 'default'
    }
    return
  }

  const rect = renderer.domElement.getBoundingClientRect()
  const pointer = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  )
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(pointer, camera)
  const hits = raycaster.intersectObjects(findingHitMeshes, false)
  if (hits[0]?.object.userData.finding) {
    hoveredFinding.value = hits[0].object.userData.finding
    tooltipPos.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
    renderer.domElement.style.cursor = 'pointer'
  } else if (hoveredFinding.value) {
    hoveredFinding.value = null
    renderer.domElement.style.cursor = 'default'
  }
}

function onMouseLeave() {
  if (hoveredFinding.value) {
    hoveredFinding.value = null
    if (renderer) renderer.domElement.style.cursor = 'default'
  }
}

onMounted(() => {
  if (!host.value) return
  scene = new THREE.Scene()
  const isLight = props.theme === 'light' || props.background?.toLowerCase() === '#ffffff'
  const bgColor = props.background || (isLight ? '#ffffff' : '#0c1418')
  scene.background = new THREE.Color(bgColor)
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = isLight ? 1.05 : 1.2
  host.value.appendChild(renderer.domElement)
  renderer.domElement.addEventListener('webglcontextlost', onContextLost)
  renderer.domElement.addEventListener('webglcontextrestored', onContextRestored)
  camera = new THREE.PerspectiveCamera(40, 1, 0.001, 50)
  camera.position.set(0.4, 0.35, 0.7)
  scene.add(camera)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = false
  controls.addEventListener('change', renderScene)

  pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

  if (isLight) {
    scene.add(new THREE.HemisphereLight(0xffffff, 0xcfd8dc, 1.4))
    keyLight = new THREE.DirectionalLight(0xffffff, 2.2)
    keyLight.position.set(0.6, 0.8, 1.4)
    keyLight.target.position.set(0, 0, -1)
    camera.add(keyLight)
    camera.add(keyLight.target)

    const cameraFill = new THREE.DirectionalLight(0xe0e7eb, 1.1)
    cameraFill.position.set(-0.9, -0.5, 1.2)
    cameraFill.target.position.set(0, 0, -1)
    camera.add(cameraFill)
    camera.add(cameraFill.target)

    const rim = new THREE.DirectionalLight(0x90a4ae, 0.5)
    rim.position.set(0, 2.0, -3.0)
    scene.add(rim)
  } else {
    scene.add(new THREE.HemisphereLight(0xddeeff, 0x182026, 1.2))
    keyLight = new THREE.DirectionalLight(0xfff6ee, 2.6)
    keyLight.position.set(0.6, 0.8, 1.4)
    keyLight.target.position.set(0, 0, -1)
    camera.add(keyLight)
    camera.add(keyLight.target)

    const cameraFill = new THREE.DirectionalLight(0x90c5e8, 1.2)
    cameraFill.position.set(-0.9, -0.5, 1.2)
    cameraFill.target.position.set(0, 0, -1)
    camera.add(cameraFill)
    camera.add(cameraFill.target)

    const rim = new THREE.DirectionalLight(0x5eead4, 0.8)
    rim.position.set(0, 2.0, -3.0)
    scene.add(rim)
  }

  plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      color: planeColors[props.axis || 'axial'],
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  )
  plane.visible = Boolean(props.showPlane)
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
  renderer.domElement.addEventListener('pointermove', onPointerMove)
  renderer.domElement.addEventListener('mouseleave', onMouseLeave)
  renderScene()
  void load()
})

watch(() => props.modelId, load)
watch(() => props.visibleNames.join('|'), applyVisibility)
watch(() => props.axis, updatePlane)
watch(() => props.sliceIndex, updatePlane)
watch(() => props.spacing?.join(','), updatePlane)
watch(() => props.affine, () => {
  updatePlane()
  updateFindings()
}, { deep: true })
watch(() => [props.theme, props.background], () => {
  if (!scene) return
  const isLight = props.theme === 'light' || props.background?.toLowerCase() === '#ffffff'
  const bgColor = props.background || (isLight ? '#ffffff' : '#0c1418')
  scene.background = new THREE.Color(bgColor)
  renderScene()
})
watch(() => props.showPlane, (val) => {
  if (plane) {
    plane.visible = Boolean(val)
    renderScene()
  }
})
watch(() => props.findings, updateFindings, { deep: true })
watch(() => props.showFindings, (val) => {
  if (findingsGroup) {
    findingsGroup.visible = Boolean(val)
    renderScene()
  }
})
watch(() => props.activeFindingId, applyActiveFinding)
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
  loadController?.abort()
  observer?.disconnect()
  renderer?.domElement.removeEventListener('pointerdown', onPointerDown)
  renderer?.domElement.removeEventListener('pointerup', onPointerUp)
  renderer?.domElement.removeEventListener('pointermove', onPointerMove)
  renderer?.domElement.removeEventListener('mouseleave', onMouseLeave)
  renderer?.domElement.removeEventListener('webglcontextlost', onContextLost)
  renderer?.domElement.removeEventListener('webglcontextrestored', onContextRestored)
  controls?.removeEventListener('change', renderScene)
  controls?.dispose()
  if (scene?.environment instanceof THREE.Texture) scene.environment.dispose()
  pmrem?.dispose()
  if (scene) {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
        child.geometry.dispose()
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach((m) => {
          if ('map' in m && m.map instanceof THREE.Texture) m.map.dispose()
          m.dispose()
        })
      }
    })
  }
  model = undefined
  plane = undefined
  findingsGroup = undefined
  scene?.clear()
  renderer?.dispose()
  renderer?.forceContextLoss()
  renderer?.domElement.remove()
})
</script>

<template>
  <div :class="['anatomy-scene', { 'light-theme': theme === 'light' || background?.toLowerCase() === '#ffffff' }]">
    <div ref="host" class="canvas" />
    <div v-if="progress" class="status">{{ progress }}</div>

    <!-- 3D 浮动病灶悬浮卡片 -->
    <div
      v-if="hoveredFinding && showFindings"
      class="finding-tooltip"
      :style="{ left: `${tooltipPos.x + 14}px`, top: `${tooltipPos.y + 14}px` }"
    >
      <div class="tooltip-header">
        <span class="status-badge" :class="hoveredFinding.status || 'pending'">
          {{
            hoveredFinding.status === 'confirmed'
              ? '已确诊'
              : hoveredFinding.status === 'dismissed'
              ? '已排除'
              : hoveredFinding.status === 'modified'
              ? '已修改'
              : '待复核'
          }}
        </span>
        <strong class="finding-title">{{ hoveredFinding.label || '结节/肿瘤病灶' }}</strong>
      </div>
      <div class="tooltip-body">
        <div v-if="hoveredFinding.diameterMm" class="tooltip-row">
          <span class="label">长径:</span>
          <span class="val">{{ hoveredFinding.diameterMm.toFixed(1) }} mm</span>
        </div>
        <div v-if="hoveredFinding.location" class="tooltip-row">
          <span class="label">解剖部位:</span>
          <span class="val">{{ hoveredFinding.location }}</span>
        </div>
        <div v-if="hoveredFinding.confidence" class="tooltip-row">
          <span class="label">置信度:</span>
          <span class="val">{{ (hoveredFinding.confidence * 100).toFixed(0) }}%</span>
        </div>
      </div>
      <div class="tooltip-hint">{{ $t('ui.anatomy.sliceHint') }}</div>
    </div>
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
.anatomy-scene.light-theme {
  border: 1px solid #e2e8f0;
  background: #ffffff;
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
.anatomy-scene.light-theme .status {
  color: #64748b;
}

/* 3D 浮动病灶悬浮卡片样式 */
.finding-tooltip {
  position: absolute;
  z-index: 10;
  pointer-events: none;
  min-width: 160px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(16, 24, 32, 0.92);
  backdrop-filter: blur(8px);
  border: 1px solid #2a404c;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
  color: #e2e8f0;
  font-size: 11px;
  transform: translateY(-50%);
  transition: opacity 0.15s ease;
}
.anatomy-scene.light-theme .finding-tooltip {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #cbd5e1;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  color: #1e293b;
}
.tooltip-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.anatomy-scene.light-theme .tooltip-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.finding-title {
  font-size: 12px;
  font-weight: 600;
  color: #f8fafc;
}
.anatomy-scene.light-theme .finding-title {
  color: #0f172a;
}
.status-badge {
  display: inline-block;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}
.status-badge.confirmed {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.4);
}
.status-badge.pending {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.4);
}
.status-badge.modified {
  background: rgba(6, 182, 212, 0.2);
  color: #38bdf8;
  border: 1px solid rgba(6, 182, 212, 0.4);
}
.status-badge.dismissed {
  background: rgba(100, 116, 139, 0.2);
  color: #94a3b8;
  border: 1px solid rgba(100, 116, 139, 0.4);
}
.tooltip-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.tooltip-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.tooltip-row .label {
  color: #94a3b8;
}
.tooltip-row .val {
  font-weight: 500;
  color: #e2e8f0;
}
.anatomy-scene.light-theme .tooltip-row .val {
  color: #1e293b;
}
.tooltip-hint {
  margin-top: 6px;
  padding-top: 4px;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
  color: #38bdf8;
  font-size: 10px;
  text-align: center;
}
.anatomy-scene.light-theme .tooltip-hint {
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
  color: #0284c7;
}
</style>
