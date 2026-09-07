<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import { FileArchive, FileImage, Upload, X } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { usePatientStore } from '@/stores/patients'
import SlicerViewer from '@/components/medical/SlicerViewer.vue'
import AIResultCard from '@/components/medical/AIResultCard.vue'
import FindingPanel from '@/components/3d/FindingPanel.vue'
import { detectModalityFromFiles } from '@/utils/studyLoader'
import type { Examination, ExaminationType } from '@/types'

const CornerstoneViewer = defineAsyncComponent(() => import('@/components/medical/CornerstoneViewer.vue'))

const route = useRoute()
const router = useRouter()
const store = usePatientStore()

const patientId = computed(() => String(route.params.id))
const activeExamId = ref((route.query.exam as string) || store.examinations[0]?.id)
const activeFindingId = ref<string | null>(null)
const showUpload = ref(false)
const uploadFiles = ref<File[]>([])
const uploadedFiles = ref<File[]>([])
const uploadedStudy = ref<Examination | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const detectedModality = ref<ExaminationType | null>(null)
const manualModality = ref<'auto' | ExaminationType>('auto')
const detecting = ref(false)

const displayExaminations = computed<Examination[]>(() => [
  ...store.examinations,
  ...(uploadedStudy.value ? [uploadedStudy.value] : []),
])

const activeExamination = computed(
  () =>
    displayExaminations.value.find((exam) => exam.id === activeExamId.value) ??
    displayExaminations.value[0],
)
const isUploadedStudy = computed(() => activeExamination.value?.id.startsWith('UPLOAD-') ?? false)
const activeFindings = computed(() =>
  activeExamination.value
    ? store.findings.filter((finding) => finding.examinationId === activeExamination.value?.id)
    : [],
)
const activeFinding = computed(
  () => activeFindings.value.find((finding) => finding.id === activeFindingId.value) ?? null,
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

function selectExamination(examId: string) {
  activeExamId.value = examId
  router.replace({
    name: 'doctor-patient-imaging',
    params: { id: patientId.value },
    query: { exam: examId },
  })
}

function openUpload() {
  uploadFiles.value = []
  uploadedFiles.value = []
  detectedModality.value = null
  manualModality.value = 'auto'
  showUpload.value = true
}

function closeUpload() {
  showUpload.value = false
  uploadFiles.value = []
}

async function updateDetectedModality() {
  if (!uploadFiles.value.length) {
    detectedModality.value = null
    return
  }
  detecting.value = true
  detectedModality.value = await detectModalityFromFiles(uploadFiles.value)
  detecting.value = false
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  uploadFiles.value = Array.from(input.files ?? [])
  input.value = ''
  void updateDetectedModality()
}

function onDrop(event: DragEvent) {
  uploadFiles.value = Array.from(event.dataTransfer?.files ?? [])
  void updateDetectedModality()
}

async function importStudy() {
  if (!uploadFiles.value.length) return
  const modality =
    manualModality.value === 'auto'
      ? (detectedModality.value ?? (await detectModalityFromFiles(uploadFiles.value)))
      : manualModality.value
  const firstFile = uploadFiles.value[0]
  const id = `UPLOAD-${Date.now()}`
  uploadedStudy.value = {
    id,
    patientId: patientId.value,
    type: modality,
    organ: 'Lung',
    bodyPart: 'Chest',
    date: new Date().toISOString().slice(0, 10),
    status: 'Pending Review',
    description: `Uploaded study: ${firstFile.name}`,
    sliceCount: Math.min(60, Math.max(12, uploadFiles.value.length * 8)),
  }
  uploadedFiles.value = [...uploadFiles.value]
  activeExamId.value = id
  showUpload.value = false
  uploadFiles.value = []
  router.replace({
    name: 'doctor-patient-imaging',
    params: { id: patientId.value },
    query: { exam: id },
  })
}
</script>

<template>
  <div class="imaging-layout">
    <section class="viewer-section card">
      <div class="viewer-toolbar">
        <div>
          <h3>Imaging Study</h3>
          <p class="muted">Load a patient study or import local CT / MRI / X-Ray files.</p>
        </div>
        <button type="button" class="btn btn-primary btn-sm" @click="openUpload">
          <Upload :size="15" /> Upload CT
        </button>
      </div>
      <div class="exam-switcher">
        <button
          v-for="exam in displayExaminations"
          :key="exam.id"
          type="button"
          :class="{ active: exam.id === activeExamination?.id }"
          @click="selectExamination(exam.id)"
        >
          {{ exam.type }} · {{ exam.date }}
        </button>
      </div>
      <SlicerViewer
        v-if="activeExamination && !isUploadedStudy"
        :examination="activeExamination"
        :findings="activeFindings"
        @select-finding="activeFindingId = $event"
      />
      <CornerstoneViewer
        v-else-if="activeExamination && isUploadedStudy && uploadedFiles.length"
        :files="uploadedFiles"
        @error="store.error = $event"
      />
    </section>

    <aside class="finding-side">
      <div class="card">
        <div class="card-header">
          <div>
            <h3>Linked Finding</h3>
            <p class="muted">Select a marker in the image.</p>
          </div>
        </div>
        <div class="card-body">
          <FindingPanel
            v-if="activeFinding"
            :finding="activeFinding"
            :has-report="Boolean(store.reports.find((report) => report.examinationId === activeExamination?.id))"
            @view-ct="activeFindingId = activeFinding.id"
            @view-report="router.push({ name: 'doctor-patient-report', params: { id: patientId } })"
          />
          <div v-else class="empty-state">No marker is selected.</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <h3>AI Results</h3>
            <p class="muted">{{ activeFindings.length }} findings in this study.</p>
          </div>
        </div>
        <div class="card-body stack">
          <AIResultCard
            v-for="finding in activeFindings"
            :key="finding.id"
            :finding="finding"
            compact
          />
          <div v-if="!activeFindings.length" class="empty-state">No AI findings for this study.</div>
        </div>
      </div>
    </aside>

    <div v-if="showUpload" class="upload-overlay" @click.self="closeUpload">
      <form class="upload-modal card" @submit.prevent="importStudy">
        <div class="upload-header">
          <div>
            <h3>Import CT Study</h3>
            <p class="muted">Add local imaging files to this patient record.</p>
          </div>
          <button type="button" class="icon-btn" aria-label="Close upload dialog" @click="closeUpload">
            <X :size="17" />
          </button>
        </div>

        <div
          class="drop-zone"
          @dragover.prevent
          @drop.prevent="onDrop"
        >
          <Upload :size="26" />
          <strong>Drop DICOM, NIfTI, or image files here</strong>
          <span>or</span>
          <input
            ref="fileInput"
            type="file"
            accept=".dcm,.zip,.nii,.nii.gz,.nrrd,image/*"
            multiple
            class="sr-only"
            @change="onFileChange"
          />
          <button type="button" class="btn btn-secondary btn-sm" @click="fileInput?.click()">
            Choose files
          </button>
        </div>

        <div v-if="uploadFiles.length" class="upload-files">
          <div class="upload-files-heading">
            <span>Selected files</span>
            <span>
              {{ detecting ? 'Detecting...' : detectedModality ? `${uploadFiles.length} · ${detectedModality}` : uploadFiles.length }}
            </span>
          </div>
          <div v-for="file in uploadFiles.slice(0, 6)" :key="`${file.name}-${file.size}`" class="upload-file">
            <FileImage v-if="file.type.startsWith('image')" :size="16" />
            <FileArchive v-else :size="16" />
            <span>{{ file.name }}</span>
            <small>{{ (file.size / 1024 / 1024).toFixed(2) }} MB</small>
          </div>
          <p v-if="uploadFiles.length > 6" class="muted">and {{ uploadFiles.length - 6 }} more files</p>
        </div>

        <label v-if="uploadFiles.length" class="modality-control">
          <span>Loading mode</span>
          <select v-model="manualModality" class="select">
            <option value="auto">Auto-detect</option>
            <option value="CT">CT volume</option>
            <option value="MRI">MRI volume</option>
            <option value="X-Ray">X-Ray projection</option>
          </select>
        </label>

        <div class="upload-footer">
          <button type="button" class="btn btn-secondary" @click="closeUpload">Cancel</button>
          <button type="submit" class="btn btn-primary" :disabled="!uploadFiles.length || detecting">Import study</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.imaging-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  align-items: start;
  gap: 18px;
}

