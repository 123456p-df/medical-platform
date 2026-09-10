<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ExaminationType, Finding } from '@/types'

type Orientation = 'axial' | 'coronal' | 'sagittal' | 'projection'
type WindowPreset = 'lung' | 'brain' | 'bone' | 'soft'

const props = withDefaults(
  defineProps<{
    modality: ExaminationType
    orientation: Orientation
    sliceIndex: number
    sliceCount: number
    preset?: WindowPreset
    showGrid?: boolean
    findings?: Finding[]
    activeFindingId?: string | null
    zoom?: number
  }>(),
  {
    preset: 'lung',
    showGrid: true,
    findings: () => [],
    activeFindingId: null,
    zoom: 1,
  },
)

const emit = defineEmits<{
  selectFinding: [findingId: string]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const markerPoints = ref<Array<{ finding: Finding; x: number; y: number }>>([])
let resizeObserver: ResizeObserver | null = null

const backgroundForPreset: Record<WindowPreset, string> = {
  lung: '#0c1518',
  brain: '#0b1118',
  bone: '#15110d',
  soft: '#0d1415',
}

const accentForPreset: Record<WindowPreset, string> = {
  lung: 'rgba(204,235,232,0.34)',
  brain: 'rgba(205,220,238,0.34)',
  bone: 'rgba(238,220,183,0.38)',
  soft: 'rgba(214,227,228,0.34)',
}

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save()
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1
  const step = Math.max(24, Math.min(width, height) / 14)
  for (let x = step; x < width; x += step) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = step; y < height; y += step) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
  ctx.restore()
}

function drawCtAxial(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const cx = width / 2
  const cy = height / 2
  const baseRadius = Math.min(width, height) * 0.34
  const breathing = Math.sin(props.sliceIndex * 0.7) * baseRadius * 0.04

  ctx.fillStyle = '#283b3d'
  ctx.beginPath()
  ctx.ellipse(cx, cy, baseRadius * 1.32, baseRadius * 1.02, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#496263'
  ctx.stroke()

  ctx.fillStyle = 'rgba(0,0,0,0.82)'
  ctx.beginPath()
  ctx.ellipse(cx - baseRadius * 0.42, cy, baseRadius * 0.5, baseRadius * 0.74 + breathing, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx + baseRadius * 0.42, cy, baseRadius * 0.5, baseRadius * 0.74 + breathing, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = accentForPreset[props.preset]
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.ellipse(cx, cy, baseRadius * 0.16, baseRadius * 0.43, 0, 0, Math.PI * 2)
  ctx.stroke()

  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath()
      ctx.moveTo(cx + side * baseRadius * 0.16, cy + baseRadius * 0.16)
      ctx.lineTo(cx + side * baseRadius * (0.58 + i * 0.06), cy + baseRadius * (0.24 + i * 0.13))
      ctx.stroke()
    }
  }
}

