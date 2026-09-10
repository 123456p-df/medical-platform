<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Columns2, Grid2X2, Link2, Minus, Plus, Square, Unlink2 } from 'lucide-vue-next'
import type { Examination, Finding } from '@/types'
import type { SliceAxis } from '@/utils/volumePixels'
import SliceViewport from './SliceViewport.vue'

type LayoutCount = 1 | 2 | 4

const props = withDefaults(defineProps<{
  examinations: Examination[]
  findings?: Finding[]
  initialId?: string
}>(), {
  findings: () => [],
  initialId: '',
})

const emit = defineEmits<{
  selectStudy: [id: string]
}>()

const layout = ref<LayoutCount>(1)
const syncEnabled = ref(true)
const sharedPosition = ref(0.5)
const axis = ref<SliceAxis>('axial')
const preset = ref('lung')
const zoom = ref(1)
const selectedIds = ref<string[]>([])

const available = computed(() => props.examinations.filter(item => item.type === 'CT'))
const signature = computed(() => available.value.map(item => item.id).join('|'))
const paneStudies = computed(() => Array.from({ length: layout.value }, (_, index) =>
  available.value.find(item => item.id === selectedIds.value[index]) || null))

function reconcileSelections() {
  const validIds = new Set(available.value.map(item => item.id))
  const next = selectedIds.value.filter((id, index, all) => validIds.has(id) && all.indexOf(id) === index)
  if (props.initialId && validIds.has(props.initialId) && !next.includes(props.initialId)) next.unshift(props.initialId)
  for (const study of available.value) {
    if (next.length >= layout.value) break
    if (!next.includes(study.id)) next.push(study.id)
  }
  selectedIds.value = next.slice(0, layout.value)
}

watch([signature, () => props.initialId, layout], reconcileSelections, { immediate: true })

function setLayout(value: LayoutCount) {
  layout.value = value
}

function setStudy(index: number, id: string) {
  const next = [...selectedIds.value]
  const duplicate = next.indexOf(id)
  if (duplicate >= 0 && duplicate !== index) [next[index], next[duplicate]] = [next[duplicate], next[index]]
  else next[index] = id
  selectedIds.value = next
  emit('selectStudy', id)
}

function updatePosition(id: string, position: number) {
  sharedPosition.value = position
  emit('selectStudy', id)
}

function findingsFor(id: string) {
  return props.findings.filter(item => item.examinationId === id)
}
</script>

