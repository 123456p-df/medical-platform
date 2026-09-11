<script setup lang="ts">
import { computed, ref } from 'vue'
import { Maximize2, Minimize2 } from 'lucide-vue-next'
import type { Shape3D, SliceAxis } from '@/utils/volumePixels'
import { voxelToCanvas, canvasToVoxel } from '@/utils/volumePixels'
import type { RulerMeasurement } from '@/composables/useMeasurementTools'
import type { Finding } from '@/types'

const props = withDefaults(
  defineProps<{
    axis: SliceAxis
    width: number
    height: number
    sliceIndex: number
    sliceCount: number
    thicknessMm: number
    spacingMm: number
    shape?: Shape3D
    spacing?: [number, number, number]
    crosshairsCol: number
    crosshairsRow: number
    crosshairsVisible: boolean
    windowCenter: number | null
    windowWidth: number | null
    probeHU: number | null
    probeTissue?: string
    probeVoxel?: [number, number, number] | null
    rulers: RulerMeasurement[]
    activeRuler: { startCol: number; startRow: number; endCol: number; endRow: number; lengthMm: number } | null
    findings?: Finding[]
    selectedFindingId?: string | null
    isMaximized: boolean
  }>(),
  {
    shape: () => [512, 512, 100],
    spacing: () => [1, 1, 1],
    findings: () => [],
    selectedFindingId: null,
  },
)

const emit = defineEmits<{
  toggleMaximize: []
  selectFinding: [id: string]
  updateFindingBox: [
    id: string,
    centerVoxel: [number, number, number],
    boxVoxel: [number, number, number, number, number, number],
    diameterMm: number,
  ]
}>()

const axisColor = computed(() => {
  switch (props.axis) {
    case 'axial': return '#ef4444'     // Red
    case 'coronal': return '#22c55e'   // Green
    case 'sagittal': return '#eab308'  // Yellow
  }
})

// Filter rulers for the current slice
const currentSliceRulers = computed(() => {
  return props.rulers.filter(r => r.axis === props.axis && r.sliceIndex === props.sliceIndex)
})

// Drag state for interactive finding bounding box
const draggingHandle = ref<{
  findingId: string
  handle: 'tl' | 'tr' | 'bl' | 'br' | 'move'
  startClientX: number
  startClientY: number
  startCol: number
  startRow: number
  startW: number
  startH: number
} | null>(null)

// Project findings into 2D canvas coordinates
const projectedFindings = computed(() => {
  const [nx, ny, nz] = props.shape
  const result: Array<{
    finding: Finding
    col: number
    row: number
    w: number
    h: number
    depthDiff: number
    inCurrentSlice: boolean
    color: string
    statusLabel: string
  }> = []

  for (const f of props.findings) {
    // Determine 3D voxel coordinate, fallback to deterministic center if not provided
    let vx = f.centerVoxel ? f.centerVoxel[0] : Math.floor(nx * 0.42)
    let vy = f.centerVoxel ? f.centerVoxel[1] : Math.floor(ny * 0.46)
    let vz = f.centerVoxel ? f.centerVoxel[2] : Math.floor(nz * 0.5)

    // For specific mock finding IDs, give distinct coordinates in the lungs
    if (!f.centerVoxel) {
      if (f.id.endsWith('1')) {
        vx = Math.floor(nx * 0.35); vy = Math.floor(ny * 0.42); vz = Math.floor(nz * 0.6)
      } else if (f.id.endsWith('2')) {
        vx = Math.floor(nx * 0.65); vy = Math.floor(ny * 0.55); vz = Math.floor(nz * 0.45)
      }
    }

    const box = f.boxVoxel || [vx, vy, vz, 24, 24, 6]
    const proj = voxelToCanvas(props.axis, vx, vy, vz, props.shape)

    let depthDiff = 0
    let boxW = 24
    let boxH = 24
    let boxDepth = 6

    if (props.axis === 'axial') {
      depthDiff = Math.abs(props.sliceIndex - proj.sliceIndex)
      boxW = box[3]
      boxH = box[4]
      boxDepth = box[5]
    } else if (props.axis === 'coronal') {
      depthDiff = Math.abs(props.sliceIndex - proj.sliceIndex)
      boxW = box[3]
      boxH = box[5]
      boxDepth = box[4]
    } else if (props.axis === 'sagittal') {
      depthDiff = Math.abs(props.sliceIndex - proj.sliceIndex)
      boxW = box[4]
      boxH = box[5]
      boxDepth = box[3]
    }

    // Check visibility within lesion depth extent
    const maxDepth = Math.max(1, Math.round(boxDepth / 2))
    if (depthDiff <= maxDepth) {
      let color = '#f59e0b' // Pending (Amber)
      let statusLabel = '待复核'
      if (f.status === 'confirmed') {
        color = '#22c55e'
        statusLabel = '已采纳'
      } else if (f.status === 'dismissed') {
        color = '#64748b'
        statusLabel = '已忽略'
      } else if (f.status === 'modified') {
        color = '#38bdf8'
        statusLabel = '已修改'
      } else if (f.severity === 'High') {
        color = '#ef4444'
        statusLabel = '高风险'
      }

      result.push({
        finding: f,
        col: proj.col,
        row: proj.row,
        w: boxW,
        h: boxH,
        depthDiff,
        inCurrentSlice: depthDiff === 0,
        color,
        statusLabel,
      })
    }
  }

  return result
})

