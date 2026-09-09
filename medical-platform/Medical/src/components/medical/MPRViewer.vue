<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue'
import { ScanLine, Minus, Plus, RotateCcw } from 'lucide-vue-next'
import type { Examination } from '@/types'
import SliceViewport from './SliceViewport.vue'
import { ApiError, request } from '@/api/client'
import { VolumeRenderer } from '@/utils/volumeRenderer'
import type { Shape3D } from '@/utils/volumePixels'
const props = defineProps<{ examination: Examination }>()
const preset = ref('auto'), zoom = ref(1)
const renderer = shallowRef<VolumeRenderer | null>(null), progress = ref(0), loading = ref(false), error = ref(''), blocked = ref(false), retry = ref(0)
watch(() => props.examination.id, () => { preset.value = props.examination.type === 'CT' ? 'lung' : 'auto'; zoom.value = 1 }, { immediate: true })
watch([() => props.examination.id, retry], async (_, __, onCleanup) => {
  renderer.value = null; loading.value = true; progress.value = 0; error.value = ''; blocked.value = false
  let disposed = false, engine: VolumeRenderer | undefined
  const guard = new AbortController()
  const imageId = props.examination.id
  function fail(reason: unknown) {
    if (disposed) return
    error.value = reason instanceof Error ? reason.message : '连续浏览加载失败，可重试'
    if (reason instanceof ApiError && [401, 403, 404].includes(reason.status)) blocked.value = true
    renderer.value = null; engine?.dispose(); loading.value = false
  }
  // A local volume only lives in this view; periodically recheck access while it is open.
  let checking = false
  const timer = setInterval(async () => {
    if (checking || disposed) return
    checking = true
    try { await request('/medical-images/' + imageId, { signal: guard.signal }) }
    catch (reason) { if (reason instanceof ApiError && [401, 403, 404].includes(reason.status)) fail(reason) }
    finally { checking = false }
  }, 30000)
  onCleanup(() => { disposed = true; clearInterval(timer); guard.abort(); engine?.dispose() })
  try {
    const shape = props.examination.shape
    if (!shape || shape.length !== 3) throw new Error('缺少三维体积信息，使用逐张预览')
    engine = new VolumeRenderer(fail)
    await engine.load(imageId, shape as Shape3D, value => { if (!disposed) progress.value = value })
    if (!disposed) { renderer.value = engine; loading.value = false }
  } catch (reason) { fail(reason) }
}, { immediate: true })
</script>
<template>
  <section class="mpr-viewer">
    <div class="mpr-toolbar"><div><ScanLine :size="18" /><strong>{{ examination.type }} · {{ $t(examination.organ) }}</strong><small>SLICER / MPR</small></div><div><select v-model="preset" aria-label="窗宽窗位预设"><option value="auto">自动窗宽</option><template v-if="examination.type === 'CT'"><option value="lung">肺窗</option><option value="soft">软组织</option><option value="bone">骨窗</option><option value="brain">脑窗</option></template></select><button aria-label="缩小" :disabled="zoom <= 1" @click="zoom = Math.max(1, zoom - .25)"><Minus :size="15" /></button><span>{{ Math.round(zoom * 100) }}%</span><button aria-label="放大" :disabled="zoom >= 3" @click="zoom = Math.min(3, zoom + .25)"><Plus :size="15" /></button><button aria-label="重置缩放" @click="zoom = 1"><RotateCcw :size="15" /></button></div></div>
    <div class="volume-status" role="status"><span v-if="loading">正在准备连续浏览 {{ progress }}% · 可先查看预览</span><span v-else-if="renderer">连续浏览已就绪 · 方向键 / 滚轮 / 拖动滑块</span><span v-else>{{ error }} <button v-if="!blocked" @click="retry++">重试连续浏览</button></span><progress v-if="loading" :value="progress" max="100" aria-label="影像加载进度" /></div>
    <div class="mpr-grid"><SliceViewport v-for="axis in (['axial','coronal','sagittal'] as const)" :key="examination.id + axis" :examination="examination" :axis="axis" :preset="preset" :zoom="zoom" :renderer="renderer" :blocked="blocked" /><aside class="study-info"><span class="info-symbol"><ScanLine :size="30" /></span><small>VOLUME INFORMATION</small><h3>{{ examination.type }} 三平面重建</h3><dl><dt>体素矩阵</dt><dd>{{ examination.shape?.join(' × ') || '—' }}</dd><dt>体素间距</dt><dd>{{ examination.spacing?.map(v => v.toFixed(3)).join(' × ') }} mm</dd><dt>浏览方向</dt><dd>RAS · 放射学视图</dd><dt>资料来源</dt><dd>当前患者上传影像</dd></dl><p>点击任一视图后，用方向键连续切层，或拖动滑块。Page Up / Down 跳转 10 层，Home / End 跳到首尾层。三个方向按实际体素间距显示比例。</p></aside></div>
  </section>
</template>
<style scoped>
.volume-status{display:flex;gap:12px;align-items:center;justify-content:space-between;padding:0 15px 13px;font-size:11px;color:#96c6b9;min-height:29px}.volume-status progress{width:100px;height:5px;accent-color:#72aaa3}.volume-status button{border:1px solid #487468;color:#acd6c8;background:transparent;border-radius:4px;margin-left:8px;padding:3px 7px;font-size:10px}
.mpr-viewer{background:#111e28;border:1px solid #2a3b44;border-radius:12px;overflow:hidden;color:#d2e4e7}.mpr-toolbar{display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap;padding:15px}.mpr-toolbar>div{display:flex;align-items:center;gap:9px}.mpr-toolbar strong{font-size:12px}.mpr-toolbar small{font-size:8px;letter-spacing:.12em;color:#7f9ba3}.mpr-toolbar select{background:#1c303a;color:#d2e4e7;border:1px solid #34505b;border-radius:5px;font-size:11px;padding:7px}.mpr-toolbar button{display:flex;border:0;background:none;color:#a7c4c7;padding:4px}.mpr-toolbar button:disabled{opacity:.3}.mpr-toolbar span{font-size:10px}.mpr-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;padding:0 10px 10px}.study-info{padding:24px 22px;border:1px solid #2a3b44;border-radius:9px;background:linear-gradient(145deg,#1c303a,#12212a);display:flex;flex-direction:column;align-items:flex-start}.info-symbol{color:#7caea7;background:#28433f;padding:9px;border-radius:10px;display:flex;margin-bottom:17px}.study-info>small{font-size:8px;letter-spacing:.18em;color:#82a79e}.study-info h3{color:#e0eae8;margin:8px 0 18px;font-size:16px}.study-info dl{width:100%;display:grid;grid-template-columns:80px 1fr;gap:11px;font-size:10px;margin:0}.study-info dt{color:#839da4}.study-info dd{margin:0;overflow-wrap:anywhere}.study-info p{font-size:10px;line-height:1.8;color:#90a7ad;margin-top:20px}@media(max-width:620px){.mpr-grid{grid-template-columns:1fr}.study-info{display:none}}
</style>
