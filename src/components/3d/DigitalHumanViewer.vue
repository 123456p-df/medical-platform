<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RotateCcw, Rotate3D, Layers, Sparkles } from 'lucide-vue-next'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { organNames } from '@/api/mappers'
import { api } from '@/api/client'

const props = withDefaults(
  defineProps<{
    selectedOrganId?: string | null
    compact?: boolean
    patientId?: string
    sliceAxis?: string
    slicePosition?: number
    showSlicingPlane?: boolean
    enableClipping?: boolean
  }>(),
  {
    selectedOrganId: null,
    compact: false,
    sliceAxis: 'axial',
    slicePosition: 0.5,
    showSlicingPlane: false,
    enableClipping: false,
  }
)
const emit = defineEmits<{
  select: [organId: string]
  'navigate-slice': [pos: number]
}>()

const host = ref<HTMLDivElement>()
const loading = ref(true)
const error = ref('')
const rotating = ref(false)
const shell = ref(true)
const hoveredName = ref('')
const hoveredCategory = ref('')
const patientOrgans = ref<Set<string>>(new Set())
const hasPatientOrgans = computed(() => patientOrgans.value.size > 0)

// System category filters
type CategoryId = 'all' | 'viscera' | 'skeletal' | 'cardiovascular' | 'respiratory' | 'muscular'
const activeCategory = ref<CategoryId>('all')

const categories: { id: CategoryId; label: string }[] = [
  { id: 'all', label: '全部 (70项)' },
  { id: 'viscera', label: '内脏实质' },
  { id: 'skeletal', label: '骨骼系统' },
  { id: 'cardiovascular', label: '心血管' },
  { id: 'respiratory', label: '呼吸系统' },
  { id: 'muscular', label: '肌群组织' },
]

let renderer: THREE.WebGLRenderer | undefined
let scene: THREE.Scene | undefined
let camera: THREE.PerspectiveCamera | undefined
let controls: OrbitControls | undefined
let observer: ResizeObserver | undefined
let frame = 0
let disposed = false

const organs: THREE.Mesh[] = []
const shells: THREE.Mesh[] = []
let down: { x: number; y: number } | null = null

// Anatomical Chinese mapping dictionary
const ZH_NAMES: Record<string, string> = {
  liver: '肝脏', spleen: '脾脏', pancreas: '胰腺', gallbladder: '胆囊', stomach: '胃',
  duodenum: '十二指肠', small_bowel: '小肠', colon: '结肠', esophagus: '食管',
  left_kidney: '左肾', right_kidney: '右肾', left_adrenal_gland: '左肾上腺', right_adrenal_gland: '右肾上腺',
  left_kidney_cyst: '左肾囊肿', right_kidney_cyst: '右肾囊肿',
  heart: '心脏', aorta: '主动脉', inferior_vena_cava: '下腔静脉', portal_vein_and_splenic_vein: '门静脉与脾静脉',
  pulmonary_vein: '肺静脉', right_subclavian_artery: '右锁骨下动脉', right_iliac_artery: '右髂动脉',
  left_atrial_appendage: '左心耳',
  left_lung_upper_lobe: '左肺上叶', left_lung_lower_lobe: '左肺下叶',
  right_lung_upper_lobe: '右肺上叶', right_lung_middle_lobe: '右肺中叶', right_lung_lower_lobe: '右肺下叶',
  sternum: '胸骨', spinal_cord: '脊髓', costal_cartilages: '肋软骨',
  left_scapula: '左肩胛骨', right_scapula: '右肩胛骨', left_hip: '左髋骨', right_hip: '右髋骨', right_femur: '右股骨',
  left_autochthon: '左侧深层脊柱肌群', right_autochthon: '右侧深层脊柱肌群',
  left_iliopsoas: '左髂腰肌', right_iliopsoas: '右髂腰肌',
  right_gluteus_maximus: '右臀大肌', left_gluteus_medius: '左臀中肌',
  brain: '颅脑', body_shell: '人体外壳',
}