function startHandleDrag(
  e: PointerEvent,
  finding: Finding,
  handle: 'tl' | 'tr' | 'bl' | 'br' | 'move',
  col: number,
  row: number,
  w: number,
  h: number,
) {
  e.stopPropagation()
  e.preventDefault()
  emit('selectFinding', finding.id)

  draggingHandle.value = {
    findingId: finding.id,
    handle,
    startClientX: e.clientX,
    startClientY: e.clientY,
    startCol: col,
    startRow: row,
    startW: w,
    startH: h,
  }

  window.addEventListener('pointermove', onHandlePointerMove)
  window.addEventListener('pointerup', onHandlePointerUp)
}

function onHandlePointerMove(e: PointerEvent) {
  if (!draggingHandle.value) return
  const drag = draggingHandle.value
  const dx = e.clientX - drag.startClientX
  const dy = e.clientY - drag.startClientY

  const target = props.findings.find(f => f.id === drag.findingId)
  if (!target) return

  let newW = drag.startW
  let newH = drag.startH
  let newCol = drag.startCol
  let newRow = drag.startRow

  if (drag.handle === 'br') {
    newW = Math.max(10, Math.round(drag.startW + dx * 2))
    newH = Math.max(10, Math.round(drag.startH + dy * 2))
  } else if (drag.handle === 'tl') {
    newW = Math.max(10, Math.round(drag.startW - dx * 2))
    newH = Math.max(10, Math.round(drag.startH - dy * 2))
  } else if (drag.handle === 'tr') {
    newW = Math.max(10, Math.round(drag.startW + dx * 2))
    newH = Math.max(10, Math.round(drag.startH - dy * 2))
  } else if (drag.handle === 'bl') {
    newW = Math.max(10, Math.round(drag.startW - dx * 2))
    newH = Math.max(10, Math.round(drag.startH + dy * 2))
  } else if (drag.handle === 'move') {
    newCol = Math.round(drag.startCol + dx)
    newRow = Math.round(drag.startRow + dy)
  }

  // Convert canvas back to 3D voxel
  const [vx, vy, vz] = canvasToVoxel(props.axis, newCol, newRow, props.sliceIndex, props.shape)
  const sx = props.spacing[0]
  const sy = props.spacing[1]
  const newDiameter = Math.max(newW * sx, newH * sy)

  const newBox: [number, number, number, number, number, number] = [
    vx,
    vy,
    vz,
    newW,
    newH,
    target.boxVoxel ? target.boxVoxel[5] : 6,
  ]

  emit('updateFindingBox', target.id, [vx, vy, vz], newBox, Number(newDiameter.toFixed(1)))
}

function onHandlePointerUp() {
  draggingHandle.value = null
  window.removeEventListener('pointermove', onHandlePointerMove)
  window.removeEventListener('pointerup', onHandlePointerUp)
}
</script>

