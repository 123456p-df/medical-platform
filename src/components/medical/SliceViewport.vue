<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { request } from '@/api/client'
import type { Examination, Finding } from '@/types'
import type { VolumeRenderer } from '@/utils/volumeRenderer'
import type { SliceAxis } from '@/utils/volumePixels'
import { positionToSlice, sliceToPosition } from '@/utils/sliceSync'
import { localPreview } from '@/utils/runtime'
import SyntheticSlice from './SyntheticSlice.vue'
const props = defineProps<{
  examination: Examination
  axis: SliceAxis
  preset: string
  zoom: number
  renderer: VolumeRenderer | null
  blocked?: boolean
  position?: number
  compact?: boolean
  findings?: Finding[]
}>()
const emit = defineEmits<{
  positionChange: [position: number]
  selectFinding: [id: string]
}>()
const slice = ref(0), displayed = ref(-1), canvas = ref<HTMLCanvasElement>(), stage = ref<HTMLDivElement>()
const error = ref(''), busy = ref(false), retry = ref(0)
const geometry = computed(() => {
  const shape = props.examination.shape || [1, 1, props.examination.sliceCount], spacing = props.examination.spacing || [1, 1, 1]
  const [x, y, z] = props.axis === 'axial' ? [0, 1, 2] : props.axis === 'coronal' ? [0, 2, 1] : [1, 2, 0]
  return { count: shape[z], width: shape[x] * spacing[x], height: shape[y] * spacing[y], spacing: spacing[z] }
})
const label = computed(() => ({axial: '轴向 · Axial', coronal: '冠状 · Coronal', sagittal: '矢状 · Sagittal'})[props.axis])
const syntheticPreset = computed(() => {
  if (props.preset === 'auto') return props.examination.type === 'MRI' ? 'brain' : 'lung'
  return props.preset as 'lung' | 'brain' | 'bone' | 'soft'
})
watch(() => props.examination.id, () => { slice.value = Math.floor(geometry.value.count / 2); displayed.value = -1 }, { immediate: true })
watch(() => props.position, value => {
  if (value === undefined) return
  const next = positionToSlice(value, geometry.value.count)
  if (next !== slice.value) slice.value = next
}, { immediate: true })
let controller: AbortController | undefined, frame = 0, revision = 0

