<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { request } from '@/api/client'
import type { Examination, Finding } from '@/types'
import type { VolumeRenderer } from '@/utils/volumeRenderer'
import type { LabelVolume, Shape3D, SliceAxis, StainStyle } from '@/utils/volumePixels'
import { compositeStain, extractLabelPlane } from '@/utils/volumePixels'
import { positionToSlice, sliceToPosition } from '@/utils/sliceSync'
import { localPreview } from '@/utils/runtime'
import SyntheticSlice from './SyntheticSlice.vue'
import CrosshairsOverlay from './CrosshairsOverlay.vue'
import { useCrosshairs } from '@/composables/useCrosshairs'
import { useViewportGestures, activeMedicalTool } from '@/composables/useViewportGestures'
import { useMeasurementTools } from '@/composables/useMeasurementTools'

const props = withDefaults(
  defineProps<{
    examination: Examination
    axis: SliceAxis
    preset: string
    zoom: number
    renderer: VolumeRenderer | null
    blocked?: boolean
    position?: number
    compact?: boolean
    findings?: Finding[]
    isMaximized?: boolean
    labelVolume?: LabelVolume | null
    visibleLabels?: number[]
    stainColors?: Record<number, StainStyle>
    stainOpacity?: number
    syncCrosshairs?: boolean
    showCrosshairs?: boolean
  }>(),
  {
    blocked: false,
    position: undefined,
    compact: false,
    findings: () => [],
    isMaximized: false,
    labelVolume: null,
    visibleLabels: () => [],
    stainColors: () => ({}),
    stainOpacity: 0.35,
    syncCrosshairs: true,
    showCrosshairs: true,
  },
)

const emit = defineEmits<{
  positionChange: [position: number]
  selectFinding: [id: string]
  toggleMaximize: []
}>()

const slice = ref(0)
const displayed = ref(-1)
const canvas = ref<HTMLCanvasElement>()
const stage = ref<HTMLDivElement>()
const sliceFitRef = ref<HTMLDivElement>()
const error = ref('')
const busy = ref(false)
const retry = ref(0)

// Volume geometry computation
const shape = computed<Shape3D>(() => {
  const s = props.examination.shape || [512, 512, props.examination.sliceCount || 100]
  return [s[0], s[1], s[2]]
})

const spacing = computed<[number, number, number]>(() => {
  const sp = props.examination.spacing || [1, 1, 1]
  return [sp[0], sp[1], sp[2]]
})

const geometry = computed(() => {
  const sh = shape.value
  const sp = spacing.value
  const layer = props.axis === 'axial' ? 2 : props.axis === 'coronal' ? 1 : 0
  const u = props.axis === 'sagittal' ? 1 : 0
  const v = props.axis === 'axial' ? 1 : 2
  return {
    count: sh[layer],
    width: sh[u] * sp[u],
    height: sh[v] * sp[v],
    pixelWidth: sh[u],
    pixelHeight: sh[v],
    spacing: sp[layer],
    sliceThickness: sp[layer],
    pixelSpacing: sp[u],
  }
})

const fitStyle = computed(() => {
  const ratio = Math.max(0.01, geometry.value.width / geometry.value.height)
  // Give the fit box the physical FOV aspect ratio. This keeps sagittal and
  // coronal views from being stretched while the canvas and overlay share the
  // exact same CSS box.
  const width = ratio >= 1 ? 96 : Math.max(1, 94 * ratio)
  const height = ratio >= 1 ? Math.max(1, 94 / ratio) : 94
  return {
    width: width + '%',
    height: height + '%',
    aspectRatio: String(ratio),
    transform: 'translate(' + pan.value.x + 'px, ' + pan.value.y + 'px) scale(' + (zoom * localZoom.value) + ')',
  }
})

const label = computed(() => ({
  axial: '轴向 · Axial (Z)',
  coronal: '冠状 · Coronal (Y)',
  sagittal: '矢状 · Sagittal (X)',
})[props.axis])

const syntheticPreset = computed(() => {
  if (props.preset === 'auto') return props.examination.type === 'MRI' ? 'brain' : 'lung'
  return props.preset as 'lung' | 'brain' | 'bone' | 'soft'
})

