<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SliceViewport from '@/components/medical/SliceViewport.vue'
import AnatomyScene from '@/components/3d/AnatomyScene.vue'
import OrganVisibilityList, { type OrganGroup } from '@/components/3d/OrganVisibilityList.vue'
import { examinationApi } from '@/api/examinations'
import {
  viewerApi,
  type ComparisonCandidate,
  type SegmentationBatch,
  type ViewerOrgan,
} from '@/api/viewer'
import type { Examination } from '@/types'
import type { LabelVolume, SliceAxis, StainStyle } from '@/utils/volumePixels'
import { sliceCount as axisSliceCount } from '@/utils/sliceAxes'
import { positionToSlice, sliceToPosition } from '@/utils/sliceSync'
import { localPreview } from '@/utils/runtime'
import { VolumeRenderer } from '@/utils/volumeRenderer'
import { activeMedicalTool } from '@/composables/useViewportGestures'

const ORIENTATION_OPTIONS = [
  { id: 'axial', label: '轴向 (Axial)' },
  { id: 'sagittal', label: '矢状 (Sagittal)' },
  { id: 'coronal', label: '冠状 (Coronal)' },
] as const

interface MprViewportConfig {
  key: string
  study: Examination
  axis: SliceAxis
  title: string
  renderer: VolumeRenderer | null
  labelVolume: LabelVolume | null
  compact?: boolean
}

const route = useRoute()
const router = useRouter()
const patientId = computed(() => String(route.params.patientId || route.params.id))
const studies = ref<Examination[]>([])
const imageId = ref(String(route.query.image || ''))
const compareId = ref(String(route.query.compare || ''))
const currentAxis = ref<SliceAxis>('axial')
const axis = computed<SliceAxis>(() => currentAxis.value)
const viewMode = ref<'mpr' | 'single'>('mpr')
const rightPaneRef = ref<HTMLElement | null>(null)
const rightPaneSize = ref({ width: 800, height: 600 })
let rightPaneObserver: ResizeObserver | undefined

const rightAspectRatio = computed(() => {
  return rightPaneSize.value.height > 0 ? rightPaneSize.value.width / rightPaneSize.value.height : 1.33
})

const mprCompareLayout = computed<'2x3' | '3x2'>(() => {
  return rightAspectRatio.value >= 1.25 ? '2x3' : '3x2'
})
const opacity = ref(0.35)
const position = ref(0.5)
const worldAnchor = ref<[number, number, number] | null>(null)
const error = ref('')
const batch = ref<SegmentationBatch | null>(null)
const compareBatch = ref<SegmentationBatch | null>(null)
const candidates = ref<ComparisonCandidate[]>([])
const labels = ref<LabelVolume | null>(null)
const compareLabels = ref<LabelVolume | null>(null)
const selectedGroups = ref<string[]>([])
const preset = ref('lung')
const volumeRenderer = shallowRef<VolumeRenderer | null>(null)
const compareRenderer = shallowRef<VolumeRenderer | null>(null)
const volumeProgress = ref(0)
const workspace = ref<HTMLElement | null>(null)
const storedWidth = Number(localStorage.getItem('vmrb-3d-pane-width'))
const paneWidth = ref(Number.isFinite(storedWidth) && storedWidth >= 320 ? storedWidth : 420)
const resizing = ref(false)
const sideBySide = ref(true)
let resizeStartX = 0, resizeStartWidth = 0, pollTimer: ReturnType<typeof setTimeout> | undefined
let initialized = false

const ctStudies = computed(() => studies.value.filter((item) => item.type === 'CT'))
const primary = computed(() => ctStudies.value.find((item) => item.id === imageId.value) || ctStudies.value[0])
const secondary = computed(() => ctStudies.value.find((item) => item.id === compareId.value) || null)

