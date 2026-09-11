<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SliceViewport from '@/components/medical/SliceViewport.vue'
import AnatomyScene from '@/components/3d/AnatomyScene.vue'
import OrganVisibilityList from '@/components/3d/OrganVisibilityList.vue'
import { examinationApi } from '@/api/examinations'
import {
  AXIS_FROM_XYZ,
  viewerApi,
  type ComparisonCandidate,
  type SegmentationBatch,
  type ViewerOrgan,
} from '@/api/viewer'
import type { Examination } from '@/types'
import type { LabelVolume, SliceAxis, StainStyle } from '@/utils/volumePixels'
import { positionToSlice, sliceToPosition } from '@/utils/sliceSync'
import { localPreview } from '@/utils/runtime'

const route = useRoute()
const router = useRouter()
const patientId = computed(() => String(route.params.patientId || route.params.id))
const studies = ref<Examination[]>([])
const imageId = ref(String(route.query.image || ''))
const compareId = ref(String(route.query.compare || ''))
const xyz = ref<'X' | 'Y' | 'Z'>('Z')
const axis = computed<SliceAxis>(() => AXIS_FROM_XYZ[xyz.value])
const opacity = ref(0.35)
const position = ref(0.5)
const error = ref('')
const batch = ref<SegmentationBatch | null>(null)
const compareBatch = ref<SegmentationBatch | null>(null)
const candidates = ref<ComparisonCandidate[]>([])
const labels = ref<LabelVolume | null>(null)
const compareLabels = ref<LabelVolume | null>(null)
const selected = ref<number[]>([])
const workspace = ref<HTMLElement | null>(null)
const storedWidth = Number(localStorage.getItem('vmrb-3d-pane-width'))
const paneWidth = ref(Number.isFinite(storedWidth) && storedWidth >= 320 ? storedWidth : 420)
const resizing = ref(false)
const sideBySide = ref(true)
let resizeStartX = 0, resizeStartWidth = 0, pollTimer: ReturnType<typeof setTimeout> | undefined

const ctStudies = computed(() => studies.value.filter((item) => item.type === 'CT'))
const primary = computed(() => ctStudies.value.find((item) => item.id === imageId.value) || ctStudies.value[0])
const secondary = computed(() => ctStudies.value.find((item) => item.id === compareId.value) || null)
const organs = computed(() => (batch.value?.items || []).filter((item) => item.status === 'completed' && item.label_id != null))
const visibleNames = computed(() =>
  organs.value
    .filter((item) => item.label_id != null && selected.value.includes(item.label_id))
    .map((item) => item.mesh_name || `label_${item.label_id}`),
)
const stainColors = computed(() => {
  const map: Record<number, StainStyle> = {}
  for (const item of organs.value) {
    if (item.label_id == null) continue
    const color = (item.color || [180, 120, 120]) as [number, number, number]
    map[item.label_id] = { color: [color[0], color[1], color[2]], outlineOnly: Boolean(item.outline_only) }
  }
  return map
})
const compareHint = computed(() => candidates.value.find((item) => item.image_id === compareId.value))
const workspaceStyle = computed(() => ({ '--organ-nav-width': `${paneWidth.value}px` }))

const primaryShape = computed<[number, number, number]>(() => {
  const shape = primary.value?.shape || [512, 512, primary.value?.sliceCount || 2]
  return [shape[0], shape[1], shape[2]]
})
const secondaryShape = computed<[number, number, number]>(() => {
  const shape = secondary.value?.shape || [512, 512, secondary.value?.sliceCount || 2]
  return [shape[0], shape[1], shape[2]]
})
function shapeOf(study?: Examination | null): [number, number, number] {
  if (study && primary.value && study.id === primary.value.id) return primaryShape.value
  if (study && secondary.value && study.id === secondary.value.id) return secondaryShape.value
  const shape = study?.shape || [512, 512, study?.sliceCount || 2]
  return [shape[0], shape[1], shape[2]]
}

function sliceCount(study?: Examination | null) {
  if (!study) return 1
  if (axis.value === 'axial') return study.shape?.[2] || study.sliceCount || 1
  if (axis.value === 'coronal') return study.shape?.[1] || 1
  return study.shape?.[0] || 1
}

function affineOf(study?: Examination | null) {
  return study?.acquisition?.affine || null
}

function clampPane(width: number) {
  const available = workspace.value?.clientWidth ?? 1200
  return Math.round(Math.max(320, Math.min(width, Math.min(760, available - 420))))
}

