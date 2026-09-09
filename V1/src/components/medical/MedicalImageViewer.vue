<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight, Crosshair, Minus, Plus } from 'lucide-vue-next'
import type { Examination, Finding } from '@/types'

const props = defineProps<{
  examination: Examination
  findings?: Finding[]
}>()

const emit = defineEmits<{
  selectFinding: [findingId: string]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const currentSlice = ref(Math.max(1, Math.ceil(props.examination.sliceCount / 2)))
const zoom = ref(1)
const markerPoints = ref<Array<{ finding: Finding; x: number; y: number }>>([])

const canGoBack = computed(() => currentSlice.value > 1)
const canGoForward = computed(() => currentSlice.value < props.examination.sliceCount)

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const parent = canvas.parentElement
  if (!parent) return
  const rect = parent.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  canvas.width = Math.max(1, Math.round(rect.width * dpr))
  canvas.height = Math.max(1, Math.round(rect.height * dpr))
  canvas.style.width = `${rect.width}px`
  canvas.style.height = `${rect.height}px`
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  type: Examination['type'],
) {
  ctx.save()
  ctx.translate(width / 2, height / 2)
  ctx.fillStyle = '#101a1e'
  ctx.fillRect(-width / 2, -height / 2, width, height)

  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1
  for (let x = -width / 2; x <= width / 2; x += 28) {
    ctx.beginPath()
    ctx.moveTo(x, -height / 2)
    ctx.lineTo(x, height / 2)
    ctx.stroke()
  }
  for (let y = -height / 2; y <= height / 2; y += 28) {
    ctx.beginPath()
    ctx.moveTo(-width / 2, y)
    ctx.lineTo(width / 2, y)
    ctx.stroke()
  }

  const baseRadius = Math.min(width, height) * 0.34
  const breathing = Math.sin(currentSlice.value * 0.55) * baseRadius * 0.035

  if (type === 'CT') {
    ctx.beginPath()
    ctx.ellipse(0, 0, baseRadius * 1.32, baseRadius * 1.02, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#27383b'
    ctx.fill()
    ctx.strokeStyle = '#435b5c'
    ctx.stroke()

    ctx.fillStyle = 'rgba(0,0,0,0.78)'
    ctx.beginPath()
    ctx.ellipse(-baseRadius * 0.42, 0, baseRadius * 0.5, baseRadius * 0.73 + breathing, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(baseRadius * 0.42, 0, baseRadius * 0.5, baseRadius * 0.73 + breathing, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = 'rgba(197,230,226,0.32)'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.ellipse(0, 0, baseRadius * 0.15, baseRadius * 0.42, 0, 0, Math.PI * 2)
    ctx.stroke()

    drawVessels(ctx, baseRadius)
  } else if (type === 'MRI') {
    ctx.beginPath()
    ctx.ellipse(0, 0, baseRadius * 0.92, baseRadius * 1.2, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#26313b'
    ctx.fill()
    ctx.strokeStyle = '#4c5a69'
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.fillStyle = 'rgba(210,220,230,0.15)'
    ctx.beginPath()
    ctx.ellipse(0, -baseRadius * 0.08, baseRadius * 0.48, baseRadius * 0.66, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = 'rgba(230,240,244,0.2)'
    ctx.lineWidth = 1
    for (let i = 1; i < 5; i += 1) {
      ctx.beginPath()
      ctx.ellipse(0, 0, baseRadius * i * 0.2, baseRadius * i * 0.26, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
  } else {
    ctx.fillStyle = '#111b20'
    ctx.beginPath()
    ctx.moveTo(-baseRadius * 0.65, -baseRadius * 0.55)
    ctx.quadraticCurveTo(-baseRadius * 1.05, -baseRadius * 0.2, -baseRadius * 0.9, baseRadius * 0.25)
    ctx.lineTo(-baseRadius * 0.18, baseRadius * 0.55)
    ctx.lineTo(baseRadius * 0.18, baseRadius * 0.55)
    ctx.lineTo(baseRadius * 0.9, baseRadius * 0.25)
    ctx.quadraticCurveTo(baseRadius * 1.05, -baseRadius * 0.2, baseRadius * 0.65, -baseRadius * 0.55)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = 'rgba(215,235,232,0.3)'
    ctx.stroke()

    ctx.fillStyle = 'rgba(225,240,236,0.24)'
    ctx.beginPath()
    ctx.ellipse(0, baseRadius * 0.05, baseRadius * 0.28, baseRadius * 0.4, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawVessels(ctx: CanvasRenderingContext2D, radius: number) {
  ctx.strokeStyle = 'rgba(190,230,226,0.22)'
  ctx.lineWidth = 1.2
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 5; i += 1) {
      const angle = (i / 5) * Math.PI - Math.PI * 0.2
      ctx.beginPath()
      ctx.moveTo(side * radius * 0.15, radius * 0.18 * Math.cos(angle))
      ctx.lineTo(side * radius * (0.6 + i * 0.06), radius * (0.32 + i * 0.1) * Math.sin(angle))
      ctx.stroke()
    }
  }
}

function getFindingPosition(finding: Finding, width: number, height: number, type: Examination['type']) {
  const side = finding.side === 'right' ? 1 : -1
  if (type === 'MRI') {
    return {
      x: width / 2 + side * width * 0.13,
      y: height / 2 - height * 0.2,
    }
  }
  if (type === 'X-Ray') {
    return {
      x: width / 2 + side * width * 0.18,
      y: height / 2 - height * 0.08,
    }
  }

  const lobeOffset = finding.location.includes('upper')
    ? -0.2
    : finding.location.includes('lower')
      ? 0.23
      : 0
  return {
    x: width / 2 + side * width * 0.16,
    y: height / 2 + lobeOffset * height,
  }
}

function drawMarkers(ctx: CanvasRenderingContext2D, width: number, height: number) {
  markerPoints.value = []
  const activeFindings = (props.findings ?? []).filter((finding) => finding.organ === 'Lung')

  activeFindings.forEach((finding) => {
    const shouldShow =
      props.examination.type === 'CT' &&
      Math.abs(currentSlice.value - Math.ceil(props.examination.sliceCount * 0.58)) <= 2
    if (!shouldShow) return

    const point = getFindingPosition(finding, width, height, props.examination.type)
    markerPoints.value.push({ finding, ...point })

    ctx.save()
    ctx.shadowColor = 'rgba(255,90,102,0.9)'
    ctx.shadowBlur = 12
    ctx.strokeStyle = '#ff6b75'
    ctx.fillStyle = 'rgba(255,107,117,0.26)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(point.x, point.y, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.shadowBlur = 0
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  const dpr = window.devicePixelRatio || 1
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  drawShape(ctx, width, height, props.examination.type)
  drawMarkers(ctx, width, height)
}

function changeSlice(delta: number) {
  const next = Math.min(props.examination.sliceCount, Math.max(1, currentSlice.value + delta))
  currentSlice.value = next
}

function changeZoom(delta: number) {
  zoom.value = Math.min(2.5, Math.max(1, Number((zoom.value + delta).toFixed(1))))
}

function handleCanvasClick(event: MouseEvent) {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) / zoom.value
  const y = (event.clientY - rect.top) / zoom.value
  const hit = markerPoints.value.find((marker) => Math.hypot(marker.x - x, marker.y - y) < 18)
  if (hit) {
    emit('selectFinding', hit.finding.id)
  }
}

onMounted(() => {
  const observer = new ResizeObserver(() => {
    resizeCanvas()
    draw()
  })
  if (canvasRef.value) {
    observer.observe(canvasRef.value.parentElement as Element)
    resizeCanvas()
    draw()
  }
})

watch(
  () => [currentSlice.value, zoom.value, props.examination.id],
  () => draw(),
)

onBeforeUnmount(() => {
  markerPoints.value = []
})
</script>

<template>
  <div class="viewer">
    <div class="viewer-canvas" :style="{ transform: `scale(${zoom})` }">
      <canvas ref="canvasRef" @click="handleCanvasClick" />
    </div>
    <div class="viewer-info">
      <span>{{ $t(examination.type) }} · {{ $t(examination.organ) }}</span>
      <span>{{ $t("Slice") }} {{ $t(currentSlice) }} / {{ $t(examination.sliceCount) }}</span>
    </div>
    <div class="viewer-controls">
      <button type="button" :disabled="!canGoBack" :aria-label="$t('Previous slice')" @click="changeSlice(-1)">
        <ChevronLeft :size="17" />
      </button>
      <input
        v-model.number="currentSlice"
        type="range"
        :min="1"
        :max="examination.sliceCount"
        step="1"
        :aria-label="$t('Slice position')"
      />
      <button type="button" :disabled="!canGoForward" :aria-label="$t('Next slice')" @click="changeSlice(1)">
        <ChevronRight :size="17" />
      </button>
      <span class="control-divider" />
      <button type="button" :aria-label="$t('Zoom out')" @click="changeZoom(-0.2)">
        <Minus :size="16" />
      </button>
      <span class="zoom-value">{{ $t(Math.round(zoom * 100)) }}%</span>
      <button type="button" :aria-label="$t('Zoom in')" @click="changeZoom(0.2)">
        <Plus :size="16" />
      </button>
      <button type="button" :aria-label="$t('Reset view')" @click="zoom = 1">
        <Crosshair :size="16" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.viewer {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius);
  background: #101a1e;
}

.viewer-canvas {
  height: 480px;
  transform-origin: center center;
  transition: transform 160ms ease;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

.viewer-info {
  position: absolute;
  top: 12px;
  left: 14px;
  display: flex;
  gap: 10px;
  padding: 6px 9px;
  border-radius: 5px;
  background: rgb(4 11 13 / 62%);
  color: #d9eceb;
  font-size: 11px;
}

.viewer-controls {
  position: absolute;
  right: 14px;
  bottom: 12px;
  left: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 7px;
  background: rgb(4 11 13 / 74%);
}

.viewer-controls button {
  display: grid;
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  place-items: center;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: #d9eceb;
}

.viewer-controls button:hover {
  background: rgb(255 255 255 / 10%);
}

.viewer-controls button:disabled {
  opacity: 0.35;
}

.viewer-controls input {
  min-width: 0;
  flex: 1;
  accent-color: #56b5b7;
}

.control-divider {
  width: 1px;
  height: 22px;
  margin: 0 3px;
  background: rgb(255 255 255 / 14%);
}

.zoom-value {
  min-width: 38px;
  color: #d9eceb;
  font-size: 11px;
  text-align: center;
}

@media (max-width: 760px) {
  .viewer-canvas {
    height: 360px;
  }
}
</style>