function getCategory(name: string): CategoryId {
  const n = name.toLowerCase()
  if (/rib|vertebrae|sternum|scapula|hip|femur|bone|cartilage|spinal_cord/.test(n)) return 'skeletal'
  if (/aorta|subclavian|iliac|artery|vena_cava|vein|portal|heart|atrial/.test(n)) return 'cardiovascular'
  if (/lung|trachea/.test(n)) return 'respiratory'
  if (/liver|spleen|pancreas|gallbladder|stomach|duodenum|bowel|colon|esophagus|kidney|adrenal|cyst|bladder/.test(n)) return 'viscera'
  if (/autochthon|iliopsoas|gluteus|muscle/.test(n)) return 'muscular'
  return 'viscera'
}

function getChineseName(name: string): string {
  if (ZH_NAMES[name]) return ZH_NAMES[name]
  const ribMatch = name.match(/^(left|right)_rib_(\d+)$/)
  if (ribMatch) return `${ribMatch[1] === 'left' ? '左' : '右'}第 ${ribMatch[2]} 肋骨`
  const vertMatch = name.match(/^vertebrae_([TL])(\d+)$/)
  if (vertMatch) return `${vertMatch[1] === 'T' ? '胸椎 T' : '腰椎 L'}${vertMatch[2]}`
  return name.replace(/_/g, ' ')
}

function mapToMainOrganId(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('liver')) return 'liver'
  if (n.includes('spleen')) return 'spleen'
  if (n.includes('pancreas')) return 'pancreas'
  if (n.includes('stomach')) return 'stomach'
  if (n.includes('heart')) return 'heart'
  if (n.includes('kidney')) return 'kidney'
  if (n.includes('lung')) return 'lung'
  if (n.includes('brain')) return 'brain'
  if (n.includes('eye')) return 'eye'
  return 'other'
}

function disposeObject(object: THREE.Object3D) {
  object.traverse(child => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose()
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach(m => m.dispose())
    }
  })
}

function updateCategoryVisibility() {
  const cat = activeCategory.value
  for (const mesh of organs) {
    const meshCat = mesh.userData.category as CategoryId
    const material = mesh.material as THREE.MeshStandardMaterial

    if (cat === 'all') {
      mesh.visible = true
      if (meshCat === 'muscular') {
        material.transparent = true
        material.opacity = 0.28
        material.depthWrite = false
      } else {
        material.transparent = false
        material.opacity = 1.0
        material.depthWrite = true
      }
    } else if (cat === 'cardiovascular') {
      if (meshCat === 'cardiovascular') {
        mesh.visible = true
        material.transparent = false
        material.opacity = 1.0
        material.depthWrite = true
      } else if (meshCat === 'skeletal') {
        mesh.visible = true
        material.transparent = true
        material.opacity = 0.14
        material.depthWrite = false
      } else {
        mesh.visible = false
      }
    } else if (cat === 'skeletal') {
      mesh.visible = meshCat === 'skeletal'
      if (mesh.visible) {
        material.transparent = false
        material.opacity = 1.0
        material.depthWrite = true
      }
    } else if (cat === 'viscera') {
      mesh.visible = meshCat === 'viscera'
      if (mesh.visible) {
        material.transparent = false
        material.opacity = 1.0
        material.depthWrite = true
      }
    } else if (cat === 'respiratory') {
      mesh.visible = meshCat === 'respiratory'
      if (mesh.visible) {
        material.transparent = false
        material.opacity = 1.0
        material.depthWrite = true
      }
    } else if (cat === 'muscular') {
      mesh.visible = meshCat === 'muscular'
      if (mesh.visible) {
        material.transparent = false
        material.opacity = 0.88
        material.depthWrite = true
      }
    }
  }
}

