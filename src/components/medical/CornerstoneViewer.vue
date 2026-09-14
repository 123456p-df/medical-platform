<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import * as cornerstone from '@cornerstonejs/core'
import * as cornerstoneTools from '@cornerstonejs/tools'
import dicomImageLoader from '@cornerstonejs/dicom-image-loader'
import { initializeImaging } from '@/utils/initializeImaging'
import { t } from '@/i18n'

const props = defineProps<{
  files: File[]
  framesPerFile?: number[]
}>()

const emit = defineEmits<{
  ready: [imageCount: number]
  error: [message: string]
}>()

const hostRef = ref<HTMLDivElement | null>(null)
const status = ref<'loading' | 'ready' | 'error'>('loading')
const stage = ref<'initializing' | 'registering' | 'decoding' | 'rendering'>('initializing')
const errorMessage = ref('')
const stageLabels = {
  initializing: 'ui.viewer.stage.initializing',
  registering: 'ui.viewer.stage.registering',
  decoding: 'ui.viewer.stage.decoding',
  rendering: 'ui.viewer.stage.rendering',
} as const
const stageLabel = computed(() => stageLabels[stage.value])
const instanceId = `cornerstone-${Math.random().toString(36).slice(2, 9)}`
let renderingEngine: cornerstone.RenderingEngine | null = null
let toolGroup: cornerstoneTools.Types.IToolGroup | undefined
let resizeObserver: ResizeObserver | null = null
let disposed = false
let loadTimer: ReturnType<typeof setTimeout> | undefined
let loadVersion = 0
const registeredImages: string[] = []

function releaseStack() {
  clearTimeout(loadTimer)
  resizeObserver?.disconnect()
  resizeObserver = null
  if (toolGroup) cornerstoneTools.ToolGroupManager.destroyToolGroup(toolGroup.id)
  toolGroup = undefined
  renderingEngine?.destroy()
  renderingEngine = null
  registeredImages.splice(0).forEach((id) => dicomImageLoader.wadouri.fileManager.remove(Number(id.split(':').pop())))
}

async function resetView() {
  const viewport = renderingEngine?.getViewport<cornerstone.Types.IStackViewport>('stack')
  if (!viewport) return
  viewport.resetCamera()
  viewport.resetProperties()
  await viewport.setImageIdIndex(0)
  viewport.render()
}

async function loadStack() {
  if (!hostRef.value || !props.files.length) return

  const version = ++loadVersion
  releaseStack()
  status.value = 'loading'
  stage.value = 'initializing'
  errorMessage.value = ''

  try {
    await initializeImaging()
    if (disposed || version !== loadVersion) return

    stage.value = 'registering'
    const baseImageIds = props.files.map((file) => dicomImageLoader.wadouri.fileManager.add(file))
    registeredImages.push(...baseImageIds)
    const imageIds = baseImageIds.flatMap((imageId, index) => {
      const count = props.framesPerFile?.[index] || 1
      return count > 1 ? Array.from({ length: count }, (_, frame) => `${imageId}?frame=${frame + 1}`) : [imageId]
    })

    renderingEngine = new cornerstone.RenderingEngine(instanceId)
    renderingEngine.enableElement({
      element: hostRef.value,
      viewportId: 'stack',
      type: cornerstone.Enums.ViewportType.STACK,
    })

    const viewport = renderingEngine.getViewport<cornerstone.Types.IStackViewport>('stack')
    stage.value = 'decoding'
    await Promise.race([
      (async () => {
        await cornerstone.imageLoader.loadAndCacheImage(imageIds[0])
        if (!disposed && version === loadVersion) await viewport.setStack(imageIds, 0)
      })(),
      new Promise<never>((_, reject) => { loadTimer = setTimeout(() => reject(new Error(t('ui.viewer.decodeTimeout'))), 30000) }),
    ])
    clearTimeout(loadTimer)
    if (disposed || version !== loadVersion) return
    stage.value = 'rendering'
    viewport.render()


    const toolGroupId = `${instanceId}-tools`
    toolGroup = cornerstoneTools.ToolGroupManager.createToolGroup(toolGroupId)
    if (toolGroup) {
      toolGroup.addViewport('stack', renderingEngine.id)
      toolGroup.addTool(cornerstoneTools.WindowLevelTool.toolName)
      toolGroup.addTool(cornerstoneTools.PanTool.toolName)
      toolGroup.addTool(cornerstoneTools.ZoomTool.toolName)
      toolGroup.addTool(cornerstoneTools.StackScrollTool.toolName)
      toolGroup.setToolActive(cornerstoneTools.WindowLevelTool.toolName, {
        bindings: [{ mouseButton: cornerstoneTools.Enums.MouseBindings.Primary }],
      })
      toolGroup.setToolActive(cornerstoneTools.PanTool.toolName, {
        bindings: [{ mouseButton: cornerstoneTools.Enums.MouseBindings.Secondary }],
      })
      toolGroup.setToolActive(cornerstoneTools.ZoomTool.toolName, {
        bindings: [{ mouseButton: cornerstoneTools.Enums.MouseBindings.Auxiliary }],
      })
      toolGroup.setToolActive(cornerstoneTools.StackScrollTool.toolName, {
        bindings: [{ mouseButton: cornerstoneTools.Enums.MouseBindings.Wheel }],
      })
    }

    resizeObserver = new ResizeObserver(() => renderingEngine?.resize(true))
    resizeObserver.observe(hostRef.value)

    status.value = 'ready'
    emit('ready', imageIds.length)
  } catch (error) {
    clearTimeout(loadTimer)
    if (disposed || version !== loadVersion) return
    const message = error instanceof Error ? error.message : t('ui.viewer.openFailed')
    errorMessage.value = message
    status.value = 'error'
    emit('error', message)
    loadVersion++
    releaseStack()
  }
}

