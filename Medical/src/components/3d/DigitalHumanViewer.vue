<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { modelApi } from '@/api/models'
import type { OrganModel } from '@/types'

const props = withDefaults(
  defineProps<{
    selectedOrganId?: string | null
    compact?: boolean
  }>(),
  {
    selectedOrganId: null,
    compact: false,
  },
)

const emit = defineEmits<{
  select: [organId: string]
}>()

const hostRef = ref<HTMLDivElement | null>(null)
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let animationFrame = 0
let organMeshes: THREE.Mesh[] = []
let organMap = new Map<string, THREE.Mesh>()
let labels: THREE.Sprite[] = []
let bodyGroup: THREE.Group | null = null
let resizeObserver: ResizeObserver | null = null

const organPositions: Record<string, [number, number, number]> = {
  lung: [0, 0.55, 0.22],
  brain: [0, 1.18, 0],
  heart: [-0.14, 0.46, 0.2],
  liver: [0.16, 0.12, 0.22],
  kidney: [-0.22, -0.08, 0.23],
  bone: [0, -0.45, 0],
}

function createLabel(text: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 80
  const context = canvas.getContext('2d')
  if (!context) return null
  context.fillStyle = 'rgba(18, 37, 42, 0.86)'
  context.beginPath()
  context.roundRect(12, 12, 232, 56, 14)
  context.fill()
  context.fillStyle = '#ffffff'
  context.font = '600 25px Inter, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(text, 128, 42)

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  const material = new THREE.SpriteMaterial({
    map: texture,
    depthTest: false,
    transparent: true,
  })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(0.82, 0.26, 1)
  return sprite
}

function createBody() {
  const group = new THREE.Group()
  const shellMaterial = new THREE.MeshStandardMaterial({
    color: 0xe8f3f3,
    roughness: 0.78,
    metalness: 0.02,
    transparent: true,
    opacity: 0.34,
  })

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 48, 24), shellMaterial)
  head.position.set(0, 1.18, 0)
  head.scale.set(0.82, 1.04, 0.9)
  group.add(head)

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.44, 0.78, 8, 32), shellMaterial)
  torso.position.set(0, 0.34, 0)
  group.add(torso)

  const shoulderMaterial = shellMaterial.clone()
  const armGeometry = new THREE.CapsuleGeometry(0.13, 0.52, 4, 18)
  const leftArm = new THREE.Mesh(armGeometry, shoulderMaterial)
  leftArm.position.set(-0.65, 0.34, 0)
  leftArm.rotation.z = 0.18
  group.add(leftArm)
  const rightArm = new THREE.Mesh(armGeometry, shoulderMaterial)
  rightArm.position.set(0.65, 0.34, 0)
  rightArm.rotation.z = -0.18
  group.add(rightArm)

  const legGeometry = new THREE.CapsuleGeometry(0.2, 0.6, 4, 20)
  const leftLeg = new THREE.Mesh(legGeometry, shoulderMaterial)
  leftLeg.position.set(-0.2, -0.76, 0)
  group.add(leftLeg)
  const rightLeg = new THREE.Mesh(legGeometry, shoulderMaterial)
  rightLeg.position.set(0.2, -0.76, 0)
  group.add(rightLeg)

  return group
}

function createOrganMarkers(organs: OrganModel[]) {
  if (!scene) return
  organMeshes = []
  organMap.clear()
  labels = []

  organs.forEach((organ) => {
    const position = organPositions[organ.id] ?? [0, 0, 0]
    const geometry = new THREE.SphereGeometry(0.18, 32, 20)
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(organ.color),
      roughness: 0.48,
      metalness: 0.04,
      emissive: new THREE.Color(organ.color),
      emissiveIntensity: 0.08,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(...position)
    mesh.userData.organId = organ.id
    scene?.add(mesh)
    organMeshes.push(mesh)
    organMap.set(organ.id, mesh)

    const label = createLabel(organ.label)
    if (label) {
      label.position.set(position[0], position[1] + 0.42, position[2])
      scene?.add(label)
      labels.push(label)
    }
  })
}