function finishResize() {
  if (!resizing.value) return
  resizing.value = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  window.removeEventListener('pointermove', resizePane)
  window.removeEventListener('pointerup', finishResize)
  localStorage.setItem('vmrb-3d-pane-width', String(paneWidth.value))
}
function resizePane(event: PointerEvent) {
  paneWidth.value = clampPane(resizeStartWidth + event.clientX - resizeStartX)
}
function startResize(event: PointerEvent) {
  resizing.value = true
  resizeStartX = event.clientX
  resizeStartWidth = paneWidth.value
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  window.addEventListener('pointermove', resizePane)
  window.addEventListener('pointerup', finishResize)
}

function persistSelection() {
  if (!primary.value) return
  localStorage.setItem(`vmrb-3d-organs-${primary.value.id}`, JSON.stringify(selected.value))
}

function restoreSelection(items: ViewerOrgan[]) {
  const ids = items.map((item) => item.label_id).filter((id): id is number => id != null)
  const saved = localStorage.getItem(`vmrb-3d-organs-${primary.value?.id || ''}`)
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as number[]
      selected.value = parsed.filter((id) => ids.includes(id))
      if (selected.value.length) return
    } catch { /* default to all */ }
  }
  selected.value = ids
}

function toggleOrgan(labelId: number, visible: boolean) {
  selected.value = visible
    ? [...new Set([...selected.value, labelId])]
    : selected.value.filter((id) => id !== labelId)
  persistSelection()
}

function setAll(visible: boolean) {
  selected.value = visible ? organs.value.map((item) => item.label_id!) : []
  persistSelection()
}

function updateQuery() {
  router.replace({
    query: {
      image: imageId.value || undefined,
      compare: compareId.value || undefined,
    },
  })
}

async function loadStudies() {
  studies.value = (await examinationApi.getExaminationsByPatient(patientId.value)).filter((item) => item.type === 'CT')
  if (!imageId.value || !studies.value.some((item) => item.id === imageId.value)) {
    imageId.value = studies.value[0]?.id || ''
  }
}

async function loadBatch(id: string, target: typeof batch) {
  try {
    target.value = await viewerApi.getBatch(id)
  } catch (reason) {
    target.value = null
    if (reason instanceof Error && !reason.message.includes('not found') && !reason.message.includes('Segmentation')) {
      error.value = reason.message
    }
  }
}

async function loadLabelsFor(study: Examination | null, target: typeof labels) {
  if (!study?.shape) {
    target.value = null
    return
  }
  try {
    target.value = await viewerApi.loadLabels(study.id, shapeOf(study))
  } catch {
    target.value = null
  }
}

async function refresh() {
  if (!primary.value) return
  error.value = ''
  await Promise.all([
    loadBatch(primary.value.id, batch),
    viewerApi.getCandidates(primary.value.id).then((items) => { candidates.value = items }).catch(() => { candidates.value = [] }),
  ])
  if (batch.value?.items.length && !selected.value.length) restoreSelection(batch.value.items)
  await loadLabelsFor(primary.value, labels)
  if (secondary.value) {
    await loadBatch(secondary.value.id, compareBatch)
    await loadLabelsFor(secondary.value, compareLabels)
  } else {
    compareBatch.value = null
    compareLabels.value = null
  }
}

function schedulePoll() {
  if (pollTimer) clearTimeout(pollTimer)
  const running = [batch.value, compareBatch.value].some((item) => item && ['queued', 'running'].includes(item.status))
  if (running) pollTimer = setTimeout(() => { void refresh().then(schedulePoll) }, 2000)
}

const batchBusy = ref(false)

async function startBatchSegmentation() {
  if (!primary.value || batchBusy.value) return
  batchBusy.value = true
  error.value = ''
  try {
    await viewerApi.startBatch(primary.value.id)
    await loadBatch(primary.value.id, batch)
    schedulePoll()
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : '启动全器官分割失败'
  } finally {
    batchBusy.value = false
  }
}

function selectStudy(id: string) {
  imageId.value = id
  if (compareId.value === id) compareId.value = ''
  selected.value = []
  updateQuery()
}

function selectCompare(id: string) {
  if (!id) {
    compareId.value = ''
    updateQuery()
    return
  }
  const candidate = candidates.value.find((item) => item.image_id === id)
  if (candidate && !candidate.comparable) {
    error.value = candidate.reasons.join('；')
    return
  }
  compareId.value = id
  updateQuery()
}

function onPosition(value: number) {
  position.value = value
}