const mprViewports = computed<MprViewportConfig[]>(() => {
  if (!primary.value) return []
  const p = primary.value
  const s = secondary.value

  if (!s) {
    return [
      { key: 'p-axial', study: p, axis: 'axial', title: '轴向 (Axial)', renderer: volumeRenderer.value, labelVolume: labels.value },
      { key: 'p-sagittal', study: p, axis: 'sagittal', title: '矢状 (Sagittal)', renderer: volumeRenderer.value, labelVolume: labels.value },
      { key: 'p-coronal', study: p, axis: 'coronal', title: '冠状 (Coronal)', renderer: volumeRenderer.value, labelVolume: labels.value },
    ]
  }

  if (mprCompareLayout.value === '2x3') {
    return [
      { key: 'p-axial', study: p, axis: 'axial', title: '当前检查 · 轴向 (Axial)', renderer: volumeRenderer.value, labelVolume: labels.value },
      { key: 'p-sagittal', study: p, axis: 'sagittal', title: '当前检查 · 矢状 (Sagittal)', renderer: volumeRenderer.value, labelVolume: labels.value },
      { key: 'p-coronal', study: p, axis: 'coronal', title: '当前检查 · 冠状 (Coronal)', renderer: volumeRenderer.value, labelVolume: labels.value },
      { key: 's-axial', study: s, axis: 'axial', title: '对比检查 · 轴向 (Axial)', renderer: compareRenderer.value, labelVolume: compareLabels.value, compact: true },
      { key: 's-sagittal', study: s, axis: 'sagittal', title: '对比检查 · 矢状 (Sagittal)', renderer: compareRenderer.value, labelVolume: compareLabels.value, compact: true },
      { key: 's-coronal', study: s, axis: 'coronal', title: '对比检查 · 冠状 (Coronal)', renderer: compareRenderer.value, labelVolume: compareLabels.value, compact: true },
    ]
  } else {
    return [
      { key: 'p-axial', study: p, axis: 'axial', title: '当前检查 · 轴向', renderer: volumeRenderer.value, labelVolume: labels.value },
      { key: 's-axial', study: s, axis: 'axial', title: '对比检查 · 轴向', renderer: compareRenderer.value, labelVolume: compareLabels.value, compact: true },
      { key: 'p-sagittal', study: p, axis: 'sagittal', title: '当前检查 · 矢状', renderer: volumeRenderer.value, labelVolume: labels.value },
      { key: 's-sagittal', study: s, axis: 'sagittal', title: '对比检查 · 矢状', renderer: compareRenderer.value, labelVolume: compareLabels.value, compact: true },
      { key: 'p-coronal', study: p, axis: 'coronal', title: '当前检查 · 冠状', renderer: volumeRenderer.value, labelVolume: labels.value },
      { key: 's-coronal', study: s, axis: 'coronal', title: '对比检查 · 冠状', renderer: compareRenderer.value, labelVolume: compareLabels.value, compact: true },
    ]
  }
})
const organs = computed(() => (batch.value?.items || []).filter((item) => item.status === 'completed' && item.label_id != null))
const groups = computed<OrganGroup[]>(() => {
  const map = new Map<string, OrganGroup>()
  for (const item of organs.value) {
    const id = item.group_id || item.organ_id || `label_${item.label_id}`
    const existing = map.get(id)
    const color = (item.color || [160, 160, 160]) as [number, number, number]
    const meshName = item.mesh_name || `label_${item.label_id}`
    if (existing) {
      if (item.label_id != null) existing.labelIds.push(item.label_id)
      existing.meshNames.push(meshName)
      existing.count += 1
    } else {
      map.set(id, {
        id,
        name: item.group_name || item.display_name || item.name,
        color: [color[0], color[1], color[2]],
        labelIds: item.label_id != null ? [item.label_id] : [],
        meshNames: [meshName],
        count: 1,
      })
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'zh'))
})
const visibleNames = computed(() =>
  groups.value.filter((item) => selectedGroups.value.includes(item.id)).flatMap((item) => item.meshNames),
)
const visibleLabels = computed(() =>
  groups.value.filter((item) => selectedGroups.value.includes(item.id)).flatMap((item) => item.labelIds),
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

const organMetaMap = computed<Record<number, ViewerOrgan>>(() => {
  const map: Record<number, ViewerOrgan> = {}
  for (const item of batch.value?.items || []) {
    if (item.label_id != null) {
      map[item.label_id] = item
    }
  }
  return map
})

const compareOrganMetaMap = computed<Record<number, ViewerOrgan>>(() => {
  const map: Record<number, ViewerOrgan> = {}
  for (const item of compareBatch.value?.items || []) {
    if (item.label_id != null) {
      map[item.label_id] = item
    }
  }
  return map
})

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
  return axisSliceCount(axis.value, shapeOf(study))
}