function updateSelection() {
  for (const mesh of organs) {
    const material = mesh.material as THREE.MeshStandardMaterial
    const isSelected = mesh.userData.organId === props.selectedOrganId
    const isPatientModel = patientOrgans.value.has(mesh.userData.organId)

    if (isSelected) {
      material.emissive.set(isPatientModel ? 0x1f7a68 : 0x5a4220)
      material.emissiveIntensity = 0.55
    } else if (isPatientModel) {
      material.emissive.set(0x1a453e)
      material.emissiveIntensity = 0.2
    } else {
      material.emissive.set(0x000000)
      material.emissiveIntensity = 0
    }
  }
}

function setCategory(id: CategoryId) {
  activeCategory.value = id
  updateCategoryVisibility()
}

function reset() {
  camera?.position.set(0, 0.30, 4.65)
  controls?.target.set(0, 0.27, 0)
  controls?.update()
}

function pointerDown(e: PointerEvent) {
  down = { x: e.clientX, y: e.clientY }
}

function pointerMove(e: PointerEvent) {
  if (!camera || !renderer) return
  const r = renderer.domElement.getBoundingClientRect()
  const ray = new THREE.Raycaster()
  ray.setFromCamera(
    new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1),
    camera
  )
  const visibleOrgans = organs.filter(o => o.visible)
  const hit = ray.intersectObjects(visibleOrgans, false)[0]
  if (hit && hit.object.userData.displayName) {
    hoveredName.value = hit.object.userData.displayName
    hoveredCategory.value = hit.object.userData.categoryLabel || ''
  } else {
    hoveredName.value = ''
    hoveredCategory.value = ''
  }
}

function pointerUp(e: PointerEvent) {
  if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5 || !camera || !renderer) return
  down = null
  const r = renderer.domElement.getBoundingClientRect()
  const ray = new THREE.Raycaster()
  ray.setFromCamera(
    new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1),
    camera
  )
  const visibleOrgans = organs.filter(o => o.visible)
  const hit = ray.intersectObjects(visibleOrgans, false)[0]
  if (hit) {
    const organId = hit.object.userData.organId
    if (organId && organId !== 'other') {
      emit('select', organId)
    }
  }
}

function animate() {
  if (disposed) return
  frame = requestAnimationFrame(animate)
  controls?.update()
  if (scene && camera) renderer?.render(scene, camera)
}

watch(() => props.selectedOrganId, updateSelection)
watch(rotating, value => { if (controls) controls.autoRotate = value })
watch(shell, value => shells.forEach(mesh => { mesh.visible = value }))

async function loadPatientOrgans() {
  if (!props.patientId) return
  try {
    for (const organKey of Object.keys(organNames)) {
      if (organKey === 'other') continue
      try {
        const res = await api<{ model: { source: string; available: boolean } }>(
          `/patients/${props.patientId}/organs/${organKey}`
        )
        if (res.model?.available && res.model.source !== 'default') {
          patientOrgans.value.add(organKey)
        }
      } catch {}
    }
    updateSelection()
  } catch {}
}

