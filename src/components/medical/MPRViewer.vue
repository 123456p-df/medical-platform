<script setup lang="ts">
import { ref, shallowRef, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { ScanLine, Check, X, Sparkles } from 'lucide-vue-next'
import type { Examination, Finding } from '@/types'
import SliceViewport from './SliceViewport.vue'
import ViewportToolbar from './ViewportToolbar.vue'
import DigitalHumanViewer from '@/components/3d/DigitalHumanViewer.vue'
import { usePatientStore } from '@/stores/patients'
import { ApiError, request } from '@/api/client'
import { VolumeRenderer } from '@/utils/volumeRenderer'
import type { Shape3D, SliceAxis } from '@/utils/volumePixels'
import { useCrosshairs } from '@/composables/useCrosshairs'
import { activeMedicalTool } from '@/composables/useViewportGestures'

const props = defineProps<{
  examination: Examination
  findings?: Finding[]
}>()

const emit = defineEmits<{
  selectFinding: [id: string]
}>()

const patientStore = usePatientStore()
const preset = ref('auto')
const zoom = ref(1)
const layout = ref<'mpr' | 'compare' | 'ai' | '3d' | 'single'>('mpr')
const maximizedAxis = ref<SliceAxis | null>(null)
const selectedFindingId = ref<string | null>(null)
const reviewedCount = computed(() => (props.findings || []).filter(f => f.status !== 'pending').length)

// 3D Crosshairs initialization
const { initCrosshairs, visible: crosshairsVisible, setVoxel } = useCrosshairs()

// Volume rendering state
const renderer = shallowRef<VolumeRenderer | null>(null)
const progress = ref(0)
const loading = ref(false)
const error = ref('')
const blocked = ref(false)
const retry = ref(0)

// Cine loop playback state
const isPlaying = ref(false)
const cineFps = ref(20)
let cineTimer: ReturnType<typeof setInterval> | undefined

// Slice positions for axes
const axialPosition = ref(0.5)
const coronalPosition = ref(0.5)
const sagittalPosition = ref(0.5)

// Jump to finding coordinate and synchronize 2D/3D views
function jumpToFinding(findingOrId: Finding | string) {
  const list = props.findings || []
  const finding = typeof findingOrId === 'string' ? list.find(f => f.id === findingOrId) : findingOrId
  if (!finding) return

  const shape = (props.examination.shape || [512, 512, 100]) as Shape3D
  const [nx, ny, nz] = shape
  let vx = finding.centerVoxel ? finding.centerVoxel[0] : Math.floor(nx * 0.42)
  let vy = finding.centerVoxel ? finding.centerVoxel[1] : Math.floor(ny * 0.46)
  let vz = finding.centerVoxel ? finding.centerVoxel[2] : Math.floor(nz * 0.5)

  if (!finding.centerVoxel) {
    if (finding.id.endsWith('1')) {
      vx = Math.floor(nx * 0.35); vy = Math.floor(ny * 0.42); vz = Math.floor(nz * 0.6)
    } else if (finding.id.endsWith('2')) {
      vx = Math.floor(nx * 0.65); vy = Math.floor(ny * 0.55); vz = Math.floor(nz * 0.45)
    }
  }

  axialPosition.value = Math.max(0, Math.min(1, vz / (nz - 1 || 1)))
  coronalPosition.value = Math.max(0, Math.min(1, vy / (ny - 1 || 1)))
  sagittalPosition.value = Math.max(0, Math.min(1, vx / (nx - 1 || 1)))

  selectedFindingId.value = finding.id
  emit('selectFinding', finding.id)
  setVoxel(vx, vy, vz, shape)
}

function jumpToNextFinding(step: number = 1) {
  const list = props.findings || []
  if (list.length === 0) return
  let idx = list.findIndex(f => f.id === selectedFindingId.value)
  if (idx < 0) {
    idx = 0
  } else {
    idx = (idx + step + list.length) % list.length
  }
  jumpToFinding(list[idx])
}

async function quickAuditFinding(id: string, status: Finding['status']) {
  try {
    await patientStore.updateFindingStatus(id, status)
    const item = (props.findings || []).find(f => f.id === id)
    if (item) item.status = status
  } catch (err) {
    console.error('Audit update error:', err)
  }
}

function onUpdateFindingBox(
  id: string,
  centerVoxel: [number, number, number],
  boxVoxel: [number, number, number, number, number, number],
  diameterMm: number,
) {
  patientStore.updateFindingBox(id, centerVoxel, boxVoxel, diameterMm)
}

watch(
  () => props.examination.id,
  () => {
    preset.value = props.examination.type === 'CT' ? 'lung' : 'auto'
    zoom.value = 1
    maximizedAxis.value = null
    isPlaying.value = false
    clearInterval(cineTimer)
    if (props.examination.shape) {
      initCrosshairs(props.examination.shape as Shape3D)
    }
  },
  { immediate: true },
)

watch(
  [() => props.examination.id, retry],
  async (_, __, onCleanup) => {
    renderer.value = null
    loading.value = true
    progress.value = 0
    error.value = ''
    blocked.value = false

    let disposed = false
    let engine: VolumeRenderer | undefined
    const guard = new AbortController()
    const imageId = props.examination.id

    function fail(reason: unknown) {
      if (disposed) return
      error.value = reason instanceof Error ? reason.message : '连续浏览加载失败，可重试'
      if (reason instanceof ApiError && [401, 403, 404].includes(reason.status)) {
        blocked.value = true
      }
      renderer.value = null
      engine?.dispose()
      loading.value = false
    }

    let checking = false
    const timer = setInterval(async () => {
      if (checking || disposed) return
      checking = true
      try {
        await request('/medical-images/' + imageId, { signal: guard.signal })
      } catch (reason) {
        if (reason instanceof ApiError && [401, 403, 404].includes(reason.status)) fail(reason)
      } finally {
        checking = false
      }
    }, 30000)

    onCleanup(() => {
      disposed = true
      clearInterval(timer)
      guard.abort()
      engine?.dispose()
    })

    try {
      const shape = props.examination.shape
      if (!shape || shape.length !== 3) throw new Error('缺少三维体积信息，使用逐张预览')
      initCrosshairs(shape as Shape3D)
      engine = new VolumeRenderer(fail)
      await engine.load(imageId, shape as Shape3D, value => {
        if (!disposed) progress.value = value
      })
      if (!disposed) {
        renderer.value = engine
        loading.value = false
      }
    } catch (reason) {
      fail(reason)
    }
  },
  { immediate: true },
)

// Cine Loop Playback implementation
function toggleCine() {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    clearInterval(cineTimer)
    cineTimer = setInterval(() => {
      // Step axial position forward
      const step = 0.015
      let next = axialPosition.value + step
      if (next > 1.0) next = 0.0
      axialPosition.value = next
    }, 1000 / cineFps.value)
  } else {
    clearInterval(cineTimer)
  }
}