function spacingOf(study?: Examination | null): [number, number, number] {
  const spacing = study?.spacing || study?.acquisition?.spacing_mm || [1, 1, 1]
  return [spacing[0] || 1, spacing[1] || 1, spacing[2] || 1]
}

function detectPrimaryAxis(study?: Examination | null): SliceAxis {
  if (!study) return 'axial'
  const explicitPlane = ((study.acquisition as Record<string, unknown> | undefined)?.plane as string | undefined)?.toLowerCase()
  if (explicitPlane === 'axial' || explicitPlane === 'sagittal' || explicitPlane === 'coronal') {
    return explicitPlane
  }
  const spacing = spacingOf(study)
  const [sx, sy, sz] = spacing
  if (sz > sx * 1.25 && sz > sy * 1.25) {
    return 'axial'
  }
  if (sx > sy * 1.25 && sx > sz * 1.25) {
    return 'sagittal'
  }
  if (sy > sx * 1.25 && sy > sz * 1.25) {
    return 'coronal'
  }
  const shape = shapeOf(study)
  const [dx, dy, dz] = shape
  if (dx === dy && dz !== dx) {
    return 'axial'
  }
  if (dy === dz && dx !== dy) {
    return 'sagittal'
  }
  if (dx === dz && dy !== dx) {
    return 'coronal'
  }
  return 'axial'
}

function affineOf(study?: Examination | null) {
  return study?.acquisition?.affine || null
}

function axisLayer(targetAxis: SliceAxis = axis.value) {
  return targetAxis === 'axial' ? 2 : targetAxis === 'coronal' ? 1 : 0
}

function applyAffine(affine: number[][], voxel: [number, number, number]): [number, number, number] {
  return [
    affine[0][0] * voxel[0] + affine[0][1] * voxel[1] + affine[0][2] * voxel[2] + (affine[0][3] || 0),
    affine[1][0] * voxel[0] + affine[1][1] * voxel[1] + affine[1][2] * voxel[2] + (affine[1][3] || 0),
    affine[2][0] * voxel[0] + affine[2][1] * voxel[1] + affine[2][2] * voxel[2] + (affine[2][3] || 0),
  ]
}

function worldAtPosition(study: Examination | null | undefined, value: number, targetAxis: SliceAxis = axis.value) {
  const affine = affineOf(study)
  if (!study || !affine || affine.length < 3 || affine.some(row => row.length < 4)) return null
  const shape = shapeOf(study)
  const currentVoxel = worldAnchor.value ? invertAffine(affine, worldAnchor.value) : [
    Math.max(0, (shape[0] - 1) / 2),
    Math.max(0, (shape[1] - 1) / 2),
    Math.max(0, (shape[2] - 1) / 2),
  ]
  const voxel: [number, number, number] = [
    Math.max(0, Math.min(shape[0] - 1, currentVoxel[0])),
    Math.max(0, Math.min(shape[1] - 1, currentVoxel[1])),
    Math.max(0, Math.min(shape[2] - 1, currentVoxel[2])),
  ]
  const layer = axisLayer(targetAxis)
  voxel[layer] = Math.max(0, Math.min(shape[layer] - 1, value * Math.max(shape[layer] - 1, 1)))
  return applyAffine(affine, voxel)
}

function positionAtWorld(study: Examination | null | undefined, ras: [number, number, number], targetAxis: SliceAxis = axis.value) {
  const affine = affineOf(study)
  if (!study || !affine || affine.length < 3 || affine.some(row => row.length < 4)) return null
  const voxel = invertAffine(affine, ras)
  const layer = axisLayer(targetAxis)
  const count = axisSliceCount(targetAxis, shapeOf(study))
  if (!Number.isFinite(voxel[layer]) || count <= 1) return 0
  return Math.max(0, Math.min(1, voxel[layer] / (count - 1)))
}

function positionFor(study: Examination | null | undefined, targetAxis: SliceAxis = axis.value) {
  if (!worldAnchor.value) return position.value
  return positionAtWorld(study, worldAnchor.value, targetAxis) ?? position.value
}

