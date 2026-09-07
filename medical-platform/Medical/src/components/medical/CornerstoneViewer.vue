<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as cornerstone from '@cornerstonejs/core'
import * as cornerstoneTools from '@cornerstonejs/tools'
import dicomImageLoader from '@cornerstonejs/dicom-image-loader'

const props = defineProps<{
  files: File[]
}>()

const emit = defineEmits<{
  ready: [imageCount: number]
  error: [message: string]
}>()

const hostRef = ref<HTMLDivElement | null>(null)
const status = ref<'loading' | 'ready' | 'error'>('loading')
const errorMessage = ref('')
const instanceId = `cornerstone-${Math.random().toString(36).slice(2, 9)}`
let renderingEngine: cornerstone.RenderingEngine | null = null
let toolGroup: cornerstoneTools.Types.IToolGroup | undefined
let resizeObserver: ResizeObserver | null = null

async function loadStack() {
  if (!hostRef.value || !props.files.length) return

  try {
    await cornerstone.init()
    dicomImageLoader.init()
    await cornerstoneTools.init()

    dicomImageLoader.wadouri.fileManager.purge()
    const imageIds = props.files.map((file) => dicomImageLoader.wadouri.fileManager.add(file))

    renderingEngine = new cornerstone.RenderingEngine(instanceId)
    renderingEngine.enableElement({
      element: hostRef.value,
      viewportId: 'stack',
      type: cornerstone.Enums.ViewportType.STACK,
    })

    const viewport = renderingEngine.getViewport<cornerstone.Types.IStackViewport>('stack')
    await viewport.setStack(imageIds, 0)
    viewport.render()

    cornerstoneTools.addTool(cornerstoneTools.WindowLevelTool)
    cornerstoneTools.addTool(cornerstoneTools.PanTool)
    cornerstoneTools.addTool(cornerstoneTools.ZoomTool)
    cornerstoneTools.addTool(cornerstoneTools.StackScrollTool)

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
    const message = error instanceof Error ? error.message : 'Unable to open the DICOM study.'
    errorMessage.value = message
    status.value = 'error'
    emit('error', message)
  }
}

onMounted(loadStack)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  if (toolGroup) {
    cornerstoneTools.ToolGroupManager.destroyToolGroup(toolGroup.id)
  }
  renderingEngine?.destroy()
  dicomImageLoader.wadouri.fileManager.purge()
})
</script>

<template>
  <div class="cornerstone-viewer">
    <div ref="hostRef" class="viewport-host" />
    <div v-if="status === 'loading'" class="viewer-state">Loading DICOM study...</div>
    <div v-else-if="status === 'error'" class="viewer-state error">
      <strong>DICOM load failed</strong>
      <span>{{ errorMessage }}</span>
    </div>
    <div class="viewer-badge">Cornerstone3D</div>
  </div>
</template>

<style scoped>
.cornerstone-viewer {
  position: relative;
  min-height: 520px;
  overflow: hidden;
  background: #0a1214;
}

.viewport-host {
  width: 100%;
  height: 100%;
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
