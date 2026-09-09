<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { FileArchive, FileImage, Upload, X } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { usePatientStore } from '@/stores/patients'
import SlicerViewer from '@/components/medical/SlicerViewer.vue'
import AIResultCard from '@/components/medical/AIResultCard.vue'
import FindingPanel from '@/components/3d/FindingPanel.vue'
import { detectModalityFromFiles, isSupportedFile, isRasterFile } from '@/utils/studyLoader'
import { saveUpload } from '@/api/uploads'
import UploadedStudyViewer from '@/components/medical/UploadedStudyViewer.vue'
import type { Examination, ExaminationType } from '@/types'


const route = useRoute()
const router = useRouter()
const store = usePatientStore()

const patientId = computed(() => String(route.params.id))
const activeExamId = computed({ get: () => store.activeExamId ?? store.examinations[0]?.id, set: (id) => { store.activeExamId = id ?? null } })
const activeFindingId = ref<string | null>(null)
const showUpload = ref(false)
const uploadFiles = ref<File[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const detectedModality = ref<ExaminationType | null>(null)
const manualModality = ref<'auto' | ExaminationType>('auto')
const detecting = ref(false)
const importing = ref(false)
const uploadError = ref('')
const showHistory = ref(false)
let detectionVersion = 0

const displayExaminations = computed<Examination[]>(() => store.examinations.some((exam) => exam.id.startsWith('UPLOAD-')) || showHistory.value ? store.examinations : store.examinations.filter((exam) => exam.id === activeExamId.value).slice(0, 1))

const activeExamination = computed(
  () =>
    store.examinations.find((exam) => exam.id === activeExamId.value) ?? store.examinations[0],
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
  uploadError.value = ''
  detectedModality.value = null
  manualModality.value = 'auto'
  showUpload.value = true
}

function closeUpload() {
  if (importing.value) return
  detectionVersion++
  detecting.value = false
  showUpload.value = false
  uploadFiles.value = []
}

async function updateDetectedModality() {
  const version = ++detectionVersion
  detectedModality.value = null
  uploadError.value = ''
  if (!uploadFiles.value.length) {
    detectedModality.value = null
    return
  }
  detecting.value = true
  try {
    if (uploadFiles.value.some((file) => !isSupportedFile(file))) throw new Error('Choose DICOM, PNG, JPEG, WebP, or BMP files. Extract archives before importing.')
    if (uploadFiles.value.some(isRasterFile) && uploadFiles.value.some((file) => !isRasterFile(file))) throw new Error('Import DICOM and image files separately.')
    const result = await detectModalityFromFiles(uploadFiles.value)
    if (version === detectionVersion) detectedModality.value = result
  } catch (error) {
    if (version === detectionVersion) uploadError.value = error instanceof Error ? error.message : 'Could not read the selected files.'
  } finally { if (version === detectionVersion) detecting.value = false }
}

function onFileChange(event: Event) {
  manualModality.value = 'auto'
  const input = event.target as HTMLInputElement
  uploadFiles.value = Array.from(input.files ?? [])
  input.value = ''
  void updateDetectedModality()
}

function onDrop(event: DragEvent) {
  if (importing.value) return
  manualModality.value = 'auto'
  uploadFiles.value = Array.from(event.dataTransfer?.files ?? [])
  void updateDetectedModality()
}

async function importStudy() {
  if (!uploadFiles.value.length || detecting.value || importing.value || uploadError.value) return
  const modality =
    manualModality.value === 'auto'
      ? detectedModality.value
      : manualModality.value
  if (!modality) return
  importing.value = true
  const firstFile = uploadFiles.value[0]
  const id = `UPLOAD-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
  const examination: Examination = {
    id,
    patientId: patientId.value,
    type: modality,
    organ: 'Unspecified',
    bodyPart: 'Unspecified',
    date: new Date().toISOString().slice(0, 10),
    status: 'Pending Review',
    description: `Uploaded study: ${firstFile.name}`,
    sliceCount: uploadFiles.value.length,
  }
  try {
  await saveUpload({ examination, files: [...uploadFiles.value] })
  await store.loadPatientContext(patientId.value)
  const patient = store.patients.find((item) => item.id === patientId.value)
  if (patient) { patient.modality = modality; patient.lastExamDate = examination.date; patient.organ = examination.organ; patient.status = 'Pending Review' }
  activeExamId.value = id
  showUpload.value = false
  uploadFiles.value = []
  router.replace({
    name: 'doctor-patient-imaging',
    params: { id: patientId.value },
    query: { exam: id },
  })
  } catch { uploadError.value = 'Import failed. Check browser storage and try again.' }
  finally { importing.value = false }
}
</script>

<template>
  <div class="imaging-layout">
    <section class="viewer-section card">
      <div class="viewer-toolbar">
        <div>
          <h3>{{ $t("Imaging Study") }}</h3>
          <p class="muted">{{ $t("Load a patient study or import local CT / MRI / X-Ray files.") }}</p>
        </div>
        <button type="button" class="btn btn-primary btn-sm" @click="openUpload">
          <Upload :size="15" /> {{ $t("Upload imaging") }} </button>
      </div>
      <div class="exam-switcher">
        <span v-if="!isUploadedStudy" class="demo-label">{{ $t("Sample study") }}</span>
        <button
          v-for="exam in displayExaminations"
          :key="exam.id"
          type="button"
          :class="{ active: exam.id === activeExamination?.id }"
          @click="selectExamination(exam.id)"
        >
          {{ $t(exam.type) }} · {{ $t(exam.date) }}
        </button>
        <button v-if="!isUploadedStudy && store.examinations.length > 1" type="button" @click="showHistory = !showHistory">{{ $t(showHistory ? 'Hide sample history' : 'Show sample history') }}</button>
      </div>
      <SlicerViewer
        v-if="activeExamination && !isUploadedStudy"
        :examination="activeExamination"
        :findings="activeFindings"
        @select-finding="activeFindingId = $event"
      />
      <UploadedStudyViewer
        v-else-if="activeExamination && isUploadedStudy"
        :key="activeExamination.id"
        :examination="activeExamination"
      />
    </section>

    <aside class="finding-side">
      <div class="card">
        <div class="card-header">
          <div>
            <h3>{{ $t("Linked Finding") }}</h3>
            <p class="muted">{{ $t("Select a marker in the image.") }}</p>
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
          <div v-else class="empty-state">{{ $t("No marker is selected.") }}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <h3>{{ $t("AI Results") }}</h3>
            <p class="muted">{{ $t(activeFindings.length) }} {{ $t("findings in this study.") }}</p>
          </div>
        </div>
        <div class="card-body stack">
          <AIResultCard
            v-for="finding in activeFindings"
            :key="finding.id"
            :finding="finding"
            compact
          />
          <div v-if="!activeFindings.length" class="empty-state">{{ $t("No AI findings for this study.") }}</div>
        </div>
      </div>
    </aside>

    <div v-if="showUpload" class="upload-overlay" @click.self="closeUpload">
      <form class="upload-modal card" @submit.prevent="importStudy">
        <div class="upload-header">
          <div>
            <h3>{{ $t("Import imaging study") }}</h3>
            <p class="muted">{{ $t("Add local imaging files to this patient record.") }}</p>
          </div>
          <button type="button" class="icon-btn" :aria-label="$t('Close upload dialog')" @click="closeUpload">
            <X :size="17" />
          </button>
        </div>

        <div
          class="drop-zone"
          @dragover.prevent
          @drop.prevent="onDrop"
        >
          <Upload :size="26" />
          <strong>{{ $t("Drop DICOM or image files here") }}</strong>
          <span>{{ $t("or") }}</span>
          <input
            ref="fileInput"
            type="file"
            accept=".dcm,application/dicom,image/png,image/jpeg,image/webp,image/bmp"
            multiple
            class="sr-only"
            @change="onFileChange"
          />
          <button type="button" class="btn btn-secondary btn-sm" @click="fileInput?.click()"> {{ $t("Choose files") }} </button>
        </div>

        <div v-if="uploadFiles.length" class="upload-files">
          <div class="upload-files-heading">
            <span>{{ $t("Selected files") }}</span>
            <span>
              {{ $t(detecting ? 'Detecting...' : detectedModality ? `${uploadFiles.length} · ${detectedModality}` : uploadFiles.length) }}
            </span>
          </div>
          <div v-for="file in uploadFiles.slice(0, 6)" :key="`${file.name}-${file.size}`" class="upload-file">
            <FileImage v-if="file.type.startsWith('image')" :size="16" />
            <FileArchive v-else :size="16" />
            <span>{{ $t(file.name) }}</span>
            <small>{{ $t((file.size / 1024 / 1024).toFixed(2)) }} {{ $t("MB") }}</small>
          </div>
          <p v-if="uploadFiles.length > 6" class="muted">{{ $t("and") }} {{ $t(uploadFiles.length - 6) }} {{ $t("more files") }}</p>
        </div>

        <label v-if="uploadFiles.length" class="modality-control">
          <span>{{ $t("Imaging type") }}</span>
          <select v-model="manualModality" class="select">
            <option value="auto">{{ $t("Auto-detect") }}</option>
            <option value="CT" :disabled="!!detectedModality && detectedModality !== 'CT'">{{ $t("CT") }}</option>
            <option value="MRI" :disabled="!!detectedModality && detectedModality !== 'MRI'">{{ $t("MRI") }}</option>
            <option value="X-Ray" :disabled="!!detectedModality && detectedModality !== 'X-Ray'">{{ $t("X-Ray") }}</option>
          </select>
        </label>

        <p v-if="uploadFiles.length && !detectedModality && !detecting && !uploadError" class="upload-hint">{{ $t("No imaging type found. Select CT, MRI, or X-Ray to continue.") }}</p>
        <p v-if="uploadError" class="upload-error" role="alert">{{ $t(uploadError) }}</p>
        <div class="upload-footer">
          <button type="button" class="btn btn-secondary" :disabled="importing" @click="closeUpload">{{ $t("Cancel") }}</button>
          <button type="submit" class="btn btn-primary" :disabled="!uploadFiles.length || detecting || importing || !!uploadError || (manualModality === 'auto' && !detectedModality)">{{ $t(importing ? 'Importing...' : 'Import study') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.demo-label { align-self: center; font-size: 11px; color: var(--text-muted); white-space: nowrap; }
.upload-hint, .upload-error { margin: 12px 18px; font-size: 12px; color: var(--text-muted); }
.upload-error { color: var(--red); }
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