// Crosshairs composable
const { visible: crosshairsVisible, updateFromCanvas, getCanvasProjection } = useCrosshairs()

// Measurement and HU probe
const {
  rulers,
  activeRuler,
  startRuler,
  updateRuler,
  finishRuler,
  sampleHU,
  getTissueDescription,
} = useMeasurementTools()

const currentRawPlane = ref<Float32Array | undefined>(undefined)
const probeState = ref<{
  col: number
  row: number
  hu: number | null
  tissue?: string
}>({ col: -1, row: -1, hu: null })

// Custom dynamic windowing state
const customWindow = ref<[number, number] | undefined>(undefined)

// Computed crosshairs projection on this viewport
const crosshairProj = computed(() => getCanvasProjection(props.axis, shape.value))

// Watch external crosshairs change: synchronize slice position
watch(
  () => crosshairProj.value.sliceIndex,
  targetSlice => {
    if (!props.syncCrosshairs) return
    if (activeMedicalTool.value === 'crosshairs' && targetSlice !== slice.value) {
      if (targetSlice >= 0 && targetSlice < geometry.value.count) {
        slice.value = targetSlice
        emit('positionChange', sliceToPosition(targetSlice, geometry.value.count))
      }
    }
  },
)

watch(
  () => props.axis,
  () => {
    const count = geometry.value.count
    if (props.position !== undefined) {
      slice.value = positionToSlice(props.position, count)
    } else if (slice.value >= count) {
      slice.value = Math.max(0, count - 1)
    }
  },
)

watch(
  () => props.examination.id,
  () => {
    slice.value = Math.floor(geometry.value.count / 2)
    displayed.value = -1
    customWindow.value = undefined
  },
  { immediate: true },
)

watch(
  () => props.position,
  value => {
    if (value === undefined) return
    const next = positionToSlice(value, geometry.value.count)
    if (next !== slice.value) slice.value = next
  },
  { immediate: true },
)

// Gesture interaction engine
const {
  pan,
  zoom: localZoom,
  cursorClass,
  windowCenter,
  windowWidth,
  resetPanZoom,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  handleWheel: gestureHandleWheel,
} = useViewportGestures({
  initialZoom: 1,
  onWindowChange: (center, width) => {
    customWindow.value = [center, width]
    render()
  },
  onSliceScroll: delta => {
    move(slice.value + delta)
  },
  onCrosshairMove: (canvasX, canvasY) => {
    if (!canvas.value) return
    const rect = canvas.value.getBoundingClientRect()
    const scaleX = canvas.value.width / rect.width
    const scaleY = canvas.value.height / rect.height
    const col = Math.round(canvasX * scaleX)
    const row = Math.round(canvasY * scaleY)
    updateFromCanvas(props.axis, col, row, slice.value, shape.value)
  },
  onProbeMove: (canvasX, canvasY) => {
    if (!canvas.value) return
    const rect = canvas.value.getBoundingClientRect()
    const scaleX = canvas.value.width / rect.width
    const scaleY = canvas.value.height / rect.height
    const col = Math.round(canvasX * scaleX)
    const row = Math.round(canvasY * scaleY)
    probeState.value.col = col
    probeState.value.row = row
    const hu = sampleHU(col, row, currentRawPlane.value, canvas.value.width, canvas.value.height)
    probeState.value.hu = hu
    probeState.value.tissue = getTissueDescription(hu)
  },
  onRulerStart: (canvasX, canvasY) => {
    if (!canvas.value) return
    const rect = canvas.value.getBoundingClientRect()
    const scaleX = canvas.value.width / rect.width
    const scaleY = canvas.value.height / rect.height
    startRuler(canvasX * scaleX, canvasY * scaleY)
  },
  onRulerMove: (canvasX, canvasY) => {
    if (!canvas.value) return
    const rect = canvas.value.getBoundingClientRect()
    const scaleX = canvas.value.width / rect.width
    const scaleY = canvas.value.height / rect.height
    updateRuler(canvasX * scaleX, canvasY * scaleY, props.axis, spacing.value)
  },
  onRulerEnd: () => {
    finishRuler(props.axis, slice.value)
  },
  onDoubleTap: () => {
    emit('toggleMaximize')
  },
})