function onPositionFrom(study: Examination | null | undefined, value: number, targetAxis: SliceAxis = axis.value) {
  const anchor = worldAtPosition(study, value, targetAxis)
  if (anchor) worldAnchor.value = anchor
  position.value = value
}

function resetWorldAnchor() {
  worldAnchor.value = worldAtPosition(primary.value, position.value, axis.value)
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
  localStorage.setItem(`vmrb-3d-groups-${primary.value.id}`, JSON.stringify(selectedGroups.value))
}

function restoreSelection() {
  const ids = groups.value.map((item) => item.id)
  const saved = localStorage.getItem(`vmrb-3d-groups-${primary.value?.id || ''}`)
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as string[]
      selectedGroups.value = parsed.filter((id) => ids.includes(id))
      if (selectedGroups.value.length) return
    } catch { /* default to all */ }
  }
  selectedGroups.value = ids
}

function toggleOrgan(groupId: string, visible: boolean) {
  selectedGroups.value = visible
    ? [...new Set([...selectedGroups.value, groupId])]
    : selectedGroups.value.filter((id) => id !== groupId)
  persistSelection()
}

function setAll(visible: boolean) {
  selectedGroups.value = visible ? groups.value.map((item) => item.id) : []
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
  if (groups.value.length && !selectedGroups.value.length) restoreSelection()
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
  if (running) pollTimer = setTimeout(() => { void pollBatchStatuses() }, 2000)
}

async function pollBatchStatuses() {
  const primaryStudy = primary.value
  const secondaryStudy = secondary.value
  if (!primaryStudy) return
  const primaryStatus = batch.value?.status
  const secondaryStatus = compareBatch.value?.status
  await Promise.all([
    loadBatch(primaryStudy.id, batch),
    secondaryStudy ? loadBatch(secondaryStudy.id, compareBatch) : Promise.resolve(),
  ])
  if (primary.value?.id !== primaryStudy.id || secondary.value?.id !== secondaryStudy?.id) return
  const labelsReady = (status?: string) => status === 'completed' || status === 'partial'
  const loads: Promise<void>[] = []
  if (batch.value?.status !== primaryStatus && labelsReady(batch.value?.status)) {
    loads.push(loadLabelsFor(primaryStudy, labels))
  }
  if (secondaryStudy && compareBatch.value?.status !== secondaryStatus && labelsReady(compareBatch.value?.status)) {
    loads.push(loadLabelsFor(secondaryStudy, compareLabels))
  }
  if (loads.length) await Promise.all(loads)
  schedulePoll()
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
  selectedGroups.value = []
  const study = ctStudies.value.find((item) => item.id === id)
  if (study) {
    currentAxis.value = detectPrimaryAxis(study)
  }
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

watch([imageId, compareId], () => {
  if (!initialized) return
  if (primary.value) {
    currentAxis.value = detectPrimaryAxis(primary.value)
  }
  resetWorldAnchor()
  void refresh().then(schedulePoll)
})
watch([axis, () => primary.value?.id], resetWorldAnchor)
watch(paneWidth, layoutRight)
watch(groups, (list) => {
  if (list.length && !selectedGroups.value.length) restoreSelection()
})

async function loadVolume(study: Examination | null, target: typeof volumeRenderer) {
  target.value?.dispose()
  target.value = null
  if (!study?.shape || study.shape.length !== 3) return
  const engine = new VolumeRenderer()
  try {
    await engine.load(study.id, shapeOf(study), (value) => { volumeProgress.value = value })
    target.value = engine
  } catch {
    engine.dispose()
  }
}

watch(
  () => primary.value?.id,
  (id) => { void loadVolume(primary.value || null, volumeRenderer); void id },
)
watch(
  () => secondary.value?.id,
  (id) => { void loadVolume(secondary.value || null, compareRenderer); void id },
)

onMounted(async () => {
  document.title = '3D 查看器'
  document.documentElement.style.overflow = 'hidden'
  document.documentElement.style.height = '100%'
  document.body.style.overflow = 'hidden'
  document.body.style.height = '100%'
  document.body.style.overscrollBehavior = 'none'

  activeMedicalTool.value = 'ww_wl'
  if (localPreview) {
    error.value = '本地预览没有真实 CT 重建，请连接后端后打开 3D 窗口。'
    return
  }
  try {
    await loadStudies()
    if (primary.value) {
      currentAxis.value = detectPrimaryAxis(primary.value)
    }
    await refresh()
    initialized = true
    schedulePoll()
    layoutRight()
    if (typeof ResizeObserver !== 'undefined' && rightPaneRef.value) {
      rightPaneObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect && entry.contentRect.width > 0 && entry.contentRect.height > 0) {
            rightPaneSize.value = {
              width: entry.contentRect.width,
              height: entry.contentRect.height,
            }
          }
        }
      })
      rightPaneObserver.observe(rightPaneRef.value)
    }
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : '加载失败'
  }
})
onBeforeUnmount(() => {
  document.documentElement.style.overflow = ''
  document.documentElement.style.height = ''
  document.body.style.overflow = ''
  document.body.style.height = ''
  document.body.style.overscrollBehavior = ''

  finishResize()
  if (pollTimer) clearTimeout(pollTimer)
  if (rightPaneObserver) {
    rightPaneObserver.disconnect()
    rightPaneObserver = undefined
  }
  volumeRenderer.value?.dispose()
  compareRenderer.value?.dispose()
})
</script>