// Global keyboard shortcuts for PACS ergonomics
function onKeyDown(e: KeyboardEvent) {
  // Ignore inside inputs or textareas
  const target = e.target as HTMLElement
  if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return

  if (e.code === 'Space') {
    e.preventDefault()
    toggleCine()
  } else if (e.key === '1') {
    preset.value = 'lung'
  } else if (e.key === '2') {
    preset.value = 'soft'
  } else if (e.key === '3') {
    preset.value = 'bone'
  } else if (e.key === '4') {
    preset.value = 'brain'
  } else if (e.key === 'c' || e.key === 'C') {
    crosshairsVisible.value = !crosshairsVisible.value
  } else if (e.key === 'v' || e.key === 'V') {
    activeMedicalTool.value = 'pointer'
  } else if (e.key === 'w' || e.key === 'W') {
    activeMedicalTool.value = 'ww_wl'
  } else if (e.key === 'm' || e.key === 'M') {
    activeMedicalTool.value = 'ruler'
  } else if (e.key === 'h' || e.key === 'H') {
    activeMedicalTool.value = 'probe'
  } else if (e.key === 'p' || e.key === 'P') {
    activeMedicalTool.value = 'pan'
  } else if (e.key === 'Tab') {
    if (props.findings && props.findings.length > 0) {
      e.preventDefault()
      jumpToNextFinding(e.shiftKey ? -1 : 1)
    }
  } else if (e.key === 'n' || e.key === 'N') {
    if (props.findings && props.findings.length > 0) {
      e.preventDefault()
      jumpToNextFinding(e.shiftKey ? -1 : 1)
    }
  } else if (e.key === 'a' || e.key === 'A') {
    if (selectedFindingId.value) {
      e.preventDefault()
      quickAuditFinding(selectedFindingId.value, 'confirmed')
    }
  } else if (e.key === 'r' || e.key === 'R') {
    if (selectedFindingId.value) {
      e.preventDefault()
      quickAuditFinding(selectedFindingId.value, 'dismissed')
    }
  } else if (e.key === 'e' || e.key === 'E') {
    if (selectedFindingId.value) {
      e.preventDefault()
      quickAuditFinding(selectedFindingId.value, 'modified')
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  clearInterval(cineTimer)
})

function toggleMaximize(axis: SliceAxis) {
  if (maximizedAxis.value === axis) {
    maximizedAxis.value = null
  } else {
    maximizedAxis.value = axis
  }
}

function handleZoomIn() {
  zoom.value = Math.min(4, Number((zoom.value + 0.25).toFixed(2)))
}

function handleZoomOut() {
  zoom.value = Math.max(0.75, Number((zoom.value - 0.25).toFixed(2)))
}

function handleResetView() {
  zoom.value = 1
  maximizedAxis.value = null
}
</script>

<template>
  <section class="mpr-viewer">
    <!-- 专业级医学影像交互工具条 -->
    <ViewportToolbar
      v-model:preset="preset"
      v-model:layout="layout"
      :zoom="zoom"
      :is-playing="isPlaying"
      :fps="cineFps"
      :is-c-t="examination.type === 'CT'"
      @zoom-in="handleZoomIn"
      @zoom-out="handleZoomOut"
      @reset-view="handleResetView"
      @toggle-play="toggleCine"
      @update-fps="cineFps = $event"
    />

    <!-- 体积加载进度与状态提示 -->
    <div class="volume-status" role="status">
      <div class="status-left">
        <ScanLine :size="15" class="status-icon" />
        <strong>{{ examination.type }} · {{ $t(examination.organ) }}</strong>
        <span class="status-divider">|</span>
        <span v-if="loading" class="status-text">
          正在加载高分辨率体素矩阵 {{ progress }}%
        </span>
        <span v-else-if="renderer" class="status-text ready">
          PACS 连续体素就绪 · 右键调窗 / 中键平移 / 滚轮切层 / 双击全屏
        </span>
        <span v-else class="status-text error">
          {{ error }}
          <button v-if="!blocked" class="retry-btn" @click="retry++">重试</button>
        </span>
      </div>

      <div v-if="loading" class="status-right">
        <progress :value="progress" max="100" aria-label="影像加载进度" />
      </div>
    </div>

    <!-- 核心多视口网格容器 -->
    <div :class="['mpr-container', layout, { has_maximized: Boolean(maximizedAxis) }]">
      <!-- 单视口最大化模式 -->
      <template v-if="maximizedAxis">
        <SliceViewport
          :key="examination.id + maximizedAxis + '_max'"
          :examination="examination"
          :axis="maximizedAxis"
          :preset="preset"
          :zoom="zoom"
          :renderer="renderer"
          :blocked="blocked"
          :findings="findings"
          :selected-finding-id="selectedFindingId"
          :is-maximized="true"
          :position="
            maximizedAxis === 'axial'
              ? axialPosition
              : maximizedAxis === 'coronal'
              ? coronalPosition
              : sagittalPosition
          "
          @position-change="
            maximizedAxis === 'axial'
              ? (axialPosition = $event)
              : maximizedAxis === 'coronal'
              ? (coronalPosition = $event)
              : (sagittalPosition = $event)
          "
          @select-finding="jumpToFinding($event)"
          @update-finding-box="onUpdateFindingBox"
          @toggle-maximize="toggleMaximize(maximizedAxis)"
        />
      </template>

      <!-- 经典 MPR 正交四分屏布局 -->
      <template v-else-if="layout === 'mpr'">
        <div class="mpr-grid">
          <!-- 轴向 (Axial) -->
          <SliceViewport
            :key="examination.id + 'axial'"
            :examination="examination"
            axis="axial"
            :preset="preset"
            :zoom="zoom"
            :renderer="renderer"
            :blocked="blocked"
            :findings="findings"
            :selected-finding-id="selectedFindingId"
            :position="axialPosition"
            @position-change="axialPosition = $event"
            @select-finding="jumpToFinding($event)"
            @update-finding-box="onUpdateFindingBox"
            @toggle-maximize="toggleMaximize('axial')"
          />

          <!-- 冠状位 (Coronal) -->
          <SliceViewport
            :key="examination.id + 'coronal'"
            :examination="examination"
            axis="coronal"
            :preset="preset"
            :zoom="zoom"
            :renderer="renderer"
            :blocked="blocked"
            :findings="findings"
            :selected-finding-id="selectedFindingId"
            :position="coronalPosition"
            @position-change="coronalPosition = $event"
            @select-finding="jumpToFinding($event)"
            @update-finding-box="onUpdateFindingBox"
            @toggle-maximize="toggleMaximize('coronal')"
          />

          <!-- 矢状位 (Sagittal) -->
          <SliceViewport
            :key="examination.id + 'sagittal'"
            :examination="examination"
            axis="sagittal"
            :preset="preset"
            :zoom="zoom"
            :renderer="renderer"
            :blocked="blocked"
            :findings="findings"
            :selected-finding-id="selectedFindingId"
            :position="sagittalPosition"
            @position-change="sagittalPosition = $event"
            @select-finding="jumpToFinding($event)"
            @update-finding-box="onUpdateFindingBox"
            @toggle-maximize="toggleMaximize('sagittal')"
          />

          <!-- 第四象限：影像元数据与解剖体素参数 -->
          <aside class="study-info-card">
            <div class="info-header">
              <span class="info-badge"><ScanLine :size="18" /></span>
              <div>
                <small class="info-eyebrow">VOLUME RECONSTRUCTION</small>
                <h3>{{ examination.type }} 正交体素重建</h3>
              </div>
            </div>

            <dl class="meta-grid">
              <dt>体素矩阵</dt>
              <dd>{{ examination.shape?.join(' × ') || '512 × 512' }}</dd>
              <dt>体素间距</dt>
              <dd>{{ examination.spacing?.map(v => v.toFixed(3)).join(' × ') }} mm</dd>
              <dt>切片总数</dt>
              <dd>{{ examination.sliceCount || '—' }} 层</dd>
              <dt>解剖坐标系</dt>
              <dd>RAS (Right-Anterior-Superior)</dd>
              <dt>当前预设</dt>
              <dd class="highlight">{{ preset.toUpperCase() }}</dd>
            </dl>

            <div class="shortcuts-guide">
              <h4>PACS 快捷操作指南</h4>
              <ul>
                <li><kbd>右键拖拽</kbd> 动态调节窗宽窗位 (WW/WL)</li>
                <li><kbd>中键拖拽</kbd> 自由平移画布 (Pan)</li>
                <li><kbd>滚轮</kbd> 快速切层 · <kbd>Ctrl+滚轮</kbd> 缩放</li>
                <li><kbd>Tab</kbd> / <kbd>N</kbd> 极速切换病灶 · <kbd>A</kbd> 采纳 · <kbd>R</kbd> 驳回</li>
                <li><kbd>双击视口</kbd> 单视口最大化 / 还原</li>
                <li><kbd>Space</kbd> 电影连读回放 (Cine)</li>
                <li><kbd>1</kbd>~<kbd>4</kbd> 肺窗/软组织/骨窗/脑窗</li>
                <li><kbd>C</kbd> 开关 3D 联动十字光标</li>
              </ul>
            </div>
          </aside>
        </div>
      </template>

      <!-- AI 深度阅片模式 -->
      <template v-else-if="layout === 'ai'">
        <div class="ai-layout-grid">
          <div class="main-viewport-col">
            <SliceViewport
              :key="examination.id + 'axial_ai'"
              :examination="examination"
              axis="axial"
              :preset="preset"
              :zoom="zoom"
              :renderer="renderer"
              :blocked="blocked"
              :findings="findings"
              :selected-finding-id="selectedFindingId"
              :position="axialPosition"
              @position-change="axialPosition = $event"
              @select-finding="jumpToFinding($event)"
              @update-finding-box="onUpdateFindingBox"
              @toggle-maximize="toggleMaximize('axial')"
            />
          </div>
          <div class="side-viewports-col">
            <SliceViewport
              :key="examination.id + 'coronal_ai'"
              :examination="examination"
              axis="coronal"
              :preset="preset"
              :zoom="zoom"
              :renderer="renderer"
              :blocked="blocked"
              compact
              :findings="findings"
              :selected-finding-id="selectedFindingId"
              :position="coronalPosition"
              @position-change="coronalPosition = $event"
              @select-finding="jumpToFinding($event)"
              @update-finding-box="onUpdateFindingBox"
              @toggle-maximize="toggleMaximize('coronal')"
            />
            <SliceViewport
              :key="examination.id + 'sagittal_ai'"
              :examination="examination"
              axis="sagittal"
              :preset="preset"
              :zoom="zoom"
              :renderer="renderer"
              :blocked="blocked"
              compact
              :findings="findings"
              :selected-finding-id="selectedFindingId"
              :position="sagittalPosition"
              @position-change="sagittalPosition = $event"
              @select-finding="jumpToFinding($event)"
              @update-finding-box="onUpdateFindingBox"
              @toggle-maximize="toggleMaximize('sagittal')"
            />
          </div>
        </div>
      </template>

      <!-- 3D 全景解剖与 2D MPR 空间联动布局 -->
      <template v-else-if="layout === '3d'">
        <div class="layout-3d-grid">
          <div class="viewport-3d-main">
            <DigitalHumanViewer
              :selected-organ-id="examination.organId"
              :slice-axis="'axial'"
              :slice-position="axialPosition"
              :show-slicing-plane="true"
              :enable-clipping="true"
              @navigate-slice="(pos: number) => { axialPosition = pos }"
              @select="() => {}"
            />
          </div>
          <div class="viewports-3d-mpr">
            <SliceViewport
              :key="examination.id + 'axial_3d'"
              :examination="examination"
              axis="axial"
              :preset="preset"
              :zoom="zoom"
              :renderer="renderer"
              :blocked="blocked"
              :findings="findings"
              :selected-finding-id="selectedFindingId"
              :position="axialPosition"
              @position-change="axialPosition = $event"
              @select-finding="jumpToFinding($event)"
              @update-finding-box="onUpdateFindingBox"
              @toggle-maximize="toggleMaximize('axial')"
            />
            <div class="side-pair">
              <SliceViewport
                :key="examination.id + 'coronal_3d'"
                :examination="examination"
                axis="coronal"
                :preset="preset"
                :zoom="zoom"
                :renderer="renderer"
                :blocked="blocked"
                compact
                :findings="findings"
                :selected-finding-id="selectedFindingId"
                :position="coronalPosition"
                @position-change="coronalPosition = $event"
                @select-finding="jumpToFinding($event)"
                @update-finding-box="onUpdateFindingBox"
                @toggle-maximize="toggleMaximize('coronal')"
              />
              <SliceViewport
                :key="examination.id + 'sagittal_3d'"
                :examination="examination"
                axis="sagittal"
                :preset="preset"
                :zoom="zoom"
                :renderer="renderer"
                :blocked="blocked"
                compact
                :findings="findings"
                :selected-finding-id="selectedFindingId"
                :position="sagittalPosition"
                @position-change="sagittalPosition = $event"
                @select-finding="jumpToFinding($event)"
                @update-finding-box="onUpdateFindingBox"
                @toggle-maximize="toggleMaximize('sagittal')"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- 多期对比或其它模式通用网格 -->
      <template v-else>
        <div class="mpr-grid">
          <SliceViewport
            v-for="axis in (['axial', 'coronal', 'sagittal'] as const)"
            :key="examination.id + axis"
            :examination="examination"
            :axis="axis"
            :preset="preset"
            :zoom="zoom"
            :renderer="renderer"
            :blocked="blocked"
            :findings="findings"
            :selected-finding-id="selectedFindingId"
            :position="
              axis === 'axial'
                ? axialPosition
                : axis === 'coronal'
                ? coronalPosition
                : sagittalPosition
            "
            @position-change="
              axis === 'axial'
                ? (axialPosition = $event)
                : axis === 'coronal'
                ? (coronalPosition = $event)
                : (sagittalPosition = $event)
            "
            @select-finding="jumpToFinding($event)"
            @update-finding-box="onUpdateFindingBox"
            @toggle-maximize="toggleMaximize(axis)"
          />
        </div>
      </template>
    </div>

    <!-- 专业级 AI 结节/病灶极速审核坞 (PACS Quick-Audit Dock) -->
    <div v-if="findings && findings.length > 0" class="finding-audit-dock">
      <div class="dock-header">
        <div class="dock-title">
          <Sparkles :size="15" class="dock-icon" />
          <strong>AI 结节与病灶候选审核</strong>
          <span class="dock-counter">{{ reviewedCount }} / {{ findings.length }} 已处理</span>
        </div>
        <div class="dock-shortcuts-tip">
          <span class="tip-kbd"><kbd>Tab</kbd> / <kbd>N</kbd> 切病灶</span>
          <span class="tip-kbd"><kbd>A</kbd> 采纳</span>
          <span class="tip-kbd"><kbd>R</kbd> 驳回</span>
          <span class="tip-kbd"><kbd>E</kbd> 编辑</span>
          <span class="tip-kbd">拖拽角点调大小</span>
        </div>
      </div>

      <div class="dock-pills-list">
        <div
          v-for="(finding, idx) in findings"
          :key="finding.id"
          class="finding-pill"
          :class="{
            active: selectedFindingId === finding.id,
            confirmed: finding.status === 'confirmed',
            dismissed: finding.status === 'dismissed',
            modified: finding.status === 'modified',
          }"
          @click="jumpToFinding(finding)"
        >
          <div class="pill-info">
            <span class="pill-index">#{{ idx + 1 }}</span>
            <span class="pill-label">{{ finding.label }}</span>
            <span class="pill-size" v-if="finding.diameterMm">{{ finding.diameterMm.toFixed(1) }}mm</span>
            <span class="pill-status" :class="finding.status">
              {{
                finding.status === 'confirmed' ? '已采纳' :
                finding.status === 'dismissed' ? '已忽略' :
                finding.status === 'modified' ? '已修改' : '待复核'
              }}
            </span>
          </div>

          <div class="pill-actions">
            <button
              class="pill-btn confirm-btn"
              :class="{ active: finding.status === 'confirmed' }"
              title="采纳此发现 (快捷键 A)"
              @click.stop="quickAuditFinding(finding.id, 'confirmed')"
            >
              <Check :size="12" />
              <span>采纳</span>
            </button>
            <button
              class="pill-btn dismiss-btn"
              :class="{ active: finding.status === 'dismissed' }"
              title="驳回/忽略此发现 (快捷键 R)"
              @click.stop="quickAuditFinding(finding.id, 'dismissed')"
            >
              <X :size="12" />
              <span>忽略</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mpr-viewer {
  background: #0d161d;
  border: 1px solid #20333f;
  border-radius: 10px;
  overflow: hidden;
  color: #d2e4e7;
  display: flex;
  flex-direction: column;
}