// Master render pipeline
let controller: AbortController | undefined
let frame = 0
let revision = 0

function render() {
  const current = ++revision
  const index = slice.value
  controller?.abort()
  cancelAnimationFrame(frame)

  if (localPreview) {
    displayed.value = index
    busy.value = false
    error.value = ''
    return
  }

  if (props.blocked) {
    canvas.value?.getContext('2d')?.clearRect(0, 0, canvas.value.width, canvas.value.height)
    displayed.value = -1
    busy.value = false
    return
  }

  if (!canvas.value) return
  busy.value = true
  error.value = ''

  frame = requestAnimationFrame(async () => {
    try {
      const context = canvas.value?.getContext('2d')
      if (!context || !canvas.value) return

      if (props.renderer) {
        const result = await props.renderer.render(
          props.axis,
          index,
          props.preset,
          customWindow.value,
        )
        if (!result || current !== revision || !canvas.value) return
        if (canvas.value.width !== result.width) canvas.value.width = result.width
        if (canvas.value.height !== result.height) canvas.value.height = result.height

        context.putImageData(new ImageData(result.pixels, result.width, result.height), 0, 0)
        applyStain(context, result.width, result.height, index)
        currentRawPlane.value = result.rawPlane
        windowCenter.value = result.windowCenter ?? null
        windowWidth.value = result.windowWidth ?? null
      } else {
        const active = new AbortController()
        controller = active
        const query = new URLSearchParams({ axis: props.axis })
        const windows: Record<string, [number, number]> = {
          lung: [-600, 1500],
          soft: [40, 400],
          bone: [400, 1800],
          brain: [40, 80],
        }

        if (customWindow.value) {
          query.set('window_center', String(customWindow.value[0]))
          query.set('window_width', String(customWindow.value[1]))
        } else if (windows[props.preset]) {
          const [center, width] = windows[props.preset]
          query.set('window_center', String(center))
          query.set('window_width', String(width))
        }

        const response = await request(
          '/medical-images/' + props.examination.id + '/slice/' + index + '?' + query,
          { signal: active.signal },
        )
        const bitmap = await createImageBitmap(await response.blob())
        try {
          if (current !== revision || !canvas.value) return
          if (canvas.value.width !== bitmap.width) canvas.value.width = bitmap.width
          if (canvas.value.height !== bitmap.height) canvas.value.height = bitmap.height
          context.drawImage(bitmap, 0, 0)
          applyStain(context, canvas.value.width, canvas.value.height, index)
        } finally {
          bitmap.close()
        }
      }

      if (current === revision) displayed.value = index
    } catch (e) {
      if (current === revision) error.value = e instanceof Error ? e.message : '加载失败'
    } finally {
      if (current === revision) busy.value = false
    }
  })
}

function applyStain(context: CanvasRenderingContext2D, width: number, height: number, index: number) {
  const visible = props.visibleLabels || []
  if (!props.labelVolume || !visible.length || (props.stainOpacity ?? 0) <= 0) return
  try {
    const extracted = extractLabelPlane(props.labelVolume, props.axis, index)
    if (extracted.width !== width || extracted.height !== height) return
    const image = context.getImageData(0, 0, width, height)
    const colors = new Map<number, StainStyle>()
    for (const [key, style] of Object.entries(props.stainColors || {})) {
      colors.set(Number(key), style)
    }
    compositeStain(image, extracted.plane, new Set(visible), colors, props.stainOpacity ?? 0.35)
    context.putImageData(image, 0, 0)
  } catch {
    /* stain is optional on top of a valid CT slice */
  }
}

watch(
  [
    () => props.examination.id,
    slice,
    () => props.preset,
    () => props.renderer,
    () => props.blocked,
    retry,
    () => props.labelVolume,
    () => props.visibleLabels,
    () => props.stainOpacity,
    () => props.axis,
  ],
  render,
  { flush: 'post' },
)

onMounted(render)

function move(value: number) {
  const next = Math.min(geometry.value.count - 1, Math.max(0, value))
  slice.value = next
  emit('positionChange', sliceToPosition(next, geometry.value.count))
}

