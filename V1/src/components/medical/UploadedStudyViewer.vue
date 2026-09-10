<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { Minus, Plus, RotateCcw } from 'lucide-vue-next'
import { getUploadedFiles } from '@/api/uploads'
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
let disposed = false
const isRaster = computed(() => files.value.length > 0 && files.value.every(isRasterFile))

onMounted(async () => {
  try {
    const stored = await getUploadedFiles(props.examination.id)
    if (disposed) return
    files.value = stored
    if (!stored.length) error.value = 'The uploaded files are not available. Import the study again.'
    else if (stored.every(isRasterFile)) urls.value = stored.map((file) => URL.createObjectURL(file))
  } catch { error.value = 'Could not load the uploaded study.' }
  finally { loading.value = false }
})
onBeforeUnmount(() => { disposed = true; urls.value.forEach((url) => URL.revokeObjectURL(url)) })
</script>

<template>
  <section class="uploaded-viewer">
    <div class="uploaded-heading"><strong>{{ $t(examination.type) }}</strong><span>{{ $t("Uploaded study") }}</span><span>{{ $t(files.length) }} {{ $t("files") }}</span></div>
    <div v-if="loading" class="empty-state">{{ $t("Loading study...") }}</div>
    <div v-else-if="error" class="empty-state" role="alert">{{ $t(error) }}</div>
    <template v-else-if="isRaster">
      <div class="image-tools">
        <button type="button" class="icon-btn" :aria-label="$t('Zoom out')" @click="zoom = Math.max(.25, zoom - .25)"><Minus :size="17" /></button>
        <span>{{ $t(Math.round(zoom * 100)) }}%</span>
        <button type="button" class="icon-btn" :aria-label="$t('Zoom in')" @click="zoom = Math.min(4, zoom + .25)"><Plus :size="17" /></button>
        <button type="button" class="btn btn-sm btn-secondary" @click="zoom = 1; slice = 0"><RotateCcw :size="15" /> {{ $t("Reset view") }}</button>
        <label v-if="files.length > 1">{{ $t("Image") }} <input v-model.number="slice" type="range" min="0" :max="files.length - 1" /> {{ $t(slice + 1) }} / {{ $t(files.length) }}</label>
      </div>
      <div class="raster-viewport"><img :src="urls[slice]" :alt="files[slice]?.name" :style="{ transform: `scale(${zoom})` }" @error="error = 'Could not display this image.'" /></div>
      <div class="file-caption">{{ $t(files[slice]?.name) }}</div>
    </template>
    <CornerstoneViewer v-else-if="files.length" :files="files" />
  </section>
</template>

<style scoped>
.uploaded-viewer { background: #0d191e; color: #deeeef; min-height: 520px; }
.uploaded-heading { display: flex; align-items: center; gap: 14px; padding: 14px 18px; font-size: 12px; border-bottom: 1px solid #2a3b40; }
.uploaded-heading strong { padding: 4px 8px; background: #27494b; border-radius: 5px; }
.uploaded-heading > span:last-child { margin-left: auto; color: #a3babd; }
.image-tools { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; padding: 10px 14px; font-size: 12px; }
.image-tools label { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.raster-viewport { height: 500px; display: flex; align-items: center; justify-content: center; overflow: auto; background: #060b0e; }
.raster-viewport img { max-height: 100%; max-width: 100%; object-fit: contain; }
.file-caption { padding: 12px; text-align: center; color: #a3babd; font-size: 11px; overflow-wrap: anywhere; }
</style>