.volume-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 14px;
  background: #091218;
  border-bottom: 1px solid #1a2a34;
  font-size: 11px;
}

.status-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-icon {
  color: #5ce6d4;
}

.status-divider {
  color: #2b3f4c;
}

.status-text {
  color: #8da9b2;
}

.status-text.ready {
  color: #5ce6d4;
}

.status-text.error {
  color: #f87171;
}

.retry-btn {
  background: transparent;
  border: 1px solid #487468;
  color: #acd6c8;
  border-radius: 4px;
  margin-left: 8px;
  padding: 2px 6px;
  font-size: 10px;
  cursor: pointer;
}

.status-right progress {
  width: 120px;
  height: 4px;
  accent-color: #5ce6d4;
}

.mpr-container {
  padding: 10px;
  background: #070e13;
  flex: 1;
}

.mpr-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.ai-layout-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 10px;
}

.side-viewports-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.study-info-card {
  background: linear-gradient(145deg, #101d26, #0c171e);
  border: 1px solid #1e303b;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.info-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: #172c38;
  border: 1px solid #2e4d5e;
  border-radius: 8px;
  color: #5ce6d4;
}

.info-eyebrow {
  font-size: 8px;
  letter-spacing: 0.15em;
  color: #688e99;
  display: block;
}

.info-header h3 {
  margin: 2px 0 0;
  font-size: 14px;
  color: #e2eef1;
  font-weight: 600;
}

.meta-grid {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 8px;
  font-size: 11px;
  margin: 0;
  padding-bottom: 14px;
  border-bottom: 1px solid #1a2a34;
}

.meta-grid dt {
  color: #6b8994;
}

.meta-grid dd {
  margin: 0;
  color: #c9dde2;
  font-family: monospace;
}

.meta-grid dd.highlight {
  color: #5ce6d4;
  font-weight: bold;
}

.shortcuts-guide {
  margin-top: 12px;
}

.shortcuts-guide h4 {
  margin: 0 0 8px;
  font-size: 11px;
  color: #8da9b2;
}

.shortcuts-guide ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 10px;
  color: #849da5;
}