function onStagePointerDown(e: PointerEvent) {
  stage.value?.focus({ preventScroll: true })
  if (!sliceFitRef.value) return
  const rect = sliceFitRef.value.getBoundingClientRect()
  handlePointerDown(e, rect)
}

function onStagePointerMove(e: PointerEvent) {
  if (!sliceFitRef.value) return
  const rect = sliceFitRef.value.getBoundingClientRect()
  handlePointerMove(e, rect)
}

function onStagePointerUp(e: PointerEvent) {
  if (!sliceFitRef.value) return
  const rect = sliceFitRef.value.getBoundingClientRect()
  handlePointerUp(e, rect)
}

function keydown(event: KeyboardEvent) {
  if (event.altKey || event.ctrlKey || event.metaKey) return
  const delta: Record<string, number> = {
    ArrowRight: 1,
    ArrowUp: 1,
    ArrowLeft: -1,
    ArrowDown: -1,
    PageUp: 10,
    PageDown: -10,
  }
  if (event.key in delta) {
    event.preventDefault()
    move(slice.value + delta[event.key])
  } else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    move(event.key === 'Home' ? 0 : geometry.value.count - 1)
  }
}

onBeforeUnmount(() => {
  revision++
  controller?.abort()
  cancelAnimationFrame(frame)
})

defineExpose({
  resetPanZoom,
  render,
  setSlice(index: number) {
    move(index)
  },
})
</script>

<template>
  <div :class="['slice-viewport', axis, { compact, maximized: isMaximized }]" @keydown="keydown">
    <!-- 视口标题条 -->
    <div class="pane-heading" @dblclick="emit('toggleMaximize')">
      <div class="heading-left">
        <span :class="['axis-indicator', axis]" />
        <strong>{{ label }}</strong>
      </div>
      <div class="heading-right">
        <span class="meta-tag">{{ geometry.spacing.toFixed(2) }} mm</span>
      </div>
    </div>

    <!-- 视口画布舞台 -->
    <div
      ref="stage"
      :class="['slice-stage', cursorClass]"
      tabindex="0"
      :aria-label="label + '视图，方向键切层，右键调窗，中键平移'"
      @contextmenu.prevent
      @wheel="gestureHandleWheel"
      @pointerdown="onStagePointerDown"
      @pointermove="onStagePointerMove"
      @pointerup="onStagePointerUp"
    >
      <!-- 解剖方位标记 (RAS) -->
      <span class="orientation top">{{ axis === 'axial' ? 'A' : 'S' }}</span>
      <span class="orientation bottom">{{ axis === 'axial' ? 'P' : 'I' }}</span>
      <span class="orientation left">{{ axis === 'sagittal' ? 'A' : 'R' }}</span>
      <span class="orientation right">{{ axis === 'sagittal' ? 'P' : 'L' }}</span>

      <!-- 核心画布容器 (平移与缩放 transform) -->
      <div
        ref="sliceFitRef"
        class="slice-fit"
        :style="fitStyle"
      >
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
        <canvas
          v-else
          ref="canvas"
          role="img"
          :aria-label="examination.type + ' ' + axis + ' 切片'"
          :data-slice-index="displayed"
          :data-render-mode="renderer ? 'local' : 'preview'"
        />

        <!-- 3D 十字准星与专业量测矢量叠加层 -->
        <CrosshairsOverlay
          v-if="showCrosshairs && canvas && canvas.width > 0"
          :axis="axis"
          :width="canvas.width"
          :height="canvas.height"
          :slice-index="slice"
          :slice-count="geometry.count"
          :thickness-mm="geometry.sliceThickness"
          :spacing-mm="geometry.pixelSpacing"
          :crosshairs-col="crosshairProj.col"
          :crosshairs-row="crosshairProj.row"
          :crosshairs-visible="crosshairsVisible"
          :window-center="windowCenter"
          :window-width="windowWidth"
          :probe-h-u="probeState.hu"
          :probe-tissue="probeState.tissue"
          :rulers="rulers"
          :active-ruler="activeRuler"
          :is-maximized="isMaximized"
          @toggle-maximize="emit('toggleMaximize')"
        />
      </div>

      <!-- 加载中与错误提示 -->
      <span v-if="busy && displayed < 0" class="slice-message">加载体素切片…</span>
      <div v-if="error" role="alert" class="slice-message error">
        {{ error }}
        <button @click="retry++">重试</button>
      </div>
    </div>

    <!-- 底部切片微调滑块 -->
    <div class="slice-controls">
      <button
        :disabled="slice === 0 || blocked"
        :aria-label="label + '上一层'"
        @click="move(slice - 1)"
      >
        <ChevronLeft :size="14" />
      </button>
      <input
        :value="slice"
        :disabled="blocked"
        :aria-label="label + '切片位置'"
        type="range"
        min="0"
        :max="geometry.count - 1"
        @input="move(Number(($event.target as HTMLInputElement).value))"
      />
      <button
        :disabled="slice >= geometry.count - 1 || blocked"
        :aria-label="label + '下一层'"
        @click="move(slice + 1)"
      >
        <ChevronRight :size="14" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.slice-viewport {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #23343f;
  border-radius: 8px;
  background: #09131a;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
}

