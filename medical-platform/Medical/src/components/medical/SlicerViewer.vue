<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Crosshair, Grid3X3, Minus, Plus, ScanLine } from 'lucide-vue-next'
import type { Examination, Finding } from '@/types'
import SyntheticSlice from './SyntheticSlice.vue'
import VolumePreview from '@/components/3d/VolumePreview.vue'

type WindowPreset = 'lung' | 'brain' | 'bone' | 'soft'

const props = defineProps<{
  examination: Examination
  findings?: Finding[]
}>()

const emit = defineEmits<{
  selectFinding: [findingId: string]
}>()

const currentSlice = ref(Math.max(1, Math.ceil(props.examination.sliceCount / 2)))
const windowPreset = ref<WindowPreset>(props.examination.type === 'MRI' ? 'brain' : 'lung')
const showGrid = ref(true)
const zoom = ref(1)
const activeFindingId = ref<string | null>(null)

const isProjection = computed(() => props.examination.type === 'X-Ray')
const activeFindings = computed(() => props.findings ?? [])
const activeFinding = computed(
  () => activeFindings.value.find((finding) => finding.id === activeFindingId.value) ?? null,
)

watch(
  () => props.examination.id,
  () => {
    currentSlice.value = Math.max(1, Math.ceil(props.examination.sliceCount / 2))
    windowPreset.value = props.examination.type === 'MRI' ? 'brain' : 'lung'
    activeFindingId.value = activeFindings.value[0]?.id ?? null
  },
  { immediate: true },
)

watch(
  activeFindings,
  (findings) => {
    if (!findings.some((finding) => finding.id === activeFindingId.value)) {
      activeFindingId.value = findings[0]?.id ?? null
    }
  },
  { immediate: true },
)

function changeZoom(delta: number) {
  zoom.value = Math.min(2.5, Math.max(1, Number((zoom.value + delta).toFixed(1))))
}
</script>

<template>
  <div class="slicer-viewer">
    <div class="viewer-toolbar">
      <div class="toolbar-left">
        <span class="modality-badge">
          <ScanLine :size="14" /> {{ examination.type }}
        </span>
        <div class="study-copy">
          <strong>{{ examination.organ }} · {{ examination.bodyPart }}</strong>
          <span>{{ isProjection ? 'Projection viewer' : 'Multiplanar reconstruction' }}</span>
        </div>
      </div>

      <div v-if="!isProjection" class="toolbar-center">
        <span class="toolbar-label">Slice</span>
        <input
          v-model.number="currentSlice"
          type="range"
          :min="1"
          :max="examination.sliceCount"
          step="1"
          aria-label="Slice position"
        />
        <span class="slice-count">{{ currentSlice }} / {{ examination.sliceCount }}</span>
      </div>

      <div class="toolbar-right">
        <label class="preset-select">
          <span class="sr-only">Window preset</span>
          <select v-model="windowPreset" class="select">
            <option value="lung">Lung</option>
            <option value="brain">Brain</option>
            <option value="bone">Bone</option>
            <option value="soft">Soft tissue</option>
          </select>
        </label>
        <button type="button" class="viewer-button" aria-label="Zoom out" @click="changeZoom(-0.2)">
          <Minus :size="15" />
        </button>
        <span class="zoom-value">{{ Math.round(zoom * 100) }}%</span>
        <button type="button" class="viewer-button" aria-label="Zoom in" @click="changeZoom(0.2)">
          <Plus :size="15" />
        </button>
        <button type="button" class="viewer-button" aria-label="Reset zoom" @click="zoom = 1">
          <Crosshair :size="15" />
        </button>
        <button type="button" :class="['viewer-button', { active: showGrid }]" aria-label="Toggle grid" @click="showGrid = !showGrid">
          <Grid3X3 :size="15" />
        </button>
      </div>
    </div>

    <div :class="['viewer-grid', { projection: isProjection }]">
      <template v-if="isProjection">
        <div class="viewport projection-viewport">
          <div class="viewport-label">X-Ray Projection</div>
          <SyntheticSlice
            modality="X-Ray"
            orientation="projection"
            :slice-index="1"
            :slice-count="1"
            :preset="windowPreset"
            :show-grid="showGrid"
            :findings="[]"
            :zoom="zoom"
          />
        </div>
      </template>

      <template v-else>
        <div class="viewport axial-viewport">
          <div class="viewport-label">Axial</div>
          <SyntheticSlice
            :modality="examination.type"
            orientation="axial"
            :slice-index="currentSlice"
            :slice-count="examination.sliceCount"
            :preset="windowPreset"
            :show-grid="showGrid"
            :findings="activeFindings"
            :active-finding-id="activeFindingId"
            :zoom="zoom"
            @select-finding="activeFindingId = $event; emit('selectFinding', $event)"
          />
        </div>
        <div class="viewport coronal-viewport">
          <div class="viewport-label">Coronal</div>
          <SyntheticSlice
            :modality="examination.type"
            orientation="coronal"
            :slice-index="currentSlice"
            :slice-count="examination.sliceCount"
            :preset="windowPreset"
            :show-grid="showGrid"
            :findings="activeFindings"
            :active-finding-id="activeFindingId"
            :zoom="zoom"
            @select-finding="activeFindingId = $event; emit('selectFinding', $event)"
          />
        </div>
        <div class="viewport sagittal-viewport">
          <div class="viewport-label">Sagittal</div>
          <SyntheticSlice
            :modality="examination.type"
            orientation="sagittal"
            :slice-index="currentSlice"
            :slice-count="examination.sliceCount"
            :preset="windowPreset"
            :show-grid="showGrid"
            :findings="activeFindings"
            :active-finding-id="activeFindingId"
            :zoom="zoom"
            @select-finding="activeFindingId = $event; emit('selectFinding', $event)"
          />
        </div>
        <div class="viewport volume-viewport">
          <div class="viewport-label">3D Volume</div>
          <VolumePreview
            :examination="examination"
            :findings="activeFindings"
            :active-finding-id="activeFindingId"
            @select-finding="activeFindingId = $event; emit('selectFinding', $event)"
          />
        </div>
      </template>
    </div>

    <div v-if="activeFinding && !isProjection" class="finding-strip">
      <span class="finding-dot" />
      <strong>{{ activeFinding.label }}</strong>
      <span>{{ activeFinding.side }} {{ activeFinding.location.replaceAll('_', ' ') }}</span>
    </div>
  </div>