onMounted(loadStack)

onBeforeUnmount(() => {
  disposed = true
  loadVersion++
  releaseStack()
})
</script>

<template>
  <div class="cornerstone-viewer">
    <div v-if="status === 'ready'" class="dicom-tools"><span>{{ $t("Drag: window / level · Right drag: pan · Wheel: slices") }}</span><button type="button" class="btn btn-sm btn-secondary" @click="resetView">{{ $t("Reset view") }}</button></div>
    <div ref="hostRef" class="viewport-host" />
    <div v-if="status === 'loading'" class="viewer-state" role="status">
      <strong>{{ $t(stageLabel) }}</strong>
      <span>{{ $t('ui.viewer.stageDetail', { stage: $t(stageLabel), count: files.length }) }}</span>
    </div>
    <div v-else-if="status === 'error'" class="viewer-state error">
      <strong>{{ $t("DICOM load failed") }}</strong>
      <span>{{ $t(errorMessage) }}</span>
      <button type="button" class="btn btn-sm btn-secondary" @click="loadStack">{{ $t('ui.viewer.retry') }}</button>
    </div>
    <div class="viewer-badge">{{ $t("Cornerstone3D") }}</div>
  </div>
</template>

<style scoped>
.dicom-tools { position: absolute; z-index: 2; top: 10px; left: 10px; right: 10px; display: flex; justify-content: space-between; align-items: center; gap: 10px; color: #d9eceb; font-size: 11px; }
.cornerstone-viewer {
  position: relative;
  min-height: 520px;
  overflow: hidden;
  background: #0a1214;
}

.viewport-host {
  width: 100%;
  height: 520px;
  min-height: 520px;
}

.viewer-state {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 6px;
  background: rgb(6 13 15 / 82%);
  color: #d9eceb;
  font-size: 13px;
  text-align: center;
}

.viewer-state.error {
  color: #ffb3b8;
}

.viewer-state span {
  max-width: 420px;
  color: rgb(217 236 235 / 68%);
  font-size: 11px;
}

.viewer-badge {
  position: absolute;
  right: 10px;
  bottom: 10px;
  padding: 4px 8px;
  border-radius: 5px;
  background: rgb(9 22 25 / 80%);
  color: #d9eceb;
  font-size: 10px;
  letter-spacing: 0.04em;
  pointer-events: none;
}
</style>