function invertAffine(affine: number[][], ras: number[]): [number, number, number] {
  const m = affine
  const det =
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  if (Math.abs(det) < 1e-12) return [0, 0, 0]
  const inv = [
    [(m[1][1] * m[2][2] - m[1][2] * m[2][1]) / det, (m[0][2] * m[2][1] - m[0][1] * m[2][2]) / det, (m[0][1] * m[1][2] - m[0][2] * m[1][1]) / det],
    [(m[1][2] * m[2][0] - m[1][0] * m[2][2]) / det, (m[0][0] * m[2][2] - m[0][2] * m[2][0]) / det, (m[0][2] * m[1][0] - m[0][0] * m[1][2]) / det],
    [(m[1][0] * m[2][1] - m[1][1] * m[2][0]) / det, (m[0][1] * m[2][0] - m[0][0] * m[2][1]) / det, (m[0][0] * m[1][1] - m[0][1] * m[1][0]) / det],
  ]
  const x = ras[0] - m[0][3], y = ras[1] - m[1][3], z = ras[2] - m[2][3]
  return [
    inv[0][0] * x + inv[0][1] * y + inv[0][2] * z,
    inv[1][0] * x + inv[1][1] * y + inv[1][2] * z,
    inv[2][0] * x + inv[2][1] * y + inv[2][2] * z,
  ]
}

function jumpToOrgan(labelId: number) {
  const organ = organs.value.find((item) => item.label_id === labelId)
  const centroid = organ?.bounds?.centroid_m
  const study = primary.value
  if (!centroid || !study) return
  const ras = [centroid[0] * 1000, -centroid[2] * 1000, centroid[1] * 1000]
  const affine = affineOf(study)
  const voxel = affine ? invertAffine(affine, ras) : ras
  const index =
    axis.value === 'axial'
      ? voxel[2]
      : axis.value === 'coronal'
        ? voxel[1]
        : voxel[0]
  const count = sliceCount(study)
  position.value = sliceToPosition(Math.round(Math.min(count - 1, Math.max(0, index))), count)
}

function layoutRight() {
  const node = workspace.value
  if (!node) return
  const right = node.clientWidth - paneWidth.value
  sideBySide.value = right > 720
}

watch([imageId, compareId], () => { void refresh().then(schedulePoll) })
watch(paneWidth, layoutRight)

onMounted(async () => {
  document.title = '3D 查看器'
  if (localPreview) {
    error.value = '本地预览没有真实 CT 重建，请连接后端后打开 3D 窗口。'
    return
  }
  try {
    await loadStudies()
    await refresh()
    schedulePoll()
    layoutRight()
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : '加载失败'
  }
})
onBeforeUnmount(() => {
  finishResize()
  if (pollTimer) clearTimeout(pollTimer)
})
</script>