<template>
  <div class="overlay-container" :style="{ width: width + 'px', height: height + 'px' }">
    <svg
      class="overlay-svg"
      :viewBox="`0 0 ${width} ${height}`"
      preserveAspectRatio="none"
    >
      <!-- 3D 联动十字光标 -->
      <g v-if="crosshairsVisible && crosshairsCol >= 0 && crosshairsRow >= 0" class="crosshairs-group">
        <!-- 水平线 -->
        <line
          :x1="0"
          :y1="crosshairsRow"
          :x2="Math.max(0, crosshairsCol - 6)"
          :y2="crosshairsRow"
          :stroke="axisColor"
          stroke-width="1.2"
          stroke-dasharray="4,3"
          opacity="0.85"
        />
        <line
          :x1="Math.min(width, crosshairsCol + 6)"
          :y1="crosshairsRow"
          :x2="width"
          :y2="crosshairsRow"
          :stroke="axisColor"
          stroke-width="1.2"
          stroke-dasharray="4,3"
          opacity="0.85"
        />

        <!-- 垂直线 -->
        <line
          :x1="crosshairsCol"
          :y1="0"
          :x2="crosshairsCol"
          :y2="Math.max(0, crosshairsRow - 6)"
          :stroke="axisColor"
          stroke-width="1.2"
          stroke-dasharray="4,3"
          opacity="0.85"
        />
        <line
          :x1="crosshairsCol"
          :y1="Math.min(height, crosshairsRow + 6)"
          :x2="crosshairsCol"
          :y2="height"
          :stroke="axisColor"
          stroke-width="1.2"
          stroke-dasharray="4,3"
          opacity="0.85"
        />

        <!-- 中心相交小环 -->
        <circle
          :cx="crosshairsCol"
          :cy="crosshairsRow"
          r="4"
          fill="none"
          :stroke="axisColor"
          stroke-width="1.2"
          opacity="0.9"
        />
      </g>

      <!-- AI 结节 / 病灶候选 2D 空间标注与可调节包围盒 -->
      <g
        v-for="pf in projectedFindings"
        :key="pf.finding.id"
        class="finding-group"
        :class="{
          selected: selectedFindingId === pf.finding.id,
          adjacent: !pf.inCurrentSlice,
        }"
      >
        <!-- 脉冲提示环（仅选中时显示） -->
        <circle
          v-if="selectedFindingId === pf.finding.id && pf.inCurrentSlice"
          :cx="pf.col"
          :cy="pf.row"
          :r="Math.max(pf.w, pf.h) / 2 + 10"
          fill="none"
          stroke="#5ce6d4"
          stroke-width="1.5"
          opacity="0.75"
          class="pulse-ring"
        />

        <!-- 病灶包围椭圆 / 矩形 -->
        <rect
          :x="pf.col - pf.w / 2"
          :y="pf.row - pf.h / 2"
          :width="pf.w"
          :height="pf.h"
          rx="4"
          fill="rgba(15, 23, 42, 0.25)"
          :stroke="selectedFindingId === pf.finding.id ? '#5ce6d4' : pf.color"
          :stroke-width="selectedFindingId === pf.finding.id ? 2 : 1.4"
          :stroke-dasharray="pf.inCurrentSlice ? 'none' : '3,3'"
          :opacity="pf.inCurrentSlice ? 1 : 0.65"
          class="finding-box"
          @pointerdown.stop="startHandleDrag($event, pf.finding, 'move', pf.col, pf.row, pf.w, pf.h)"
        />

        <!-- 中心十字靶标 -->
        <line
          :x1="pf.col - 3"
          :y1="pf.row"
          :x2="pf.col + 3"
          :y2="pf.row"
          :stroke="pf.color"
          stroke-width="1.2"
        />
        <line
          :x1="pf.col"
          :y1="pf.row - 3"
          :x2="pf.col"
          :y2="pf.row + 3"
          :stroke="pf.color"
          stroke-width="1.2"
        />

        <!-- 悬浮信息胶囊 -->
        <g :transform="`translate(${pf.col}, ${pf.row - pf.h / 2 - 12})`">
          <rect
            :x="-42"
            :y="-12"
            width="84"
            height="14"
            rx="3"
            :fill="selectedFindingId === pf.finding.id ? 'rgba(92, 230, 212, 0.95)' : 'rgba(15, 23, 42, 0.85)'"
            :stroke="pf.color"
            stroke-width="0.8"
          />
          <text
            :x="0"
            :y="-2"
            text-anchor="middle"
            :fill="selectedFindingId === pf.finding.id ? '#09151e' : '#f8fafc'"
            font-size="9"
            font-weight="600"
            font-family="system-ui, sans-serif"
          >
            {{ pf.statusLabel }} · {{ (pf.finding.diameterMm || 10).toFixed(1) }}mm
          </text>
        </g>

        <!-- 选中态交互微调控制点 (4 个角点) -->
        <template v-if="selectedFindingId === pf.finding.id && pf.inCurrentSlice">
          <!-- Top-Left -->
          <rect
            :x="pf.col - pf.w / 2 - 4"
            :y="pf.row - pf.h / 2 - 4"
            width="8"
            height="8"
            rx="1"
            fill="#5ce6d4"
            stroke="#09151e"
            stroke-width="1"
            class="handle-cursor-nwse"
            @pointerdown.stop="startHandleDrag($event, pf.finding, 'tl', pf.col, pf.row, pf.w, pf.h)"
          />
          <!-- Top-Right -->
          <rect
            :x="pf.col + pf.w / 2 - 4"
            :y="pf.row - pf.h / 2 - 4"
            width="8"
            height="8"
            rx="1"
            fill="#5ce6d4"
            stroke="#09151e"
            stroke-width="1"
            class="handle-cursor-nesw"
            @pointerdown.stop="startHandleDrag($event, pf.finding, 'tr', pf.col, pf.row, pf.w, pf.h)"
          />
          <!-- Bottom-Left -->
          <rect
            :x="pf.col - pf.w / 2 - 4"
            :y="pf.row + pf.h / 2 - 4"
            width="8"
            height="8"
            rx="1"
            fill="#5ce6d4"
            stroke="#09151e"
            stroke-width="1"
            class="handle-cursor-nesw"
            @pointerdown.stop="startHandleDrag($event, pf.finding, 'bl', pf.col, pf.row, pf.w, pf.h)"
          />
          <!-- Bottom-Right -->
          <rect
            :x="pf.col + pf.w / 2 - 4"
            :y="pf.row + pf.h / 2 - 4"
            width="8"
            height="8"
            rx="1"
            fill="#5ce6d4"
            stroke="#09151e"
            stroke-width="1"
            class="handle-cursor-nwse"
            @pointerdown.stop="startHandleDrag($event, pf.finding, 'br', pf.col, pf.row, pf.w, pf.h)"
          />
        </template>
      </g>

      <!-- 测量标尺已完成项 -->
      <g v-for="ruler in currentSliceRulers" :key="ruler.id" class="ruler-group">
        <line
          :x1="ruler.startCol"
          :y1="ruler.startRow"
          :x2="ruler.endCol"
          :y2="ruler.endRow"
          stroke="#38bdf8"
          stroke-width="1.8"
        />
        <circle :cx="ruler.startCol" :cy="ruler.startRow" r="2.5" fill="#38bdf8" />
        <circle :cx="ruler.endCol" :cy="ruler.endRow" r="2.5" fill="#38bdf8" />
        <rect
          :x="(ruler.startCol + ruler.endCol) / 2 - 24"
          :y="(ruler.startRow + ruler.endRow) / 2 - 14"
          width="48"
          height="16"
          rx="3"
          fill="rgba(15, 23, 42, 0.85)"
          stroke="#38bdf8"
          stroke-width="0.8"
        />
        <text
          :x="(ruler.startCol + ruler.endCol) / 2"
          :y="(ruler.startRow + ruler.endRow) / 2 - 2"
          text-anchor="middle"
          fill="#e0f2fe"
          font-size="10"
          font-family="monospace"
        >
          {{ ruler.lengthMm.toFixed(1) }}mm
        </text>
      </g>

      <!-- 正在绘制的测量标尺 -->
      <g v-if="activeRuler" class="active-ruler-group">
        <line
          :x1="activeRuler.startCol"
          :y1="activeRuler.startRow"
          :x2="activeRuler.endCol"
          :y2="activeRuler.endRow"
          stroke="#f59e0b"
          stroke-width="1.8"
          stroke-dasharray="3,2"
        />
        <circle :cx="activeRuler.startCol" :cy="activeRuler.startRow" r="3" fill="#f59e0b" />
        <circle :cx="activeRuler.endCol" :cy="activeRuler.endRow" r="3" fill="#f59e0b" />
        <rect
          :x="(activeRuler.startCol + activeRuler.endCol) / 2 - 24"
          :y="(activeRuler.startRow + activeRuler.endRow) / 2 - 14"
          width="48"
          height="16"
          rx="3"
          fill="rgba(15, 23, 42, 0.85)"
          stroke="#f59e0b"
          stroke-width="0.8"
        />
        <text
          :x="(activeRuler.startCol + activeRuler.endCol) / 2"
          :y="(activeRuler.startRow + activeRuler.endRow) / 2 - 2"
          text-anchor="middle"
          fill="#fef3c7"
          font-size="10"
          font-family="monospace"
        >
          {{ activeRuler.lengthMm.toFixed(1) }}mm
        </text>
      </g>
    </svg>

    <!-- 顶部四角 HUD 信息 -->
    <div class="hud-top-right">
      <button
        class="hud-btn"
        :title="isMaximized ? '还原网格布局' : '最大化视口'"
        @click.stop="emit('toggleMaximize')"
      >
        <component :is="isMaximized ? Minimize2 : Maximize2" :size="13" />
      </button>
    </div>

    <!-- 底部 HUD 信息栏 (标准 PACS 四角标注) -->
    <div class="hud-bottom-left">
      <span class="hud-item">
        Slice: <strong>{{ sliceIndex + 1 }} / {{ sliceCount }}</strong>
      </span>
      <span class="hud-item">Thk: {{ thicknessMm.toFixed(2) }} mm</span>
    </div>

    <div class="hud-bottom-right">
      <span v-if="windowWidth !== null && windowCenter !== null" class="hud-item">
        W: <strong>{{ windowWidth }}</strong> L: <strong>{{ windowCenter }}</strong>
      </span>
      <span v-if="probeHU !== null" class="hud-item probe-hud">
        HU: <strong>{{ probeHU }}</strong>
        <small v-if="probeTissue">({{ probeTissue }})</small>
      </span>
    </div>
  </div>