function render() {
  const current = ++revision, index = slice.value
  controller?.abort(); cancelAnimationFrame(frame)
  if (localPreview) {
    displayed.value = index; busy.value = false; error.value = ''; return
  }
  if (props.blocked) {
    canvas.value?.getContext('2d')?.clearRect(0, 0, canvas.value.width, canvas.value.height)
    displayed.value = -1; busy.value = false; return
  }
  if (!canvas.value) return
  busy.value = true; error.value = ''
  // Coalesce slider/key-repeat updates into the next animation frame, with no debounce delay.
  frame = requestAnimationFrame(async () => {
    try {
      const context = canvas.value?.getContext('2d')
      if (!context || !canvas.value) return
      if (props.renderer) {
        const result = await props.renderer.render(props.axis, index, props.preset)
        if (!result || current !== revision || !canvas.value) return
        if (canvas.value.width !== result.width) canvas.value.width = result.width
        if (canvas.value.height !== result.height) canvas.value.height = result.height
        context.putImageData(new ImageData(result.pixels, result.width, result.height), 0, 0)
      } else {
        // Show an initial preview while the volume loads, keeping it until the next frame is decoded.
        const active = new AbortController(); controller = active
        const query = new URLSearchParams({ axis: props.axis })
        const windows: Record<string, [number, number]> = { lung: [-600,1500], soft: [40,400], bone: [400,1800], brain: [40,80] }
        if (windows[props.preset]) { const [center, width] = windows[props.preset]; query.set('window_center', String(center)); query.set('window_width', String(width)) }
        const response = await request('/medical-images/' + props.examination.id + '/slice/' + index + '?' + query, { signal: active.signal })
        const bitmap = await createImageBitmap(await response.blob())
        try {
          if (current !== revision || !canvas.value) return
          if (canvas.value.width !== bitmap.width) canvas.value.width = bitmap.width
          if (canvas.value.height !== bitmap.height) canvas.value.height = bitmap.height
          context.drawImage(bitmap, 0, 0)
        } finally { bitmap.close() }
      }
      if (current === revision) displayed.value = index
    } catch (e) { if (current === revision) error.value = e instanceof Error ? e.message : '加载失败' }
    finally { if (current === revision) busy.value = false }
  })
}
watch([() => props.examination.id, slice, () => props.preset, () => props.renderer, () => props.blocked, retry], render, { flush: 'post' })
onMounted(render)
function move(value: number) {
  const next = Math.min(geometry.value.count - 1, Math.max(0, value))
  slice.value = next
  emit('positionChange', sliceToPosition(next, geometry.value.count))
}
function scroll(event: WheelEvent) { if (event.deltaY) move(slice.value + Math.sign(event.deltaY)) }
function keydown(event: KeyboardEvent) {
  if (event.altKey || event.ctrlKey || event.metaKey) return
  const delta: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 }
  if (event.key in delta) { event.preventDefault(); move(slice.value + delta[event.key]) }
  else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); move(event.key === 'Home' ? 0 : geometry.value.count - 1) }
}
onBeforeUnmount(() => { revision++; controller?.abort(); cancelAnimationFrame(frame) })
</script>
<template>
  <div :class="['slice-viewport', axis, { compact }]" @keydown="keydown">
    <div class="pane-heading"><strong>{{ label }}</strong><span>{{ geometry.spacing.toFixed(2) }} mm</span></div>
    <div ref="stage" class="slice-stage" tabindex="0" :aria-label="label + '视图，方向键切层'" @wheel.prevent="scroll" @pointerdown="stage?.focus({ preventScroll: true })">
      <span class="orientation top">{{ axis === 'axial' ? 'A' : 'S' }}</span><span class="orientation bottom">{{ axis === 'axial' ? 'P' : 'I' }}</span><span class="orientation left">{{ axis === 'sagittal' ? 'A' : 'R' }}</span><span class="orientation right">{{ axis === 'sagittal' ? 'P' : 'L' }}</span>
      <div class="slice-fit" :style="{ aspectRatio: String(geometry.width / geometry.height), width: `min(100%, ${260 * geometry.width / geometry.height}px)`, transform: `scale(${zoom})` }">
        <SyntheticSlice
          v-if="localPreview"
          :modality="examination.type"
          :orientation="axis"
          :slice-index="slice"
          :slice-count="geometry.count"
          :preset="syntheticPreset"
          :findings="findings"
          @select-finding="emit('selectFinding', $event)"
        />
        <canvas v-else ref="canvas" role="img" :aria-label="examination.type + ' ' + axis + ' 切片'" :data-slice-index="displayed" :data-render-mode="renderer ? 'local' : 'preview'" />
      </div>
      <span v-if="busy && displayed < 0" class="slice-message">加载预览…</span><div v-if="error" role="alert" class="slice-message error">{{ error }}<button @click="retry++">重试</button></div>
      <small class="slice-caption">{{ displayed < 0 ? '—' : displayed + 1 }} / {{ geometry.count }}<span v-if="busy && !renderer && displayed >= 0"> · 定位 {{ slice + 1 }}…</span></small>
    </div>
    <div class="slice-controls"><button :disabled="slice === 0 || blocked" :aria-label="label + '上一层'" @click="move(slice - 1)"><ChevronLeft :size="14" /></button><input :value="slice" :disabled="blocked" :aria-label="label + '切片位置'" type="range" min="0" :max="geometry.count - 1" @input="move(Number(($event.target as HTMLInputElement).value))" /><button :disabled="slice >= geometry.count - 1 || blocked" :aria-label="label + '下一层'" @click="move(slice + 1)"><ChevronRight :size="14" /></button></div>
  </div>
</template>
<style scoped>
.slice-viewport{min-width:0;overflow:hidden;border:1px solid #293943;border-radius:9px;background:#0b151d}.pane-heading{display:flex;justify-content:space-between;align-items:center;border-top:2px solid #cc7a73;padding:10px 13px;color:#d9e7e7;font-size:11px}.coronal .pane-heading{border-color:#91bb9b}.sagittal .pane-heading{border-color:#cdb776}.pane-heading span{color:#7e999f;font-size:10px}.slice-stage{height:288px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#050b10;padding:14px}.compact .slice-stage{height:250px}.slice-stage:focus-visible{outline:2px solid #72aaa3;outline-offset:-3px}.slice-fit{max-height:260px;flex-shrink:0}.compact .slice-fit{max-height:225px}.slice-fit canvas{display:block;width:100%;height:100%}.orientation{position:absolute;z-index:2;color:#91aab0;font-size:10px;pointer-events:none}.top{top:6px;left:50%}.bottom{bottom:6px;left:50%}.left{top:50%;left:8px}.right{top:50%;right:8px}.slice-message{position:absolute;z-index:3;color:#d1e3e7;font-size:11px;padding:10px;background:#0f212bea;border-radius:6px;max-width:95%;text-align:center}.slice-message button{display:block;margin:10px auto 0}.slice-caption{position:absolute;bottom:10px;left:12px;color:#aac3c7;font-size:10px;background:#0a1e25bf;padding:3px 6px;border-radius:3px}.slice-controls{display:flex;align-items:center;gap:8px;padding:6px 10px}.slice-controls input{flex:1;min-width:0;accent-color:#72aaa3}.slice-controls button{border:0;background:none;color:#a9c1c5;padding:5px;display:flex}.slice-controls button:disabled{opacity:.3}
</style>