<template>
  <div ref="workspace" class="viewer-window" :class="{ resizing }" :style="workspaceStyle">
    <header class="viewer-toolbar">
      <div class="toolbar-block">
        <strong>3D 查看器</strong>
        <label>检查
          <select :value="primary?.id" @change="selectStudy(($event.target as HTMLSelectElement).value)">
            <option v-for="study in ctStudies" :key="study.id" :value="study.id">
              {{ study.date }} · {{ study.sliceCount }} slices
            </option>
          </select>
        </label>
        <label>对比
          <select :value="compareId" @change="selectCompare(($event.target as HTMLSelectElement).value)">
            <option value="">不对比</option>
            <option
              v-for="item in candidates"
              :key="item.image_id"
              :value="item.image_id"
              :disabled="!item.comparable"
            >
              {{ item.study_date || item.image_id }} {{ item.comparable ? '' : '（' + (item.reasons[0] || '不可比') + '）' }}
            </option>
          </select>
        </label>
      </div>
      <div class="toolbar-block">
        <span>方向</span>
        <button v-for="item in (['X', 'Y', 'Z'] as const)" :key="item" type="button" :class="{ active: xyz === item }" @click="xyz = item">{{ item }}</button>
        <label class="opacity">染色
          <input v-model.number="opacity" type="range" min="0" max="1" step="0.05" />
        </label>
      </div>
      <div class="toolbar-block batch-box">
        <button
          v-if="!batch || batch.status === 'failed'"
          type="button"
          class="btn-batch-start"
          :disabled="batchBusy"
          @click="startBatchSegmentation"
        >
          {{ batchBusy ? '正在启动…' : batch?.status === 'failed' ? '重新分割' : '⚡ 开始全器官 AI 分割' }}
        </button>
        <p v-else class="batch-status" :class="batch.status">
          分割 {{ batch.status }} · {{ batch.progress }}% · {{ batch.completed_count }}/{{ batch.total_labels }}
        </p>
      </div>
    </header>
    <p v-if="error" class="viewer-error" role="alert">{{ error }}</p>
    <p v-else-if="compareHint?.warnings?.length" class="viewer-warning">{{ compareHint.warnings.join('；') }}</p>

    <div class="viewer-body">
      <section class="left-pane">
        <div class="scenes" :class="{ compare: Boolean(secondary) }">
          <AnatomyScene
            v-if="primary"
            :model-id="batch?.atlas_model_id"
            :visible-names="visibleNames"
            :axis="axis"
            :slice-index="positionToSlice(position, sliceCount(primary))"
            :shape="shapeOf(primary)"
            :affine="affineOf(primary)"
            :status="batch ? `分割${batch.status}` : '尚未分割'"
            @select-label="jumpToOrgan"
          />
          <AnatomyScene
            v-if="secondary"
            :model-id="compareBatch?.atlas_model_id"
            :visible-names="visibleNames"
            :axis="axis"
            :slice-index="positionToSlice(position, sliceCount(secondary))"
            :shape="shapeOf(secondary)"
            :affine="affineOf(secondary)"
            @select-label="jumpToOrgan"
          />
        </div>
        <OrganVisibilityList :organs="organs" :selected="selected" @toggle="toggleOrgan" @set-all="setAll" />
      </section>
      <div
        class="pane-resizer"
        role="separator"
        aria-orientation="vertical"
        tabindex="0"
        @pointerdown.prevent="startResize"
      ><span /></div>
      <section class="right-pane" :class="{ compare: Boolean(secondary), stacked: Boolean(secondary) && !sideBySide }">
        <SliceViewport
          v-if="primary"
          :examination="primary"
          :axis="axis"
          preset="soft"
          :zoom="1"
          :renderer="null"
          :position="position"
          :label-volume="labels"
          :visible-labels="selected"
          :stain-colors="stainColors"
          :stain-opacity="opacity"
          compact
          @position-change="onPosition"
        />
        <SliceViewport
          v-if="secondary"
          :examination="secondary"
          :axis="axis"
          preset="soft"
          :zoom="1"
          :renderer="null"
          :position="position"
          :label-volume="compareLabels"
          :visible-labels="selected"
          :stain-colors="stainColors"
          :stain-opacity="opacity"
          compact
          @position-change="onPosition"
        />
      </section>
    </div>
  </div>
</template>

<style scoped>
.viewer-window {
  display: flex;
  height: 100vh;
  flex-direction: column;
  background: #0f1b22;
  color: #d7e6e8;
}
.viewer-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid #2a3b44;
  background: #13232c;
}
.toolbar-block {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.toolbar-block select,
.toolbar-block button {
  min-height: 30px;
  border: 1px solid #35515c;
  border-radius: 6px;
  background: #1c303a;
  color: #d7e6e8;
  padding: 0 8px;
  font-size: 12px;
}
.toolbar-block button.active {
  border-color: #74aaa3;
  background: #254943;
}
.opacity {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}
.batch-status,
.viewer-error,
.viewer-warning {
  margin: 0;
  padding: 0 14px;
  font-size: 12px;
}
.viewer-error { color: #f0a3a3; padding-top: 8px; }
.viewer-warning { color: #e6c37a; padding-top: 8px; }
.viewer-body {
  display: grid;
  flex: 1;
  grid-template-columns: clamp(320px, var(--organ-nav-width), calc(100% - 420px)) 10px minmax(380px, 1fr);
  min-height: 0;
}
.left-pane {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  min-width: 0;
  background: #f4fafa;
  color: #244247;
}
.scenes {
  display: grid;
  min-height: 0;
  padding: 8px;
  gap: 8px;
}
.scenes.compare { grid-template-columns: 1fr 1fr; }
.pane-resizer {
  cursor: col-resize;
  background: #13232c;
}
.pane-resizer span {
  display: block;
  width: 4px;
  height: 48px;
  margin: 40vh auto 0;
  border-radius: 99px;
  background: #5f7c84;
}
.right-pane {
  display: grid;
  min-width: 0;
  padding: 8px;
}
.right-pane.compare { grid-template-columns: 1fr 1fr; }
.right-pane.stacked { grid-template-columns: 1fr; }
.resizing { user-select: none; }
@media (max-width: 980px) {
  .viewer-body { grid-template-columns: 1fr; }
  .pane-resizer { display: none; }
  .scenes.compare, .right-pane.compare { grid-template-columns: 1fr; }
}
.btn-batch-start {
  background: #0f766e;
  color: #ffffff;
  border: none;
  font-weight: 600;
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  transition: all 0.2s;
}
.btn-batch-start:hover:not(:disabled) {
  background: #0d9488;
  transform: translateY(-1px);
}
.btn-batch-start:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
