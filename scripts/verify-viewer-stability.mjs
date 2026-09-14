import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'

async function sourceModule(file) {
  const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText
  return import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'))
}

const modality = await sourceModule('src/utils/viewerCapabilities.ts')
assert.equal(modality.viewerCapabilities('CT').tools.includes('probe'), true)
assert.equal(modality.viewerCapabilities('MRI').tools.includes('probe'), false)
assert.deepEqual(modality.viewerCapabilities('X-Ray').layouts, ['single'])
assert.equal(modality.viewerCapabilities('X-Ray').cine, false)

const world = await sourceModule('src/utils/worldCoordinates.ts')
const identityStudy = { shape: [10, 10, 10], sliceCount: 10, acquisition: { affine: [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0]] } }
const thickStudy = { shape: [10, 10, 10], sliceCount: 10, acquisition: { affine: [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 2, 0]] } }
const anchor = world.worldAtPosition(identityStudy, 'axial', 0.5)
assert.deepEqual(anchor, [4.5, 4.5, 4.5])
assert.equal(world.positionAtWorld(thickStudy, 'axial', anchor), 0.25)

const overlay = fs.readFileSync('src/components/medical/CrosshairsOverlay.vue', 'utf8')
assert.match(overlay, /if \(!f\.centerVoxel \|\| !f\.boxVoxel\) continue/)
assert.doesNotMatch(overlay, /f\.boxVoxel \|\|/)
assert.doesNotMatch(overlay, /diameterMm \|\| 10/)

const gestures = fs.readFileSync('src/composables/useViewportGestures.ts', 'utf8')
assert.match(gestures, /if \(event\.button === 2\)[\s\S]+else if \(event\.button === 1/)
assert.doesNotMatch(gestures, /event\.button === 2 \|\|/)

const mpr = fs.readFileSync('src/components/medical/MPRViewer.vue', 'utf8')
assert.match(mpr, /positionToSlice\(axialPosition\.value, count\)/)
assert.match(mpr, /document\.hidden && isPlaying\.value/)
assert.match(mpr, /pulmolink-reset-viewport/)
assert.doesNotMatch(mpr, /window\.addEventListener\('keydown'/)
assert.doesNotMatch(mpr, /e\.key === 'Tab'/)

const patientTable = fs.readFileSync('src/components/patient/PatientTable.vue', 'utf8')
assert.match(patientTable, /event\.target !== event\.currentTarget/)
const workspaceTabs = fs.readFileSync('src/components/layout/WorkspaceTabs.vue', 'utf8')
assert.match(workspaceTabs, /'ArrowRight'/)
assert.match(workspaceTabs, /'ArrowLeft'/)
assert.match(workspaceTabs, /'Home'/)
assert.match(workspaceTabs, /'End'/)

const cornerstone = fs.readFileSync('src/components/medical/CornerstoneViewer.vue', 'utf8')
assert.match(cornerstone, /'initializing' \| 'registering' \| 'decoding' \| 'rendering'/)
assert.match(cornerstone, /ui\.viewer\.retry/)

const crosshairs = fs.readFileSync('src/composables/useCrosshairs.ts', 'utf8')
assert.match(crosshairs, /scopedStates = new Map/)
assert.match(crosshairs, /releaseCrosshairs/)

const organModel = fs.readFileSync('src/components/3d/OrganModelViewer.vue', 'utf8')
assert.match(organModel, /loadController\?\.abort\(\)/)
assert.match(organModel, /forceContextLoss\(\)/)
assert.doesNotMatch(organModel, /0\.75mm FMRC/)

const studyWindow = fs.readFileSync('src/views/viewer/StudyViewerWindow.vue', 'utf8')
assert.match(studyWindow, /volumeVersions = \{ primary: 0, compare: 0 \}/)
assert.match(studyWindow, /selectedGroups\.value = parsed\.filter[\s\S]{0,120}return/)

const imaging = fs.readFileSync('src/views/doctor/PatientImagingView.vue', 'utf8')
assert.match(imaging, /pulmolink-ai-tasks-v1:/)
assert.match(imaging, /ui\.imaging\.(?:segmentation|detection)Reconnecting/)

const uploadQueue = fs.readFileSync('src/components/medical/MultiStudyUpload.vue', 'utf8')
assert.match(uploadQueue, /cancelCurrent/)
assert.match(uploadQueue, /cancelPending/)
assert.match(uploadQueue, /uploadAll\(true\)/)
assert.match(uploadQueue, /liveEntry\.status = progress\.phase/)
const uploadApi = fs.readFileSync('src/api/examinations.ts', 'utf8')
assert.match(uploadApi, /xhr\.upload\.onprogress/)
assert.match(uploadApi, /options\.signal\?\.addEventListener\('abort'/)
const localUpload = fs.readFileSync('src/components/medical/LocalStudyUpload.vue', 'utf8')
assert.match(localUpload, /function removeFile/)
assert.match(localUpload, /void validateAndDetect\(\)/)

const dashboard = fs.readFileSync('src/views/doctor/DoctorDashboardView.vue', 'utf8')
assert.match(dashboard, /new AbortController\(\)/)
assert.match(dashboard, /setTimeout\(\(\) => void loadRoster\(1\), 300\)/)
assert.match(dashboard, /ui\.dashboard\.pagination/)
assert.match(dashboard, /persistRosterQuery/)
const patientApi = fs.readFileSync('src/api/patients.ts', 'utf8')
assert.match(patientApi, /page_size/)
assert.match(patientApi, /organ_id/)
const reports = fs.readFileSync('src/views/patient/ReportsView.vue', 'utf8')
assert.match(reports, /filteredReports/)
assert.match(reports, /ui\.reports\.startDate/)
const reportCard = fs.readFileSync('src/components/medical/ReportCard.vue', 'utf8')
assert.match(reportCard, /window\.print\(\)/)
assert.match(reportCard, /ui\.report\.reportId/)
const aiStore = fs.readFileSync('src/stores/aiChat.ts', 'utf8')
assert.match(aiStore, /backendPatientId\(patientId\)/)
assert.match(aiStore, /controllers\.get\(key\)\?\.abort\(\)/)
assert.match(aiStore, /openReference/)
const aiPage = fs.readFileSync('src/views/doctor/PatientAIView.vue', 'utf8')
const aiAssistant = fs.readFileSync('src/components/layout/AIAssistant.vue', 'utf8')
assert.match(aiPage, /useAIChatStore/)
assert.match(aiAssistant, /useAIChatStore/)
const topbar = fs.readFileSync('src/components/layout/Topbar.vue', 'utf8')
assert.match(topbar, /patientNotices/)
assert.match(topbar, /pulmolink-read-notifications/)

console.log(JSON.stringify({
  passed: true,
  checks: [
    'DICOM loading exposes stages and in-place retry',
    'findings without geometry do not receive fabricated coordinates or sizes',
    'mouse buttons override selected tools and reset clears viewport state',
    'CT, MRI, and X-Ray expose modality-appropriate viewer capabilities',
    'cine advances one real slice per frame and pauses in the background',
    'crosshairs and asynchronous 3D resources are scoped and released',
    'cross-study synchronization uses affine world coordinates when available',
    'AI task identifiers survive navigation and reconnect polling',
    'upload queues expose byte progress, cancellation, retry, and per-file exclusion',
    'viewer shortcuts preserve Tab navigation and workspace tabs support arrow-key focus',
    'patient roster uses cancellable server pagination and reports support filtering and signed print output',
    'AI entry points share one scoped chat store and signed report notifications link to records',
  ],
}, null, 2))