<template>
  <section class="comparison-viewer">
    <header class="comparison-toolbar">
      <div class="toolbar-group layout-controls" aria-label="对比布局">
        <span>布局</span>
        <button type="button" :class="{ active: layout === 1 }" aria-label="单屏" @click="setLayout(1)"><Square :size="15" /> 1</button>
        <button type="button" :class="{ active: layout === 2 }" aria-label="二分屏" @click="setLayout(2)"><Columns2 :size="15" /> 2</button>
        <button type="button" :class="{ active: layout === 4 }" aria-label="四分屏" @click="setLayout(4)"><Grid2X2 :size="15" /> 4</button>
      </div>
      <div class="toolbar-group">
        <label>方向
          <select v-model="axis"><option value="axial">轴向</option><option value="coronal">冠状</option><option value="sagittal">矢状</option></select>
        </label>
        <label>窗位
          <select v-model="preset"><option value="lung">肺窗</option><option value="soft">软组织</option><option value="bone">骨窗</option><option value="auto">自动</option></select>
        </label>
      </div>
      <div class="toolbar-group">
        <button type="button" aria-label="缩小" :disabled="zoom <= 1" @click="zoom = Math.max(1, zoom - .25)"><Minus :size="15" /></button>
        <span>{{ Math.round(zoom * 100) }}%</span>
        <button type="button" aria-label="放大" :disabled="zoom >= 2" @click="zoom = Math.min(2, zoom + .25)"><Plus :size="15" /></button>
        <button
          type="button"
          class="sync-button"
          :class="{ active: syncEnabled }"
          :aria-pressed="syncEnabled"
          :disabled="layout === 1"
          @click="syncEnabled = !syncEnabled"
        ><Link2 v-if="syncEnabled" :size="15" /><Unlink2 v-else :size="15" />{{ syncEnabled ? '同步滚动' : '独立滚动' }}</button>
      </div>
    </header>

    <div class="comparison-note">
      <span>{{ available.length }} 个 CT 检查可比较</span>
      <span v-if="layout > 1 && syncEnabled">按各检查的相对切片位置同步，适配不同切片数量。</span>
      <span v-else-if="layout > 1">每个窗口可单独滚轮、方向键或拖动滑块。</span>
    </div>

    <div v-if="available.length" class="comparison-grid" :class="`layout-${layout}`">
      <article
        v-for="(study, index) in paneStudies"
        :key="study?.id || 'empty-' + index"
        class="comparison-pane"
        :class="{ selected: study?.id === initialId }"
        @pointerdown.capture="study && emit('selectStudy', study.id)"
      >
        <template v-if="study">
          <div class="study-heading">
            <label :for="'study-slot-' + index">窗口 {{ index + 1 }}</label>
            <select :id="'study-slot-' + index" :value="study.id" @change="setStudy(index, ($event.target as HTMLSelectElement).value)">
              <option v-for="candidate in available" :key="candidate.id" :value="candidate.id">
                {{ candidate.date }} · {{ candidate.organ }} · {{ candidate.sliceCount }} slices
              </option>
            </select>
          </div>
          <SliceViewport
            :examination="study"
            :axis="axis"
            :preset="preset"
            :zoom="zoom"
            :renderer="null"
            :position="layout > 1 && syncEnabled ? sharedPosition : undefined"
            :compact="layout > 1"
            :findings="findingsFor(study.id)"
            @position-change="updatePosition(study.id, $event)"
          />
        </template>
        <div v-else class="empty-pane">
          <Grid2X2 :size="24" />
          <span>请再上传一个 CT 检查</span>
        </div>
      </article>
    </div>
    <div v-else class="empty-comparison">当前患者还没有 CT 检查，请先上传。</div>
  </section>
</template>

<style scoped>
.comparison-viewer{overflow:hidden;border:1px solid #2a3b44;border-radius:12px;background:#111e28;color:#d2e4e7}.comparison-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px 14px;border-bottom:1px solid #2a3b44}.toolbar-group{display:flex;align-items:center;gap:7px}.toolbar-group>span,.toolbar-group label{color:#8ba4aa;font-size:10px}.toolbar-group label{display:flex;align-items:center;gap:6px}.toolbar-group select,.study-heading select{min-height:31px;border:1px solid #34505b;border-radius:5px;background:#1c303a;color:#d2e4e7;padding:5px 8px;font-size:10px}.toolbar-group button{display:inline-flex;min-height:31px;align-items:center;gap:5px;padding:0 9px;border:1px solid #34505b;border-radius:5px;background:#172a34;color:#a7c4c7;font-size:10px}.toolbar-group button.active{border-color:#74aaa3;background:#254943;color:#e1f5f1}.toolbar-group button:disabled{opacity:.35}.comparison-note{display:flex;justify-content:space-between;gap:12px;padding:9px 14px;color:#86a5a9;font-size:10px}.comparison-grid{display:grid;gap:8px;padding:0 9px 9px}.comparison-grid.layout-1{grid-template-columns:1fr}.comparison-grid.layout-2{grid-template-columns:repeat(2,minmax(0,1fr))}.comparison-grid.layout-4{grid-template-columns:repeat(2,minmax(0,1fr))}.comparison-pane{min-width:0;border:1px solid transparent;border-radius:9px}.comparison-pane.selected{border-color:#6ba69e;box-shadow:0 0 0 1px #6ba69e}.study-heading{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:9px;padding:8px 3px}.study-heading label{color:#8ba4aa;font-size:9px}.study-heading select{width:100%}.empty-pane,.empty-comparison{display:grid;min-height:340px;place-items:center;align-content:center;gap:10px;border:1px dashed #35505a;border-radius:9px;color:#78939a;font-size:11px}.empty-comparison{margin:0 9px 9px}.layout-4 .empty-pane{min-height:320px}@media(max-width:760px){.comparison-grid.layout-2,.comparison-grid.layout-4{grid-template-columns:1fr}.comparison-toolbar,.comparison-note{align-items:stretch;flex-direction:column}.toolbar-group{flex-wrap:wrap}}
</style>