onMounted(async () => {
  try {
    if (!host.value) return
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    renderer.domElement.setAttribute('aria-label', '可旋转的三维人体器官导航')
    host.value.appendChild(renderer.domElement)

    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(39, 1, 0.05, 30)

    scene.add(new THREE.HemisphereLight(0xf5fbff, 0x6e8e86, 2.8))
    const key = new THREE.DirectionalLight(0xfff6eb, 3.6)
    key.position.set(-2, 3, 4)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0xb4e8e2, 3.0)
    rim.position.set(2, 1, -2)
    scene.add(rim)
    const fill = new THREE.DirectionalLight(0xffffff, 1.5)
    fill.position.set(0, -1, 3)
    scene.add(fill)

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.39, 0.40, 80),
      new THREE.MeshBasicMaterial({ color: 0xadc8c2, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    )
    ring.rotation.x = -Math.PI / 2
    ring.position.y = -1.21
    scene.add(ring)

    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(0.39, 80),
      new THREE.MeshBasicMaterial({ color: 0xcddcd6, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
    )
    disc.rotation.x = -Math.PI / 2
    disc.position.y = -1.212
    scene.add(disc)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.enablePan = false
    controls.minDistance = 2.0
    controls.maxDistance = 7
    controls.autoRotateSpeed = 0.7
    controls.minPolarAngle = 0.30
    controls.maxPolarAngle = Math.PI - 0.30
    reset()

    const resize = () => {
      if (!host.value || !renderer || !camera) return
      const { clientWidth: w, clientHeight: h } = host.value
      renderer.setSize(w, h)
      camera.aspect = w / Math.max(h, 1)
      camera.updateProjectionMatrix()
    }
    observer = new ResizeObserver(resize)
    observer.observe(host.value)
    resize()

    renderer.domElement.addEventListener('pointerdown', pointerDown)
    renderer.domElement.addEventListener('pointermove', pointerMove)
    renderer.domElement.addEventListener('pointerup', pointerUp)
    animate()

    const gltf = await new GLTFLoader().loadAsync('/models/anatomy-navigation.glb')
    if (disposed) {
      disposeObject(gltf.scene)
      return
    }

    gltf.scene.traverse(child => {
      if (!(child instanceof THREE.Mesh)) return
      const name = child.name.replace(/_\d+$/, '')

      if (name === 'body_shell') {
        shells.push(child)
        const m = child.material as THREE.MeshStandardMaterial
        m.transparent = true
        m.opacity = 0.22
        m.roughness = 0.22
        m.depthWrite = false
        m.side = THREE.DoubleSide
        child.renderOrder = 3
      } else {
        const category = getCategory(name)
        const zhName = getChineseName(name)
        const mainOrganId = mapToMainOrganId(name)

        child.userData.category = category
        child.userData.rawName = name
        child.userData.displayName = zhName
        child.userData.categoryLabel = categories.find(c => c.id === category)?.label || ''
        child.userData.organId = mainOrganId

        const m = child.material as THREE.MeshStandardMaterial
        m.side = THREE.DoubleSide
        m.roughness = 0.45
        m.metalness = 0.02
        organs.push(child)
      }
    })

    scene.add(gltf.scene)
    await loadPatientOrgans()
    updateCategoryVisibility()
    updateSelection()
    loading.value = false
  } catch (e) {
    if (!disposed) {
      loading.value = false
      error.value = e instanceof Error ? e.message : '三维视图加载失败'
    }
  }
})

onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(frame)
  observer?.disconnect()
  controls?.dispose()
  renderer?.domElement.removeEventListener('pointerdown', pointerDown)
  renderer?.domElement.removeEventListener('pointermove', pointerMove)
  renderer?.domElement.removeEventListener('pointerup', pointerUp)
  if (scene) disposeObject(scene)
  renderer?.dispose()
  renderer?.domElement.remove()
})
</script>

<template>
  <div class="anatomy-stage" :class="{ compact }">
    <!-- Category filter chips -->
    <div class="category-toolbar">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="cat-chip"
        :class="{ active: activeCategory === cat.id }"
        @click="setCategory(cat.id)"
      >
        {{ cat.label }}
      </button>
    </div>

    <div ref="host" class="anatomy-canvas" />

    <!-- Live hover tooltip -->
    <div v-if="hoveredName" class="hover-badge">
      <span class="badge-cat">{{ hoveredCategory }}</span>
      <strong>{{ hoveredName }}</strong>
    </div>

    <div class="anatomy-caption">
      <span>70+ ANATOMY ATLAS</span>
      <strong>{{ selectedOrganId && selectedOrganId !== 'other' ? $t(organNames[selectedOrganId]) : '临床 0.75mm 全实心解剖图谱' }}</strong>
      <small>
        <Sparkles v-if="hasPatientOrgans" :size="11" class="pulse-icon" />
        {{ hasPatientOrgans ? '已绑定患者专属 CT 重建 (FMRC)' : '100% 封闭实心 (Watertight) · 0.75mm 亚体素平滑' }}
      </small>
    </div>

    <div class="anatomy-tools">
      <button :class="{ active: shell }" aria-label="显示或隐藏人体外壳" :aria-pressed="shell" @click="shell = !shell">
        <Layers :size="16" />
      </button>
      <button :class="{ active: rotating }" aria-label="自动旋转人体" :aria-pressed="rotating" @click="rotating = !rotating">
        <Rotate3D :size="16" />
      </button>
      <button aria-label="恢复人体正面视角" @click="reset">
        <RotateCcw :size="16" />
      </button>
    </div>

    <span class="side-label patient-right">R</span>
    <span class="side-label patient-left">L</span>

    <p v-if="loading || error" :role="error ? 'alert' : 'status'" class="anatomy-state">
      {{ error || '正在载入 70 项 0.75mm 实心解剖大图谱…' }}
    </p>
    <div class="anatomy-hint">悬停探查解剖部位 · 拖动旋转 · 滚轮缩放</div>
  </div>
