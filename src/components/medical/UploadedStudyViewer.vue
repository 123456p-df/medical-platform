<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw } from 'lucide-vue-next'
import { getLocalUploadFiles } from '@/api/localUploads'
import { isRasterFile } from '@/utils/studyLoader'
import type { Examination } from '@/types'

const CornerstoneViewer = defineAsyncComponent(() => import('./CornerstoneViewer.vue'))
const props = defineProps<{ examination: Examination }>()
const files = ref<File[]>([])
const urls = ref<string[]>([])
const slice = ref(0)
const zoom = ref(1)
const loading = ref(true)
const error = ref('')
let loadVersion = 0

const isRaster = computed(() => files.value.length > 0 && files.value.every(isRasterFile))

function revokeUrls() {
  urls.value.forEach(url => URL.revokeObjectURL(url))
  urls.value = []
}

async function loadStudy() {
  const version = ++loadVersion
  revokeUrls()
  files.value = []
  slice.value = 0
  zoom.value = 1
  loading.value = true
  error.value = ''
  try {
    const stored = await getLocalUploadFiles(props.examination.id)
    if (version !== loadVersion) return
    files.value = stored
    if (!stored.length) {
      error.value = '本地影像文件已不可用，请重新导入这项检查。'
    } else if (stored.every(isRasterFile)) {
      urls.value = stored.map(file => URL.createObjectURL(file))
    }
  } catch {
    if (version === loadVersion) error.value = '读取本地影像失败，请检查浏览器存储权限。'
  } finally {
    if (version === loadVersion) loading.value = false
  }
}

function changeSlice(delta: number) {
  slice.value = Math.min(files.value.length - 1, Math.max(0, slice.value + delta))
}

function resetView() {
  zoom.value = 1
  slice.value = 0
}

watch(() => props.examination.id, loadStudy, { immediate: true })
onBeforeUnmount(() => { loadVersion += 1; revokeUrls() })
</script>

<template>
  <section class="uploaded-viewer">
    <div class="uploaded-heading">
      <strong>{{ examination.type }}</strong>
      <span>本地导入影像</span>
      <span>{{ files.length || examination.sliceCount }} 张</span>
    </div>
    <div v-if="loading" class="empty-state dark">正在读取本地影像…</div>
    <div v-else-if="error" class="empty-state dark error" role="alert">{{ error }}</div>
    <template v-else-if="isRaster">
      <div class="image-tools">
        <button type="button" class="icon-btn" aria-label="上一张" :disabled="slice === 0" @click="changeSlice(-1)"><ChevronLeft :size="17" /></button>
        <span>{{ slice + 1 }} / {{ files.length }}</span>
        <button type="button" class="icon-btn" aria-label="下一张" :disabled="slice >= files.length - 1" @click="changeSlice(1)"><ChevronRight :size="17" /></button>
        <span class="divider" />
        <button type="button" class="icon-btn" aria-label="缩小" :disabled="zoom <= .25" @click="zoom = Math.max(.25, zoom - .25)"><Minus :size="17" /></button>
        <span>{{ Math.round(zoom * 100) }}%</span>
        <button type="button" class="icon-btn" aria-label="放大" :disabled="zoom >= 4" @click="zoom = Math.min(4, zoom + .25)"><Plus :size="17" /></button>
        <button type="button" class="btn btn-sm btn-secondary" :disabled="zoom === 1 && slice === 0" @click="resetView"><RotateCcw :size="15" /> 重置</button>
        <label v-if="files.length > 1">切片 <input v-model.number="slice" type="range" min="0" :max="files.length - 1" /></label>
      </div>
      <div class="raster-viewport">
        <img :src="urls[slice]" :alt="files[slice]?.name" :style="{ transform: `scale(${zoom})` }" @error="error = '这张图片无法显示。'" />
      </div>
      <div class="file-caption">{{ files[slice]?.name }}</div>
    </template>
    <CornerstoneViewer v-else-if="files.length" :key="examination.id" :files="files" />
  </section>
</template>

<style scoped>
.uploaded-viewer{overflow:hidden;min-height:520px;border:1px solid #2a3b44;border-radius:12px;background:#0d191e;color:#deeeef}.uploaded-heading{display:flex;align-items:center;gap:14px;padding:14px 18px;border-bottom:1px solid #2a3b40;font-size:11px}.uploaded-heading strong{padding:4px 8px;border-radius:5px;background:#27494b}.uploaded-heading>span:last-child{margin-left:auto;color:#a3babd}.empty-state.dark{min-height:520px;border:0;background:#0d191e;color:#a3babd}.empty-state.error{color:#ffb3b8}.image-tools{display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:10px 14px;color:#bfd1d3;font-size:11px}.image-tools button:disabled{opacity:.35}.image-tools label{display:flex;align-items:center;gap:8px;margin-left:auto}.image-tools label input{max-width:150px}.divider{width:1px;height:18px;background:#365057}.raster-viewport{display:flex;height:500px;align-items:center;justify-content:center;overflow:auto;background:#060b0e}.raster-viewport img{max-width:100%;max-height:100%;object-fit:contain;transition:transform 120ms ease}.file-caption{padding:11px;text-align:center;color:#a3babd;font-size:10px;overflow-wrap:anywhere}@media(max-width:650px){.image-tools label{width:100%;margin-left:0}.image-tools label input{max-width:none;flex:1}.raster-viewport{height:390px}}
</style>