.shortcuts-guide kbd {
  background: #162632;
  border: 1px solid #2e4655;
  border-radius: 3px;
  padding: 1px 4px;
  font-family: monospace;
  color: #92b7c2;
  font-size: 9px;
}

@media (max-width: 768px) {
  .mpr-grid,
  .ai-layout-grid {
    grid-template-columns: 1fr;
  }
}

.layout-3d-grid {
  display: grid;
  grid-template-columns: minmax(360px, 1.1fr) minmax(380px, 1fr);
  gap: 10px;
  height: 100%;
  min-height: 580px;
}

.viewport-3d-main {
  position: relative;
  height: 100%;
  min-height: 540px;
}

.viewports-3d-mpr {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}

.viewports-3d-mpr .side-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.finding-audit-dock {
  background: #081016;
  border-top: 1px solid #1a2c38;
  padding: 8px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}

.dock-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e2e8f0;
}

.dock-icon {
  color: #5ce6d4;
}

.dock-counter {
  padding: 1px 7px;
  background: #162a36;
  border-radius: 99px;
  color: #7dd3fc;
  font-size: 10px;
}

.dock-shortcuts-tip {
  display: flex;
  gap: 8px;
  color: #64748b;
  font-size: 11px;
}

.dock-shortcuts-tip kbd {
  background: #13222e;
  border: 1px solid #233b4d;
  color: #5ce6d4;
  padding: 1px 4px;
  border-radius: 3px;
  font-family: monospace;
}