.viewer-section {
  overflow: hidden;
}

.viewer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 15px 18px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.viewer-toolbar h3 {
  margin: 0;
  font-size: 15px;
}

.viewer-toolbar p {
  margin: 3px 0 0;
  font-size: 11px;
}

.exam-switcher {
  display: flex;
  gap: 7px;
  overflow-x: auto;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  background: #fbfdfd;
}

.exam-switcher button {
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 5px;
  background: var(--surface);
  color: var(--text-soft);
  font-size: 11px;
  white-space: nowrap;
}

.exam-switcher button.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.finding-side {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.upload-overlay {
  position: fixed;
  z-index: 60;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgb(17 32 36 / 42%);
}

.upload-modal {
  width: min(560px, 100%);
  overflow: hidden;
}

.upload-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
  border-bottom: 1px solid var(--border);
}

.upload-header h3 {
  margin: 0;
  font-size: 17px;
}

.upload-header p {
  margin: 4px 0 0;
  font-size: 12px;
}

.drop-zone {
  display: flex;
  min-height: 210px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 18px;
  padding: 24px;
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius);
  background: var(--surface-2);
  color: var(--text-soft);
  text-align: center;
}

.drop-zone > svg {
  color: var(--accent);
}

.drop-zone span {
  color: var(--text-muted);
  font-size: 11px;
}

.upload-files {
  max-height: 220px;
  margin: 0 18px 18px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.upload-files-heading {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  color: var(--text-soft);
  font-size: 11px;
  font-weight: 700;
}

.upload-file {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-bottom: 1px solid var(--border);
  color: var(--text-soft);
  font-size: 12px;
}

.upload-file:last-child {
  border-bottom: 0;
}

.upload-file span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-file small {
  color: var(--text-muted);
  font-size: 10px;
}

.upload-files p {
  margin: 9px 12px;
  font-size: 11px;
}

.modality-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 0 18px 18px;
  color: var(--text-soft);
  font-size: 12px;
  font-weight: 650;
}

.modality-control .select {
  width: auto;
  min-width: 180px;
}

.upload-footer {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  padding: 14px 18px;
  border-top: 1px solid var(--border);
  background: #fbfdfd;
}

@media (max-width: 1000px) {
  .imaging-layout {
    grid-template-columns: 1fr;
  }

  .upload-overlay {
    padding: 12px;
  }
}
</style>