</template>

<style scoped>
.anatomy-stage {
  height: 600px;
  position: relative;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 45%, #ffffff 0%, #edf4ee 55%, #e1ebe6 100%);
  border-bottom: 1px solid var(--border);
}
.anatomy-stage.compact {
  height: 540px;
}
.anatomy-canvas {
  width: 100%;
  height: 100%;
  touch-action: none;
  cursor: grab;
}
.anatomy-canvas:active {
  cursor: grabbing;
}

.category-toolbar {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(10px);
  padding: 4px 8px;
  border-radius: 20px;
  border: 1px solid rgba(75, 140, 130, 0.2);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
  z-index: 10;
}
.cat-chip {
  background: transparent;
  border: none;
  font-size: 11.5px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 14px;
  color: #4a635f;
  cursor: pointer;
  transition: all 0.2s ease;
}
.cat-chip:hover {
  background: rgba(75, 140, 130, 0.12);
  color: #1e5953;
}
.cat-chip.active {
  background: #236b66;
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(35, 107, 102, 0.35);
}

.hover-badge {
  position: absolute;
  bottom: 45px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(26, 42, 40, 0.88);
  backdrop-filter: blur(8px);
  color: #ffffff;
  padding: 6px 14px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  pointer-events: none;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  animation: fadeIn 0.15s ease-out;
}
.badge-cat {
  font-size: 10.5px;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 8px;
  color: #7de8da;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, 6px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

.anatomy-caption {
  position: absolute;
  left: 20px;
  top: 18px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  pointer-events: none;
  z-index: 2;
}
.anatomy-caption span {
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  font-weight: 600;
}
.anatomy-caption strong {
  font-size: 17px;
  color: #1a3834;
  font-weight: 700;
}
.anatomy-caption small {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #236b66;
  font-weight: 500;
}
.pulse-icon {
  animation: pulse 1.8s infinite;
  color: #10b981;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

.anatomy-tools {
  position: absolute;
  right: 18px;
  top: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 2;
}
.anatomy-tools button {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid rgba(75, 140, 130, 0.25);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(8px);
  color: #2e4d48;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  transition: all 0.15s ease;
}
.anatomy-tools button:hover {
  background: #ffffff;
  color: #1b6059;
}
.anatomy-tools button.active {
  background: #236b66;
  color: #ffffff;
  border-color: #236b66;
}

.side-label {
  position: absolute;
  bottom: 18px;
  font-size: 11px;
  font-weight: 700;
  color: #799690;
  pointer-events: none;
}
.patient-right { left: 20px; }
.patient-left { right: 20px; }

.anatomy-state {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(247, 250, 248, 0.85);
  backdrop-filter: blur(4px);
  color: #27524d;
  font-size: 13px;
  font-weight: 500;
  z-index: 5;
}
.anatomy-hint {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10.5px;
  color: #74918a;
  letter-spacing: 0.05em;
  pointer-events: none;
}
</style>