<template>
  <div ref="workspace" class="viewer-window" :class="{ resizing }" :style="workspaceStyle" @wheel.passive.stop>
    <header class="viewer-toolbar" @wheel.prevent>
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
        <span>视图模式</span>
        <button
          type="button"
          :class="{ active: viewMode === 'mpr' }"
          @click="viewMode = 'mpr'"
        >
          3视图 (MPR)
        </button>
        <button
          type="button"
          :class="{ active: viewMode === 'single' }"
          @click="viewMode = 'single'"
        >
          单视图
        </button>
      </div>
      <div v-if="viewMode === 'single'" class="toolbar-block">
        <span>切片方位</span>
        <button
          v-for="item in ORIENTATION_OPTIONS"
          :key="item.id"
          type="button"
          :class="{ active: currentAxis === item.id }"
          @click="currentAxis = item.id"
        >
          {{ item.label }}
        </button>
      </div>
      <div class="toolbar-block">
        <select v-model="preset" aria-label="窗宽窗位">
          <option value="lung">肺窗</option>
          <option value="soft">软组织</option>
          <option value="bone">骨窗</option>
          <option value="brain">脑窗</option>
        </select>
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
            :slice-index="positionToSlice(positionFor(primary), sliceCount(primary))"
            :shape="shapeOf(primary)"
            :spacing="spacingOf(primary)"
            :affine="affineOf(primary)"
            :status="batch ? `分割${batch.status}` : '尚未分割'"
            :organ-meta="organMetaMap"
            @select-label="jumpToOrgan"
          />
          <AnatomyScene
            v-if="secondary"
            :model-id="compareBatch?.atlas_model_id"
            :visible-names="visibleNames"
            :axis="axis"
            :slice-index="positionToSlice(positionFor(secondary), sliceCount(secondary))"
            :shape="shapeOf(secondary)"
            :spacing="spacingOf(secondary)"
            :affine="affineOf(secondary)"
            :organ-meta="compareOrganMetaMap"
            @select-label="jumpToOrgan"
          />
        </div>
        <OrganVisibilityList :groups="groups" :selected="selectedGroups" @toggle="toggleOrgan" @set-all="setAll" />
      </section>
      <div
        class="pane-resizer"
        role="separator"
        aria-orientation="vertical"
        tabindex="0"
        @wheel.prevent.stop
        @pointerdown.prevent="startResize"
      ><span /></div>
      <section
        ref="rightPaneRef"
        class="right-pane"
        :class="{
          'mpr-mode': viewMode === 'mpr',
          'mpr-single-study': viewMode === 'mpr' && !secondary,
          'mpr-single-stacked': viewMode === 'mpr' && !secondary && rightAspectRatio < 1.3,
          'mpr-2x3': viewMode === 'mpr' && secondary && mprCompareLayout === '2x3',
          'mpr-3x2': viewMode === 'mpr' && secondary && mprCompareLayout === '3x2',
          'single-mode': viewMode === 'single',
          'compare': viewMode === 'single' && Boolean(secondary),
          'stacked': viewMode === 'single' && Boolean(secondary) && !sideBySide,
        }"
      >
        <template v-if="viewMode === 'mpr'">
          <SliceViewport
            v-for="vp in mprViewports"
            :key="vp.key"
            :examination="vp.study"
            :axis="vp.axis"
            :preset="preset"
            :zoom="1"
            :renderer="vp.renderer"
            :position="positionFor(vp.study, vp.axis)"
            :label-volume="vp.labelVolume"
            :visible-labels="visibleLabels"
            :stain-colors="stainColors"
            :stain-opacity="opacity"
            :title="vp.title"
            :compact="vp.compact"
            :sync-crosshairs="false"
            :show-crosshairs="false"
            @position-change="onPositionFrom(vp.study, $event, vp.axis)"
          />
        </template>
        <template v-else>
          <SliceViewport
            v-if="primary"
            :examination="primary"
            :axis="axis"
            :preset="preset"
            :zoom="1"
            :renderer="volumeRenderer"
            :position="positionFor(primary, axis)"
            :label-volume="labels"
            :visible-labels="visibleLabels"
            :stain-colors="stainColors"
            :stain-opacity="opacity"
            :title="secondary ? '当前检查' : undefined"
            :sync-crosshairs="false"
            :show-crosshairs="false"
            @position-change="onPositionFrom(primary, $event, axis)"
          />
          <SliceViewport
            v-if="secondary"
            :examination="secondary"
            :axis="axis"
            :preset="preset"
            :zoom="1"
            :renderer="compareRenderer"
            :position="positionFor(secondary, axis)"
            :label-volume="compareLabels"
            :visible-labels="visibleLabels"
            :stain-colors="stainColors"
            :stain-opacity="opacity"
            title="对比检查"
            compact
            :sync-crosshairs="false"
            :show-crosshairs="false"
            @position-change="onPositionFrom(secondary, $event, axis)"
          />
        </template>
      </section>
    </div>
  </div>
