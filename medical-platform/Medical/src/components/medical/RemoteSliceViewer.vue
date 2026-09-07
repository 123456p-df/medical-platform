<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { ChevronLeft, ChevronRight, ScanLine } from 'lucide-vue-next'
import { request } from '@/api/client'
import type { Examination } from '@/types'
const props = defineProps<{ examination: Examination }>()
const slice = ref(0), preset = ref('auto'), url = ref(''), error = ref(''), busy = ref(false)
let controller: AbortController | undefined
watch(() => props.examination.id, () => { slice.value = Math.floor(props.examination.sliceCount / 2) }, { immediate: true })
watch([() => props.examination.id, slice, preset], async (_, __, onCleanup) => {
  controller = new AbortController()
  const active = controller
  onCleanup(() => active.abort())
  busy.value = true; error.value = ''
  if (url.value) URL.revokeObjectURL(url.value)
  url.value = ''
  const windows: Record<string, string> = { auto: '', lung: '?window_center=-600&window_width=1500',
    soft: '?window_center=40&window_width=400', bone: '?window_center=400&window_width=1800' }
  try {
    const result = await request('/medical-images/' + props.examination.id + '/slice/' + slice.value + windows[preset.value], { signal: active.signal })
    const blob = await result.blob()
    if (!active.signal.aborted) url.value = URL.createObjectURL(blob)
  } catch (reason) {
    if (!active.signal.aborted) error.value = reason instanceof Error ? reason.message : '加载切片失败'
  } finally { if (!active.signal.aborted) busy.value = false }
}, { immediate: true })
onBeforeUnmount(() => { controller?.abort(); if (url.value) URL.revokeObjectURL(url.value) })
</script>
<template>
  <div class="slice-viewer">
    <div class="slice-toolbar">
      <span><ScanLine :size="16" /> {{ examination.type }} · {{ examination.organ }} · Axial</span>
      <select v-model="preset" class="select" aria-label="Window preset"><option value="auto">Auto window</option><option value="lung">Lung</option><option value="soft">Soft tissue</option><option value="bone">Bone</option></select>
    </div>
    <div class="slice-stage">
      <span class="orientation left">R</span><span class="orientation right">L</span>
      <img v-if="url" :src="url" alt="Authorized axial medical image slice" />
      <span v-if="busy" class="slice-message">Loading slice…</span>
      <span v-if="error" role="alert" class="slice-message">{{ error }}</span>
      <span class="slice-caption">Slice {{ slice + 1 }} / {{ examination.sliceCount }}</span>
    </div>
    <div class="slice-controls">
      <button class="btn btn-secondary" :disabled="slice === 0" aria-label="Previous slice" @click="slice--"><ChevronLeft :size="16" /></button>
      <input v-model.number="slice" aria-label="Slice index" type="range" min="0" :max="examination.sliceCount - 1" />
      <button class="btn btn-secondary" :disabled="slice >= examination.sliceCount - 1" aria-label="Next slice" @click="slice++"><ChevronRight :size="16" /></button>
    </div>
  </div>
</template>
<style scoped>
.slice-viewer { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
.slice-toolbar { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:#eef5f5; gap:12px; }
.slice-toolbar span { display:flex; align-items:center; gap:8px; font-size:12px; font-weight:650; }
.slice-stage { position:relative; display:grid; place-items:center; height:440px; background:#101b24; color:#cce0e1; }
.slice-stage img { width:100%; height:100%; max-height:440px; object-fit:contain; image-rendering:auto; }
.orientation { position:absolute; top:50%; font-size:13px; z-index:1; }.left {left:16px}.right{right:16px}
.slice-message {position:absolute; padding:16px; text-align:center}.slice-caption{position:absolute;bottom:16px;left:16px;font-size:11px;background:#15232bcc;padding:5px 9px;border-radius:4px}
.slice-controls {display:flex; gap:14px; align-items:center;padding:12px 16px;background:#f6faf9}.slice-controls input{flex:1;accent-color:var(--accent)}
</style>