function drawCtCoronal(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const cx = width / 2
  const cy = height * 0.52
  const lungHeight = height * 0.46
  const lungWidth = width * 0.17

  ctx.fillStyle = '#1d2d30'
  ctx.beginPath()
  ctx.moveTo(cx, height * 0.05)
  ctx.lineTo(cx - width * 0.34, height * 0.28)
  ctx.lineTo(cx - width * 0.28, height * 0.92)
  ctx.lineTo(cx + width * 0.28, height * 0.92)
  ctx.lineTo(cx + width * 0.34, height * 0.28)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#496263'
  ctx.stroke()

  ctx.fillStyle = 'rgba(0,0,0,0.82)'
  ctx.beginPath()
  ctx.ellipse(cx - width * 0.12, cy, lungWidth, lungHeight, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(cx + width * 0.12, cy, lungWidth, lungHeight, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = accentForPreset[props.preset]
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(cx, height * 0.15)
  ctx.lineTo(cx, height * 0.82)
  ctx.stroke()
}

function drawCtSagittal(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const cx = width * 0.48
  const cy = height * 0.52

  ctx.fillStyle = '#1d2d30'
  ctx.beginPath()
  ctx.moveTo(cx - width * 0.32, height * 0.05)
  ctx.quadraticCurveTo(cx + width * 0.1, height * 0.02, cx + width * 0.34, height * 0.26)
  ctx.lineTo(cx + width * 0.22, height * 0.91)
  ctx.lineTo(cx - width * 0.22, height * 0.91)
  ctx.lineTo(cx - width * 0.3, height * 0.3)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#496263'
  ctx.stroke()

  ctx.fillStyle = 'rgba(0,0,0,0.82)'
  ctx.beginPath()
  ctx.ellipse(cx, cy, width * 0.22, height * 0.3, -0.08, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = accentForPreset[props.preset]
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(cx - width * 0.03, height * 0.12)
  ctx.lineTo(cx + width * 0.03, height * 0.72)
  ctx.stroke()
}

function drawBrainSlice(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const cx = width / 2
  const cy = height / 2
  const horizontal = props.orientation === 'axial'
  const radiusX = (horizontal ? width * 0.32 : width * 0.27)
  const radiusY = (horizontal ? height * 0.35 : height * 0.4)

  ctx.fillStyle = '#25323d'
  ctx.beginPath()
  ctx.ellipse(cx, cy, radiusX, radiusY, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#546674'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.strokeStyle = 'rgba(205,220,238,0.18)'
  ctx.lineWidth = 1
  for (let i = 1; i < 6; i += 1) {
    ctx.beginPath()
    ctx.ellipse(cx, cy, radiusX * (i / 6), radiusY * (i / 6), 0, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.fillStyle = 'rgba(218,229,239,0.12)'
  ctx.beginPath()
  ctx.ellipse(cx, cy - radiusY * 0.08, radiusX * 0.43, radiusY * 0.58, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawXRay(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const cx = width / 2
  const cy = height / 2
  const baseRadius = Math.min(width, height) * 0.35

  ctx.fillStyle = '#111b20'
  ctx.beginPath()
  ctx.moveTo(cx - baseRadius * 0.62, cy - baseRadius * 0.52)
  ctx.quadraticCurveTo(cx - baseRadius * 1.02, cy - baseRadius * 0.18, cx - baseRadius * 0.9, cy + baseRadius * 0.28)
  ctx.lineTo(cx - baseRadius * 0.16, cy + baseRadius * 0.58)
  ctx.lineTo(cx + baseRadius * 0.16, cy + baseRadius * 0.58)
  ctx.lineTo(cx + baseRadius * 0.9, cy + baseRadius * 0.28)
  ctx.quadraticCurveTo(cx + baseRadius * 1.02, cy - baseRadius * 0.18, cx + baseRadius * 0.62, cy - baseRadius * 0.52)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = 'rgba(224,239,236,0.34)'
  ctx.lineWidth = 1.2
  ctx.stroke()

  ctx.fillStyle = 'rgba(230,240,236,0.2)'
  ctx.beginPath()
  ctx.ellipse(cx, cy + baseRadius * 0.06, baseRadius * 0.25, baseRadius * 0.37, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = 'rgba(224,239,236,0.2)'
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath()
      ctx.moveTo(cx + side * baseRadius * 0.08, cy - baseRadius * 0.18)
      ctx.lineTo(cx + side * baseRadius * (0.18 + i * 0.05), cy + baseRadius * (0.04 + i * 0.05))
      ctx.stroke()
    }
  }
}

function getMarker(finding: Finding, width: number, height: number) {
  const side = finding.side === 'right' ? 1 : -1
  const lobe = finding.location.includes('upper') ? -0.2 : finding.location.includes('lower') ? 0.22 : 0

  if (props.modality === 'MRI') {
    return {
      x: width / 2 + side * width * 0.14,
      y: height / 2 - height * 0.16,
    }
  }

  if (props.modality === 'X-Ray') {
    return {
      x: width / 2 + side * width * 0.2,
      y: height / 2 - height * 0.08,
    }
  }

  if (props.orientation === 'axial') {
    return {
      x: width / 2 + side * width * 0.16,
      y: height / 2 + lobe * height,
    }
  }

  if (props.orientation === 'coronal') {
    return {
      x: width / 2 + side * width * 0.12,
      y: height * 0.52 + lobe * height,
    }
  }

  return {
    x: width * 0.48 + side * width * 0.03,
    y: height * 0.52 + lobe * height,
  }
}

function drawMarkers(ctx: CanvasRenderingContext2D, width: number, height: number) {
  markerPoints.value = []
  const targetSlice = Math.ceil(props.sliceCount * 0.58)
  const findings = props.findings ?? []

  findings.forEach((finding) => {
    const sliceMatches =
      props.orientation !== 'axial' || Math.abs(props.sliceIndex - targetSlice) <= 2
    if (!sliceMatches) return
    const point = getMarker(finding, width, height)
    markerPoints.value.push({ finding, ...point })

    ctx.save()
    ctx.shadowColor = 'rgba(255,90,102,0.9)'
    ctx.shadowBlur = 13
    ctx.strokeStyle = '#ff6b75'
    ctx.fillStyle = 'rgba(255,107,117,0.28)'
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

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  const dpr = window.devicePixelRatio || 1
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.fillStyle = backgroundForPreset[props.preset]
  ctx.fillRect(0, 0, width, height)
  if (props.showGrid) drawGrid(ctx, width, height)

  if (props.modality === 'CT') {
    if (props.orientation === 'axial') drawCtAxial(ctx, width, height)
    if (props.orientation === 'coronal') drawCtCoronal(ctx, width, height)
    if (props.orientation === 'sagittal') drawCtSagittal(ctx, width, height)
    if (props.orientation === 'projection') drawXRay(ctx, width, height)
  } else if (props.modality === 'MRI') {
    drawBrainSlice(ctx, width, height)
  } else {
    drawXRay(ctx, width, height)
  }

  drawMarkers(ctx, width, height)
}

function handleClick(event: MouseEvent) {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) / props.zoom
  const y = (event.clientY - rect.top) / props.zoom
  const hit = markerPoints.value.find((marker) => Math.hypot(marker.x - x, marker.y - y) < 18)
  if (hit) emit('selectFinding', hit.finding.id)
}

onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    resizeCanvas()
    draw()
  })
  if (canvasRef.value) {
    resizeObserver.observe(canvasRef.value.parentElement as Element)
    resizeCanvas()
    draw()
  }
})

watch(
  () => [
    props.modality,
    props.orientation,
    props.sliceIndex,
    props.preset,
    props.showGrid,
    props.findings,
  ],
  () => draw(),
  { deep: true },
)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})
</script>

<template>
  <canvas ref="canvasRef" class="slice-canvas" @click="handleClick" />
</template>

<style scoped>
.slice-canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}
</style>
