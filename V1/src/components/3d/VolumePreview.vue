<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { Examination, Finding } from '@/types'

const props = withDefaults(
  defineProps<{
    examination: Examination
    findings?: Finding[]
    activeFindingId?: string | null
  }>(),
  {
    findings: () => [],
    activeFindingId: null,
  },
)

const emit = defineEmits<{
  selectFinding: [findingId: string]
}>()

const hostRef = ref<HTMLDivElement | null>(null)
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let animationFrame = 0
let markerMeshes: THREE.Mesh[] = []
let markerMap = new Map<string, THREE.Mesh>()
let resizeObserver: ResizeObserver | null = null

function markerPosition(finding: Finding) {
  const side = finding.side === 'right' ? 1 : -1
  const y = finding.location.includes('upper') ? 0.55 : finding.location.includes('lower') ? -0.55 : 0
  return new THREE.Vector3(side * 0.55, y, 0)
}

function buildScene() {
  if (!scene) return
  const bounds = new THREE.BoxGeometry(2.15, 2.15, 2.15)
  const edges = new THREE.EdgesGeometry(bounds)
  const frame = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0x9dc5c5, transparent: true, opacity: 0.34 }),
  )
  scene.add(frame)

  const axial = new THREE.Mesh(
    new THREE.PlaneGeometry(2.1, 2.1),
    new THREE.MeshBasicMaterial({ color: 0x4ba3a6, side: THREE.DoubleSide, transparent: true, opacity: 0.16 }),
  )
  axial.position.z = 0
  scene.add(axial)

  const coronal = new THREE.Mesh(
    new THREE.PlaneGeometry(2.1, 2.1),
    new THREE.MeshBasicMaterial({ color: 0x527bbf, side: THREE.DoubleSide, transparent: true, opacity: 0.12 }),
  )
  coronal.rotation.x = Math.PI / 2
  coronal.position.y = 0
  scene.add(coronal)

  const sagittal = new THREE.Mesh(
    new THREE.PlaneGeometry(2.1, 2.1),
    new THREE.MeshBasicMaterial({ color: 0xc5862f, side: THREE.DoubleSide, transparent: true, opacity: 0.1 }),
  )
  sagittal.rotation.y = Math.PI / 2
  sagittal.position.x = 0
  scene.add(sagittal)

  const markerGeometry = new THREE.SphereGeometry(0.09, 28, 18)
  const findings = props.findings ?? []
  findings.forEach((finding) => {
    const markerMaterial = new THREE.MeshStandardMaterial({
      color: 0xff4f5c,
      roughness: 0.3,
      emissive: 0xff2233,
      emissiveIntensity: 0.45,
    })
    const marker = new THREE.Mesh(markerGeometry, markerMaterial)
    marker.position.copy(markerPosition(finding))
    marker.userData.findingId = finding.id
    scene?.add(marker)
    markerMeshes.push(marker)
    markerMap.set(finding.id, marker)
  })
}

function setActiveFinding(id: string | null) {
  markerMap.forEach((mesh, findingId) => {
    const material = mesh.material as THREE.MeshStandardMaterial
    material.emissiveIntensity = findingId === id ? 1.1 : 0.45
    mesh.scale.setScalar(findingId === id ? 1.4 : 1)
  })
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
  if (!camera) return
  const point = getPointer(event)
  if (!point) return
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(point, camera)
  const intersections = raycaster.intersectObjects(markerMeshes, false)
  if (intersections[0]) {
    emit('selectFinding', intersections[0].object.userData.findingId as string)
  }
}

function updateSceneSize() {
  if (!hostRef.value || !renderer || !camera) return
  const width = hostRef.value.clientWidth
  const height = hostRef.value.clientHeight
  renderer.setSize(width, height)
  camera.aspect = width / Math.max(1, height)
  camera.updateProjectionMatrix()
}

function animate() {
  animationFrame = requestAnimationFrame(animate)
  if (controls) controls.update()
  if (renderer && scene && camera) renderer.render(scene, camera)
}

function init() {
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
  scene.background = new THREE.Color(0x0c1719)
  camera = new THREE.PerspectiveCamera(38, width / Math.max(1, height), 0.1, 100)
  camera.position.set(2.4, 2.1, 3.2)

  scene.add(new THREE.HemisphereLight(0xeef7f7, 0x667b7c, 1.8))
  const light = new THREE.DirectionalLight(0xffffff, 3)
  light.position.set(2, 3, 3)
  scene.add(light)

  buildScene()
  setActiveFinding(props.activeFindingId)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false
  controls.minDistance = 2.5
  controls.maxDistance = 7
  controls.target.set(0, 0, 0)
  controls.update()

  renderer.domElement.addEventListener('pointerdown', onPointerDown)
  resizeObserver = new ResizeObserver(updateSceneSize)
  resizeObserver.observe(hostRef.value)
  animate()
}

watch(
  () => props.activeFindingId,
  (id) => setActiveFinding(id),
)

watch(
  () => props.findings,
  () => {
    markerMeshes.forEach((mesh) => scene?.remove(mesh))
    markerMap.clear()
    markerMeshes = []
    buildScene()
    setActiveFinding(props.activeFindingId)
  },
  { deep: true },
)

onMounted(init)

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
  resizeObserver?.disconnect()
  renderer?.domElement.removeEventListener('pointerdown', onPointerDown)
  markerMeshes.forEach((mesh) => {
    mesh.geometry.dispose()
    ;(mesh.material as THREE.Material).dispose()
  })
  scene?.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
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
  <div ref="hostRef" class="volume-preview">
    <span class="scene-hint">{{ $t("3D volume preview") }}</span>
  </div>
</template>

<style scoped>
.volume-preview {
  position: relative;
  min-height: 100%;
  overflow: hidden;
  border-radius: var(--radius);
  background: #0c1719;
}

.scene-hint {
  position: absolute;
  z-index: 2;
  right: 10px;
  bottom: 9px;
  padding: 4px 7px;
  border-radius: 5px;
  background: rgb(10 22 25 / 72%);
  color: #d9eceb;
  font-size: 10px;
  pointer-events: none;
}
</style>