function setSelectedOrgan(id: string | null) {
  organMap.forEach((mesh, organId) => {
    const material = mesh.material as THREE.MeshStandardMaterial
    material.emissiveIntensity = organId === id ? 0.5 : 0.08
    material.opacity = organId === id ? 1 : 0.82
  })
}

function updateSceneSize() {
  if (!hostRef.value || !renderer || !camera) return
  const width = hostRef.value.clientWidth
  const height = hostRef.value.clientHeight
  renderer.setSize(width, height)
  camera.aspect = width / Math.max(1, height)
  camera.updateProjectionMatrix()
}

function getPointer(event: PointerEvent) {
  if (!hostRef.value) return null
  const rect = hostRef.value.getBoundingClientRect()
  return new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  )
}

function onPointerDown(event: PointerEvent) {
  if (!camera || !scene) return
  const point = getPointer(event)
  if (!point) return
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(point, camera)
  const intersections = raycaster.intersectObjects(organMeshes, false)
  if (intersections[0]) {
    const organId = intersections[0].object.userData.organId as string
    emit('select', organId)
  }
}

function animate() {
  animationFrame = requestAnimationFrame(animate)
  if (controls) controls.update()
  if (bodyGroup) bodyGroup.rotation.y += 0.0025
  if (renderer && scene && camera) renderer.render(scene, camera)
}

async function init() {
  if (!hostRef.value) return
  const width = hostRef.value.clientWidth
  const height = hostRef.value.clientHeight

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  hostRef.value.appendChild(renderer.domElement)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf6fbfb)
  camera = new THREE.PerspectiveCamera(42, width / Math.max(1, height), 0.1, 100)
  camera.position.set(0, 0.2, 4.4)

  scene.add(new THREE.HemisphereLight(0xeef7f7, 0xb7cfd0, 2.2))
  const keyLight = new THREE.DirectionalLight(0xffffff, 3)
  keyLight.position.set(2, 3, 3)
  scene.add(keyLight)
  const rimLight = new THREE.DirectionalLight(0xbde2e3, 1.6)
  rimLight.position.set(-2, 0.4, -2)
  scene.add(rimLight)

  bodyGroup = createBody()
  scene.add(bodyGroup)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false
  controls.minDistance = 2.6
  controls.maxDistance = 7
  controls.target.set(0, 0.05, 0)
  controls.update()

  const organs = await modelApi.getOrganModels()
  createOrganMarkers(organs)
  setSelectedOrgan(props.selectedOrganId)

  renderer.domElement.addEventListener('pointerdown', onPointerDown)
  resizeObserver = new ResizeObserver(() => {
    updateSceneSize()
  })
  resizeObserver.observe(hostRef.value)
  animate()
}

watch(
  () => props.selectedOrganId,
  (id) => setSelectedOrgan(id),
)

onMounted(init)

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
  resizeObserver?.disconnect()
  renderer?.domElement.removeEventListener('pointerdown', onPointerDown)
  labels.forEach((sprite) => {
    sprite.material.map?.dispose()
    sprite.material.dispose()
  })
  organMeshes.forEach((mesh) => mesh.geometry.dispose())
  bodyGroup?.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose()
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose())
      } else {
        child.material.dispose()
      }
    }
  })
  controls?.dispose()
  renderer?.dispose()
  renderer?.domElement.remove()
})
</script>

<template>
  <div :class="['digital-human', { compact }]" ref="hostRef">
    <span class="scene-hint">Drag to rotate · Scroll to zoom</span>
  </div>
</template>

<style scoped>
.digital-human {
  position: relative;
  min-height: 480px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: #f6fbfb;
}

.digital-human.compact {
  min-height: 320px;
}

.scene-hint {
  position: absolute;
  z-index: 2;
  right: 12px;
  bottom: 10px;
  padding: 4px 8px;
  border-radius: 5px;
  background: rgb(24 47 51 / 68%);
  color: #ffffff;
  font-size: 10px;
  pointer-events: none;
}
</style>
