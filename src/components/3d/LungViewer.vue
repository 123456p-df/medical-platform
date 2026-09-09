<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { Finding } from '@/types'

const props = withDefaults(
  defineProps<{
    findings: Finding[]
    activeFindingId?: string | null
  }>(),
  {
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

function createLungs() {
  if (!scene) return
  const material = new THREE.MeshStandardMaterial({
    color: 0xe87988,
    roughness: 0.62,
    metalness: 0.02,
  })
  const leftLung = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 40), material)
  leftLung.position.set(-0.72, 0.05, 0)
  leftLung.scale.set(0.58, 1.25, 0.66)
  scene.add(leftLung)

  const rightLung = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 40), material.clone())
  rightLung.position.set(0.76, 0.05, 0)
  rightLung.scale.set(0.66, 1.34, 0.72)
  scene.add(rightLung)

  const airwayMaterial = new THREE.MeshStandardMaterial({
    color: 0x79a9aa,
    roughness: 0.7,
  })
  const trachea = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1, 24), airwayMaterial)
  trachea.position.set(0, 0.85, 0.06)
  scene.add(trachea)

  const leftBronchus = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.72, 24), airwayMaterial)
  leftBronchus.position.set(-0.26, 0.34, 0.18)
  leftBronchus.rotation.z = 0.7
  scene.add(leftBronchus)
  const rightBronchus = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.72, 24), airwayMaterial)
  rightBronchus.position.set(0.3, 0.34, 0.18)
  rightBronchus.rotation.z = -0.7
  scene.add(rightBronchus)

  return { leftLung, rightLung, trachea, leftBronchus, rightBronchus }
}

function markerPosition(finding: Finding) {
  const side = finding.side === 'right' ? 1 : -1
  const y = finding.location.includes('upper') ? 0.78 : finding.location.includes('lower') ? -0.55 : 0
  const z = 0.72
  return new THREE.Vector3(side * 0.88, y, z)
}

function createMarkers(findings: Finding[]) {
  const currentScene = scene
  if (!currentScene) return
  markerMap.clear()
  markerMeshes = []

  findings.forEach((finding) => {
    const geometry = new THREE.SphereGeometry(0.14, 28, 18)
    const material = new THREE.MeshStandardMaterial({
      color: 0xff4f5c,
      roughness: 0.28,
      emissive: 0xff2233,
      emissiveIntensity: 0.5,
    })
    const marker = new THREE.Mesh(geometry, material)
    marker.position.copy(markerPosition(finding))
    marker.userData.findingId = finding.id
    currentScene.add(marker)
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
    const findingId = intersections[0].object.userData.findingId as string
    emit('selectFinding', findingId)
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
  scene.background = new THREE.Color(0xf6fbfb)
  camera = new THREE.PerspectiveCamera(40, width / Math.max(1, height), 0.1, 100)
  camera.position.set(0, 0.25, 4.6)

  scene.add(new THREE.HemisphereLight(0xeef7f7, 0xc7d6d6, 2.2))
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.8)
  keyLight.position.set(2, 2, 3)
  scene.add(keyLight)
  const fillLight = new THREE.DirectionalLight(0xcfeeee, 1.7)
  fillLight.position.set(-2, 0, -2)
  scene.add(fillLight)

  createLungs()
  createMarkers(props.findings)
  setActiveFinding(props.activeFindingId)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false
  controls.minDistance = 2.5
  controls.maxDistance = 8
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
  (findings) => {
    markerMeshes.forEach((mesh) => scene?.remove(mesh))
    markerMap.clear()
    createMarkers(findings)
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
  <div ref="hostRef" class="lung-viewer">
    <span class="scene-hint">Drag to rotate · Scroll to zoom</span>
  </div>
</template>

<style scoped>
.lung-viewer {
  position: relative;
  min-height: 470px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: #f6fbfb;
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
