<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw } from 'lucide-vue-next'
import { niftiVoxelValue, readNiftiVolume, type NiftiVolume } from '@/utils/nifti'
import { t } from '@/i18n'

const props = defineProps<{ file: File }>()
const canvas = ref<HTMLCanvasElement>()
const volume = ref<NiftiVolume | null>(null)
const slice = ref(0)
const zoom = ref(1)
const windowCenter = ref(0)
const windowWidth = ref(1)
const loading = ref(true)
const error = ref('')
let loadVersion = 0

function renderSlice() {
  const target = canvas.value
  const source = volume.value
  if (!target || !source) return
  const [width, height] = source.shape
  if (target.width !== width) target.width = width
  if (target.height !== height) target.height = height
  const context = target.getContext('2d')
  if (!context) {
    error.value = t('ui.viewer.niftiCanvasFailed')
    return
  }
  const pixels = context.createImageData(width, height)
  const low = windowCenter.value - Math.max(windowWidth.value, 1) / 2
  const scale = 255 / Math.max(windowWidth.value, 1)
  const sliceOffset = slice.value * width * height
  for (let outputY = 0; outputY < height; outputY += 1) {
    const sourceY = height - outputY - 1
    for (let x = 0; x < width; x += 1) {
      const value = niftiVoxelValue(source, sliceOffset + sourceY * width + x)
      const gray = Number.isFinite(value) ? Math.max(0, Math.min(255, Math.round((value - low) * scale))) : 0
      const output = (outputY * width + x) * 4
      pixels.data[output] = gray
      pixels.data[output + 1] = gray
      pixels.data[output + 2] = gray
      pixels.data[output + 3] = 255
    }
  }
  context.putImageData(pixels, 0, 0)
}

async function load() {
  const version = ++loadVersion
  loading.value = true
  error.value = ''
  volume.value = null
  try {
    const loaded = await readNiftiVolume(props.file)
    if (version !== loadVersion) return
    volume.value = loaded
    slice.value = Math.floor(loaded.shape[2] / 2)
    windowCenter.value = loaded.windowCenter
    windowWidth.value = loaded.windowWidth
    zoom.value = 1
    await nextTick()
    renderSlice()
  } catch (reason) {
    if (version === loadVersion) error.value = reason instanceof Error ? reason.message : t('ui.viewer.niftiReadFailed')
  } finally {
    if (version === loadVersion) loading.value = false
  }
}

function changeSlice(delta: number) {
  if (!volume.value) return
  slice.value = Math.max(0, Math.min(volume.value.shape[2] - 1, slice.value + delta))
}

function resetView() {
  if (!volume.value) return
  slice.value = Math.floor(volume.value.shape[2] / 2)
  windowCenter.value = volume.value.windowCenter
  windowWidth.value = volume.value.windowWidth
  zoom.value = 1
}

watch(() => props.file, load, { immediate: true })
watch([slice, windowCenter, windowWidth], () => void nextTick(renderSlice))
onBeforeUnmount(() => { loadVersion += 1 })
</script>

<template>
  <div class="nifti-viewer">
    <div v-if="loading" class="nifti-state">{{ $t('ui.viewer.niftiLoading') }}</div>
    <div v-else-if="error" class="nifti-state is-error" role="alert">{{ error }}</div>
    <template v-else-if="volume">
      <div class="nifti-tools">
        <button type="button" class="icon-btn" :aria-label="$t('ui.viewer.previousSlice')" :disabled="slice === 0" @click="changeSlice(-1)"><ChevronLeft :size="17" /></button>
        <span>{{ slice + 1 }} / {{ volume.shape[2] }}</span>
        <button type="button" class="icon-btn" :aria-label="$t('ui.viewer.nextSlice')" :disabled="slice >= volume.shape[2] - 1" @click="changeSlice(1)"><ChevronRight :size="17" /></button>
        <label>{{ $t('ui.viewer.windowCenter') }} <input v-model.number="windowCenter" type="number" step="1" /></label>
        <label>{{ $t('ui.viewer.windowWidth') }} <input v-model.number="windowWidth" type="number" min="1" step="1" /></label>
        <button type="button" class="icon-btn" :aria-label="$t('Zoom out')" :disabled="zoom <= .25" @click="zoom = Math.max(.25, zoom - .25)"><Minus :size="17" /></button>
        <span>{{ Math.round(zoom * 100) }}%</span>
        <button type="button" class="icon-btn" :aria-label="$t('Zoom in')" :disabled="zoom >= 4" @click="zoom = Math.min(4, zoom + .25)"><Plus :size="17" /></button>
        <button type="button" class="btn btn-sm btn-secondary" @click="resetView"><RotateCcw :size="15" /> {{ $t('Reset') }}</button>
      </div>
      <label class="slice-control">
        <span>{{ $t('Slice') }}</span>
        <input v-model.number="slice" type="range" min="0" :max="volume.shape[2] - 1" />
      </label>
      <div class="nifti-viewport">
        <canvas ref="canvas" :aria-label="$t('ui.viewer.niftiSliceLabel', { current: slice + 1, total: volume.shape[2] })" :style="{ transform: `scale(${zoom})` }" />
      </div>
      <div class="nifti-caption">
        <span>{{ file.name }}</span>
        <span>{{ volume.shape.join(' × ') }} · {{ volume.spacing.map(value => value.toFixed(2)).join(' × ') }} mm · {{ volume.datatype }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.nifti-viewer{display:grid;min-height:500px;background:#060b0e}.nifti-state{display:grid;min-height:500px;place-items:center;color:#a3babd}.nifti-state.is-error{color:#ffb3b8}.nifti-tools{display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:10px 14px;color:#bfd1d3;font-size:11px}.nifti-tools button:disabled{opacity:.35}.nifti-tools label{display:flex;align-items:center;gap:5px}.nifti-tools label:first-of-type{margin-left:auto}.nifti-tools input[type="number"]{width:78px;padding:5px;border:1px solid #365057;border-radius:5px;background:#102228;color:#deeeef}.slice-control{display:flex;align-items:center;gap:10px;padding:0 14px 10px;color:#a3babd;font-size:10px}.slice-control input{min-width:0;flex:1}.nifti-viewport{display:flex;height:450px;align-items:center;justify-content:center;overflow:auto;background:#020506}.nifti-viewport canvas{max-width:100%;max-height:100%;image-rendering:auto;transition:transform 120ms ease}.nifti-caption{display:flex;justify-content:space-between;gap:12px;padding:11px 14px;color:#a3babd;font-size:10px;overflow-wrap:anywhere}@media(max-width:720px){.nifti-tools label:first-of-type{margin-left:0}.nifti-tools label{width:calc(50% - 5px)}.nifti-caption{flex-direction:column}.nifti-viewport{height:380px}}
</style>
