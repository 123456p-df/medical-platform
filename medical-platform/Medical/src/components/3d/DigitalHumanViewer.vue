<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RotateCcw, Rotate3D, Layers } from 'lucide-vue-next'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { organNames } from '@/api/mappers'
const props = withDefaults(defineProps<{selectedOrganId?: string | null; compact?: boolean}>(), {selectedOrganId: null, compact: false})
const emit = defineEmits<{select: [organId: string]}>()
const host = ref<HTMLDivElement>(), loading = ref(true), error = ref(''), rotating = ref(false), shell = ref(true)
let renderer: THREE.WebGLRenderer | undefined, scene: THREE.Scene | undefined, camera: THREE.PerspectiveCamera | undefined
let controls: OrbitControls | undefined, observer: ResizeObserver | undefined, frame = 0, disposed = false
const organs: THREE.Mesh[] = [], shells: THREE.Mesh[] = []
let down: {x: number; y: number} | null = null
function disposeObject(object: THREE.Object3D) {
  object.traverse(child => { if (child instanceof THREE.Mesh) { child.geometry.dispose(); const materials = Array.isArray(child.material) ? child.material : [child.material]; materials.forEach(m => m.dispose()) } })
}
function updateSelection() {
  for (const mesh of organs) {
    const material = mesh.material as THREE.MeshStandardMaterial, selected = mesh.userData.organId === props.selectedOrganId
    material.emissive.set(selected ? 0x483425 : 0x000000)
    material.emissiveIntensity = selected ? .25 : 0
    material.opacity = !props.selectedOrganId || props.selectedOrganId === 'other' || selected ? 1 : .82
    material.transparent = material.opacity < 1
    material.depthWrite = !material.transparent
  }
}
function reset() { camera?.position.set(0,.30,4.65); controls?.target.set(0,.27,0); controls?.update() }
function pointerDown(e: PointerEvent) { down = {x: e.clientX, y: e.clientY} }
function pointerUp(e: PointerEvent) {
  if (!down || Math.hypot(e.clientX-down.x,e.clientY-down.y)>5 || !camera || !renderer) return
  down = null
  const r=renderer.domElement.getBoundingClientRect(), ray=new THREE.Raycaster()
  ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1, -(e.clientY-r.top)/r.height*2+1),camera)
  const hit=ray.intersectObjects(organs,false)[0]
  if(hit) emit('select',hit.object.userData.organId)
}
function animate() { if(disposed)return; frame=requestAnimationFrame(animate); controls?.update(); if(scene&&camera) renderer?.render(scene,camera) }
watch(() => props.selectedOrganId, updateSelection)
watch(rotating, value => { if(controls) controls.autoRotate=value })
watch(shell,value => shells.forEach(mesh => { mesh.visible=value }))
onMounted(async () => {
  try {
    if(!host.value)return
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2))
    renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95
    renderer.domElement.setAttribute('aria-label','可旋转的三维人体器官导航')
    host.value.appendChild(renderer.domElement)
    scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(39,1,.05,30)
    scene.add(new THREE.HemisphereLight(0xf4fbff,0x71938b,2.5))
    const key=new THREE.DirectionalLight(0xffeee1,3.2);key.position.set(-2,3,4);scene.add(key)
    const rim=new THREE.DirectionalLight(0xb9eee8,3);rim.position.set(2,1,-2);scene.add(rim)
    const fill=new THREE.DirectionalLight(0xffffff,1.2);fill.position.set(0,-1,3);scene.add(fill)
    const ring=new THREE.Mesh(new THREE.RingGeometry(.39,.40,80),new THREE.MeshBasicMaterial({color:0xadc8c2,transparent:true,opacity:.7,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=-1.21;scene.add(ring)
    const disc=new THREE.Mesh(new THREE.CircleGeometry(.39,80),new THREE.MeshBasicMaterial({color:0xcddcd6,transparent:true,opacity:.25,side:THREE.DoubleSide}));disc.rotation.x=-Math.PI/2;disc.position.y=-1.212;scene.add(disc)
    controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false
    controls.minDistance=2.3;controls.maxDistance=7;controls.autoRotateSpeed=.7;controls.minPolarAngle=.35;controls.maxPolarAngle=Math.PI-.35;reset()
    const resize=()=> {if(!host.value||!renderer||!camera)return;const {clientWidth:w,clientHeight:h}=host.value;renderer.setSize(w,h);camera.aspect=w/Math.max(h,1);camera.updateProjectionMatrix()}
    observer=new ResizeObserver(resize);observer.observe(host.value);resize()
    renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',pointerUp)
    animate()
    const gltf=await new GLTFLoader().loadAsync('/models/anatomy-navigation.glb')
    if(disposed){disposeObject(gltf.scene);return}
    gltf.scene.traverse(child=> {
      if(!(child instanceof THREE.Mesh))return
      const name=child.name.replace(/_\d+$/,'')
      if(name==='body_shell'||name==='spine') {
        shells.push(child);const m=child.material as THREE.MeshStandardMaterial;m.transparent=true;m.opacity=name==='body_shell'?.30:.35;m.depthWrite=false;m.side=THREE.DoubleSide;child.renderOrder=2
      } else if(name.startsWith('eye_') || organNames[name]) { child.userData.organId=name.startsWith('eye_') ? 'eye' : name;organs.push(child) }
    })
    scene.add(gltf.scene);updateSelection();loading.value=false
  } catch(e) { if(!disposed){loading.value=false;error.value=e instanceof Error?e.message:'三维视图加载失败'} }
})
onBeforeUnmount(()=> {disposed=true;cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose();renderer?.domElement.removeEventListener('pointerdown',pointerDown);renderer?.domElement.removeEventListener('pointerup',pointerUp);if(scene)disposeObject(scene);renderer?.dispose();renderer?.domElement.remove()})
</script>
<template>
  <div class="anatomy-stage" :class="{compact}">
    <div ref="host" class="anatomy-canvas" />
    <div class="anatomy-caption"><span>ANATOMY ATLAS</span><strong>{{ selectedOrganId ? $t(organNames[selectedOrganId]) : '数字人体' }}</strong><small>器官导航示意模型</small></div>
    <div class="anatomy-tools"><button :class="{active: shell}" aria-label="显示或隐藏人体外壳" :aria-pressed="shell" @click="shell=!shell"><Layers :size="16" /></button><button :class="{active: rotating}" aria-label="自动旋转人体" :aria-pressed="rotating" @click="rotating=!rotating"><Rotate3D :size="16" /></button><button aria-label="恢复人体正面视角" @click="reset"><RotateCcw :size="16" /></button></div>
    <span class="side-label patient-right">R</span><span class="side-label patient-left">L</span>
    <p v-if="loading || error" :role="error ? 'alert' : 'status'" class="anatomy-state">{{ error || '正在加载精细人体模型…' }}</p>
    <div class="anatomy-hint">拖动旋转 · 滚轮缩放 · 点击器官</div>
  </div>
</template>
<style scoped>
.anatomy-stage{height:570px;position:relative;overflow:hidden;background:radial-gradient(ellipse at 50% 45%,#fff 0,#f0f5ef 55%,#e4ede9 100%);border-bottom:1px solid var(--border)}.anatomy-stage.compact{height:530px}.anatomy-canvas{position:absolute;inset:0}.anatomy-caption{position:absolute;top:18px;left:19px;display:grid;gap:6px;pointer-events:none}.anatomy-caption span{font-size:8px;letter-spacing:.18em;color:#71958c}.anatomy-caption strong{font-size:18px;color:#294e45}.anatomy-caption small{font-size:10px;color:#80998e}.anatomy-tools{position:absolute;right:12px;top:17px;display:grid;gap:6px}.anatomy-tools button{display:grid;place-items:center;background:#ffffffa6;border:1px solid #d5e1da;color:#76908a;border-radius:7px;padding:8px}.anatomy-tools button.active{color:#367365;background:#e5f0e8}.anatomy-hint{position:absolute;bottom:13px;left:0;right:0;text-align:center;color:#78938b;font-size:10px;pointer-events:none}.side-label{position:absolute;top:44%;font-size:11px;color:#89a299;pointer-events:none}.patient-right{left:20px}.patient-left{right:20px}.anatomy-state{position:absolute;top:45%;left:20px;right:20px;text-align:center;font-size:12px;background:#eef6efdf;padding:12px;color:#426b5e}
</style>
