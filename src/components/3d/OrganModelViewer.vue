<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { api, request } from '@/api/client'
const props = defineProps<{ patientId: string; organId: string }>()
const host = ref<HTMLDivElement | null>(null), status = ref('Loading organ model…'), source = ref('')
let renderer: THREE.WebGLRenderer | undefined, controls: OrbitControls | undefined
let scene: THREE.Scene, camera: THREE.PerspectiveCamera, model: THREE.Group | undefined
let frame = 0, version = 0, observer: ResizeObserver | undefined
function dispose(object: THREE.Object3D) {
  object.traverse(child => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose()
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach(m => { if ('map' in m && m.map instanceof THREE.Texture) m.map.dispose(); m.dispose() })
    }
  })
}
async function load() {
  if (!scene || !props.patientId) return
  const revision = ++version
  if (model) { scene.remove(model); dispose(model); model = undefined }
  status.value = 'Loading organ model…'; source.value = ''
  try {
    const organ = await api<{ model: { model_id: string; source: string; available: boolean } }>('/patients/' + props.patientId + '/organs/' + props.organId)
    if (revision !== version) return
    source.value = organ.model.source === 'default' ? 'Default reference model' : 'Patient segmentation'
    if (!organ.model.available) { status.value = '该器官尚未配置模型资源。'; return }
    const response = await request('/organ-models/' + organ.model.model_id + '/file')
    const buffer = await response.arrayBuffer()
    const gltf = await new GLTFLoader().parseAsync(buffer, '')
    if (revision !== version) { dispose(gltf.scene); return }
    model = gltf.scene
    const box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3())
    model.position.sub(center)
    model.scale.setScalar(2.8 / Math.max(size.x, size.y, size.z, 0.00001))
    // Scale the offset as well so meshes expressed in patient coordinates are centered.
    model.position.multiplyScalar(model.scale.x)
    scene.add(model); status.value = ''
    controls?.reset()
  } catch (reason) { if (revision === version) status.value = reason instanceof Error ? reason.message : '模型加载失败' }
}
onMounted(() => {
  if (!host.value) return
  try {
    scene = new THREE.Scene(); scene.background = new THREE.Color('#f0f7f7')
    renderer = new THREE.WebGLRenderer({ antialias:true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.outputColorSpace = THREE.SRGBColorSpace
    host.value.appendChild(renderer.domElement)
    camera = new THREE.PerspectiveCamera(40, 1, 0.01, 100); camera.position.set(0, 0.3, 5.5)
    controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.saveState()
    scene.add(new THREE.HemisphereLight(0xffffff, 0x79918f, 1.6))
    const light = new THREE.DirectionalLight(0xffffff, 2.1); light.position.set(3, 4, 5); scene.add(light)
    observer = new ResizeObserver(() => {
      if (!host.value || !renderer) return
      const width = host.value.clientWidth, height = host.value.clientHeight
      renderer.setSize(width, height); camera.aspect = width / Math.max(height,1); camera.updateProjectionMatrix()
    }); observer.observe(host.value)
    const animate = () => { frame = requestAnimationFrame(animate); controls?.update(); renderer?.render(scene,camera) }; animate()
    void load()
  } catch { status.value = 'WebGL 无法启动，请在支持 WebGL 的浏览器中打开。' }
})
watch(() => [props.patientId, props.organId], load)
onBeforeUnmount(() => { version++; cancelAnimationFrame(frame); observer?.disconnect(); controls?.dispose(); if (model) dispose(model); renderer?.dispose(); renderer?.domElement.remove() })
</script>
<template>
  <div class="organ-render">
    <div ref="host" class="model-canvas" />
    <div v-if="status" class="model-status" role="status">{{ status }}</div>
    <span v-if="source" class="model-source">{{ source }} · Drag to rotate / scroll to zoom</span>
  </div>
</template>
<style scoped>
.organ-render{position:relative;min-height:440px;border-radius:10px;overflow:hidden;border:1px solid var(--border);background:#f0f7f7}
.model-canvas{height:440px;width:100%}.model-status{position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:30px;pointer-events:none;color:var(--text-muted)}
.model-source{position:absolute;bottom:12px;left:12px;right:12px;font-size:11px;color:#43656a;background:#ffffffd9;border-radius:5px;padding:7px 10px;pointer-events:none}
</style>