.slice-viewport.maximized {
  grid-column: 1 / -1 !important;
  grid-row: 1 / -1 !important;
  height: 100% !important;
  min-height: 520px;
}

.pane-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #101c24;
  color: #d2e4e8;
  font-size: 11px;
  border-bottom: 1px solid #1a2a34;
  user-select: none;
  cursor: pointer;
}

.heading-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.axis-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.axial .axis-indicator {
  background: #ef4444;
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.6);
}

.coronal .axis-indicator {
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.6);
}

.sagittal .axis-indicator {
  background: #eab308;
  box-shadow: 0 0 6px rgba(234, 179, 8, 0.6);
}

.meta-tag {
  color: #6b8994;
  font-size: 10px;
  font-family: monospace;
}

.slice-stage {
  position: relative;
  flex: 1;
  min-height: 280px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #04090d;
  user-select: none;
  touch-action: none;
}

.compact .slice-stage {
  min-height: 230px;
}

.slice-stage:focus-visible {
  outline: 2px solid #5ce6d4;
  outline-offset: -2px;
}

/* 光标样式 */
.cursor-crosshair { cursor: crosshair; }
.cursor-grab { cursor: grab; }
.cursor-grabbing { cursor: grabbing; }
.cursor-move { cursor: move; }
.cursor-help { cursor: help; }
.cursor-default { cursor: default; }

.slice-fit {
  position: relative;
  max-width: 96%;
  max-height: 94%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: center center;
  transition: transform 0.05s linear;
}

.slice-fit canvas {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
}

.orientation {
  position: absolute;
  z-index: 2;
  color: #799ea7;
  font-size: 11px;
  font-weight: 600;
  pointer-events: none;
  text-shadow: 0 0 3px #000;
}

.top { top: 6px; left: 50%; transform: translateX(-50%); }
.bottom { bottom: 6px; left: 50%; transform: translateX(-50%); }
.left { top: 50%; left: 8px; transform: translateY(-50%); }
.right { top: 50%; right: 8px; transform: translateY(-50%); }

.slice-message {
  position: absolute;
  z-index: 5;
  color: #d1e3e7;
  font-size: 11px;
  padding: 8px 14px;
  background: rgba(15, 33, 43, 0.9);
  border: 1px solid #2d4c5d;
  border-radius: 6px;
  text-align: center;
}

.slice-message.error {
  border-color: #ef4444;
  color: #fca5a5;
}

.slice-message button {
  display: block;
  margin: 6px auto 0;
  background: #254a55;
  color: #5ce6d4;
  border: 1px solid #4b8b8f;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.slice-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #0d171f;
  border-top: 1px solid #1a2a34;
}

.slice-controls input {
  flex: 1;
  min-width: 0;
  accent-color: #5ce6d4;
  cursor: pointer;
}

.slice-controls button {
  border: 0;
  background: none;
  color: #8da9b2;
  padding: 4px;
  display: flex;
  cursor: pointer;
  border-radius: 4px;
}

.slice-controls button:hover:not(:disabled) {
  background: #172732;
  color: #5ce6d4;
}

.slice-controls button:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}
</style>