</template>

<style scoped>
.slicer-viewer {
  overflow: hidden;
  background: #101a1e;
}

.viewer-toolbar {
  display: grid;
  grid-template-columns: minmax(210px, 1fr) minmax(260px, 1fr) minmax(300px, auto);
  align-items: center;
  gap: 14px;
  padding: 10px 12px;
  border-bottom: 1px solid rgb(255 255 255 / 10%);
  background: #172528;
  color: #d9eceb;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
}

.toolbar-left {
  gap: 9px;
}

.modality-badge {
  display: inline-flex;
  min-height: 28px;
  align-items: center;
  gap: 5px;
  padding: 0 8px;
  border-radius: 5px;
  background: #2b4e50;
  color: #dff5f3;
  font-size: 11px;
  font-weight: 760;
}

.study-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  line-height: 1.2;
}

.study-copy strong {
  font-size: 12px;
}

.study-copy span {
  color: rgb(217 236 235 / 62%);
  font-size: 10px;
}

.toolbar-center {
  justify-content: center;
  gap: 8px;
}

.toolbar-center input {
  min-width: 0;
  flex: 1;
  accent-color: #56b5b7;
}

.toolbar-label,
.slice-count,
.zoom-value {
  color: rgb(217 236 235 / 66%);
  font-size: 10px;
  white-space: nowrap;
}

.toolbar-right {
  justify-content: flex-end;
  gap: 6px;
}

.preset-select {
  margin-right: 4px;
}

.preset-select .select {
  min-height: 30px;
  padding: 4px 8px;
  border-color: rgb(255 255 255 / 14%);
  background: #1f3335;
  color: #d9eceb;
  font-size: 11px;
}

.viewer-button {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 5px;
  background: transparent;
  color: #d9eceb;
}

.viewer-button:hover,
.viewer-button.active {
  background: rgb(255 255 255 / 10%);
}

.viewer-grid {
  display: grid;
  height: 680px;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 2px;
  background: #0a1214;
}

.viewer-grid.projection {
  height: 520px;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

.viewport {
  position: relative;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: #0c1518;
}

.viewport-label {
  position: absolute;
  z-index: 2;
  top: 9px;
  left: 10px;
  padding: 3px 7px;
  border-radius: 4px;
  background: rgb(4 11 13 / 68%);
  color: #d9eceb;
  font-size: 10px;
  pointer-events: none;
}

.finding-strip {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 34px;
  padding: 0 12px;
  border-top: 1px solid rgb(255 255 255 / 10%);
  background: #172528;
  color: #d9eceb;
  font-size: 11px;
}

.finding-strip strong {
  font-weight: 700;
}

.finding-strip span:last-child {
  color: rgb(217 236 235 / 62%);
  text-transform: capitalize;
}

.finding-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ff6b75;
  box-shadow: 0 0 0 4px rgb(255 107 117 / 16%);
}

@media (max-width: 1000px) {
  .viewer-toolbar {
    grid-template-columns: 1fr;
  }

  .toolbar-center,
  .toolbar-right {
    justify-content: flex-start;
  }

  .viewer-grid {
    height: 760px;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, minmax(180px, 1fr));
  }

  .viewer-grid.projection {
    height: 440px;
    grid-template-rows: 1fr;
  }
}
</style>