.dock-pills-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.dock-pills-list::-webkit-scrollbar {
  height: 4px;
}

.dock-pills-list::-webkit-scrollbar-thumb {
  background: #1e3646;
  border-radius: 2px;
}

.finding-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #0f1c24;
  border: 1px solid #1d3342;
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
  transition: all 120ms ease;
  flex-shrink: 0;
}

.finding-pill:hover {
  background: #142531;
  border-color: #2b4b60;
}

.finding-pill.active {
  border-color: #5ce6d4;
  box-shadow: 0 0 8px rgba(92, 230, 212, 0.25);
  background: #112732;
}

.pill-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.pill-index {
  font-weight: 700;
  color: #5ce6d4;
}

.pill-label {
  color: #e2e8f0;
  white-space: nowrap;
}

.pill-size {
  color: #94a3b8;
  font-size: 11px;
  white-space: nowrap;
}

.pill-status {
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
}

.pill-status.pending {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.pill-status.confirmed {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.pill-status.dismissed {
  background: rgba(100, 116, 139, 0.2);
  color: #94a3b8;
}

.pill-status.modified {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
}

.pill-actions {
  display: flex;
  gap: 4px;
}

.pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid transparent;
  font-size: 10px;
  cursor: pointer;
  background: #182b37;
  color: #cbd5e1;
  transition: all 100ms ease;
}

.pill-btn:hover {
  background: #233e4f;
}

.pill-btn.confirm-btn:hover,
.pill-btn.confirm-btn.active {
  background: rgba(34, 197, 94, 0.25);
  border-color: #22c55e;
  color: #4ade80;
}

.pill-btn.dismiss-btn:hover,
.pill-btn.dismiss-btn.active {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #f87171;
}

@media (max-width: 900px) {
  .layout-3d-grid {
    grid-template-columns: 1fr;
  }
}
</style>