</template>

<style scoped>
.viewer-window {
  display: flex;
  height: 100vh;
  max-height: 100vh;
  width: 100vw;
  max-width: 100vw;
  overflow: hidden;
  overscroll-behavior: none;
  flex-direction: column;
  background: #0f1b22;
  color: #d7e6e8;
  box-sizing: border-box;
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
  flex-shrink: 0;
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
  height: 100%;
  overflow: hidden;
}
.left-pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  background: #f4fafa;
  color: #244247;
}
.scenes {
  display: grid;
  flex: 1;
  min-height: 0;
  padding: 8px;
  gap: 8px;
  overflow: hidden;
}
.scenes.compare { grid-template-columns: 1fr 1fr; }
.left-pane :deep(.organ-list) {
  flex-shrink: 0;
  max-height: 280px;
  overflow: hidden;
  border-top: 1px solid #2a3b44;
}
.pane-resizer {
  cursor: col-resize;
  background: #13232c;
  user-select: none;
  touch-action: none;
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
  min-height: 0;
  height: 100%;
  overflow: hidden;
  padding: 8px;
  gap: 8px;
  box-sizing: border-box;
}
.right-pane.single-mode {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}
.right-pane.single-mode.compare {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
}
.right-pane.single-mode.stacked {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 1fr;
}
.right-pane.mpr-single-study {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: 1fr;
}
.right-pane.mpr-single-study.mpr-single-stacked {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: 1fr 1fr;
}
.right-pane.mpr-single-study.mpr-single-stacked > :first-child {
  grid-column: span 2;
}
.right-pane.mpr-2x3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
}
.right-pane.mpr-3x2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(3, minmax(0, 1fr));
}
.resizing { user-select: none; }
@media (max-width: 980px) {
  .viewer-body { grid-template-columns: 1fr; }
  .pane-resizer { display: none; }
  .scenes.compare { grid-template-columns: 1fr; }
  .right-pane.single-mode.compare {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
  .right-pane.mpr-single-study,
  .right-pane.mpr-single-study.mpr-single-stacked {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(3, minmax(0, 1fr));
  }
  .right-pane.mpr-single-study.mpr-single-stacked > :first-child {
    grid-column: span 1;
  }
  .right-pane.mpr-2x3,
  .right-pane.mpr-3x2 {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(6, minmax(0, 1fr));
  }
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