</template>

<style scoped>
.overlay-container {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  overflow: hidden;
  user-select: none;
}

.overlay-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.finding-box {
  pointer-events: auto;
  cursor: grab;
  transition: stroke 0.15s ease;
}

.finding-box:hover {
  stroke: #5ce6d4 !important;
  stroke-width: 2 !important;
}

.handle-cursor-nwse {
  pointer-events: auto;
  cursor: nwse-resize;
}

.handle-cursor-nesw {
  pointer-events: auto;
  cursor: nesw-resize;
}

.pulse-ring {
  animation: pulse-ring 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
  transform-origin: center;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.2;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.8;
  }
}

.hud-top-right {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  pointer-events: auto;
}

.hud-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #94a3b8;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.hud-btn:hover {
  background: rgba(30, 41, 59, 0.95);
  color: #5ce6d4;
  border-color: #5ce6d4;
}

.hud-bottom-left {
  position: absolute;
  bottom: 8px;
  left: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: rgba(10, 20, 26, 0.7);
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 10px;
  color: #94a3b8;
  font-family: monospace;
}

.hud-bottom-right {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  background: rgba(10, 20, 26, 0.7);
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 10px;
  color: #94a3b8;
  font-family: monospace;
}

.hud-item strong {
  color: #f1f5f9;
}

.probe-hud {
  color: #5ce6d4;
}

.probe-hud strong {
  color: #5ce6d4;
}

.probe-hud small {
  color: #99f6e4;
  margin-left: 2px;
  font-size: 9px;
}
</style>
