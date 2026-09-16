import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'

async function sourceModule(file, replacements = []) {
  let source = fs.readFileSync(file, 'utf8')
  for (const [before, after] of replacements) source = source.replace(before, after)
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText
  return import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'))
}

const dates = await sourceModule('src/utils/dates.ts')
assert.equal(dates.localCalendarDate(new Date(2026, 8, 13, 0, 5)), '2026-09-13')
assert.equal(dates.isValidCalendarDate('2024-02-29'), true)
assert.equal(dates.isValidCalendarDate('2026-02-31'), false)
assert.equal(dates.normalizeDicomDate('20260231'), '')
assert.equal(dates.dateFromFilename('scan_20260231.nii', '2026-09-13'), '2026-09-13')

const clinical = await sourceModule('src/utils/clinicalValues.ts')
assert.equal(clinical.displayBloodType({ bloodType: 'A', rhType: 'Positive' }), 'A+')
assert.equal(clinical.displayBloodType({ bloodType: 'O-', rhType: 'Negative' }), 'O-')
assert.equal(clinical.reviewStatus(undefined), 'Unknown')
assert.equal(clinical.reviewStatus('Reviewed'), 'Reviewed')

const previewCapabilities = await sourceModule('src/utils/capabilities.ts', [
  ["import { localPreview } from './runtime'", 'const localPreview = true'],
])
const previewCt = previewCapabilities.capabilityForStudy({ source: 'preview', type: 'CT', organId: 'lung' }, 'doctor')
assert.equal(previewCt.lungAnalysis.enabled, false)
assert.match(previewCt.lungAnalysis.reason, /演示环境/)

const remoteCapabilities = await sourceModule('src/utils/capabilities.ts', [
  ["import { localPreview } from './runtime'", 'const localPreview = false'],
])
const remoteCt = remoteCapabilities.capabilityForStudy({ source: 'remote', type: 'CT', organId: 'lung' }, 'doctor')
assert.equal(remoteCt.lungAnalysis.enabled, true)
assert.equal(remoteCt.segmentation.enabled, true)
const remoteMri = remoteCapabilities.capabilityForStudy({ source: 'remote', type: 'MRI', organId: 'brain' }, 'doctor')
assert.equal(remoteMri.segmentation.enabled, true)
assert.equal(remoteMri.reconstruction3d.enabled, true)
const localCt = remoteCapabilities.capabilityForStudy({ source: 'local-upload', type: 'CT', organId: 'lung' }, 'doctor')
assert.equal(localCt.reconstruction3d.enabled, false)

const authSource = fs.readFileSync('src/stores/auth.ts', 'utf8')
assert.match(authSource, /await api\('\/auth\/logout'/)
assert.match(authSource, /writeSession\(JSON\.stringify\(session\.value\), remember\)/)
assert.match(authSource, /tokenIsExpired\(value\.accessToken\)/)
assert.match(authSource, /role !== 'patient'/)
const mainSource = fs.readFileSync('src/main.ts', 'utf8')
assert.match(mainSource, /if \(!inheritSessionFromOpener\(\)\) prepareSessionForAppBoot\(\)/)
const clientSource = fs.readFileSync('src/api/client.ts', 'utf8')
assert.match(clientSource, /sessionBoot !== __VMRB_AUTH_BOOT_ID__/)
assert.match(clientSource, /storage\.setItem\(SESSION_BOOT_KEY, __VMRB_AUTH_BOOT_ID__\)/)

const draftSource = fs.readFileSync('src/stores/reportDrafts.ts', 'utf8')
assert.match(draftSource, /patientId}::\${examinationId}/)
assert.match(draftSource, /pulmolink-report-drafts-v1:/)
const reportSource = fs.readFileSync('src/views/doctor/PatientReportView.vue', 'utf8')
assert.match(reportSource, /ui\.report\.leaveDraftConfirm/)
assert.match(reportSource, /ui\.report\.draftRestored/)
assert.match(reportSource, /drafts\.clear/)

const repositorySource = fs.readFileSync('src/api/localStudyRepository.ts', 'utf8')
assert.match(repositorySource, /study-metadata/)
assert.match(repositorySource, /study-files/)
assert.match(repositorySource, /createIndex\('patientId'/)
assert.match(repositorySource, /createIndex\('examinationId'/)
assert.match(repositorySource, /database\.transaction\(METADATA_STORE\)/)
assert.doesNotMatch(repositorySource, /transaction\(METADATA_STORE\)[\s\S]{0,160}FILE_STORE/)

const workflowSource = fs.readFileSync('src/stores/workflow.ts', 'utf8')
assert.match(workflowSource, /completed: Boolean/)
assert.match(workflowSource, /updateExaminationReview/)
const patientDetailSource = fs.readFileSync('src/views/patient/ExaminationDetailView.vue', 'utf8')
assert.doesNotMatch(patientDetailSource, /!report\.examinationId && report\.organId/)
const routerSource = fs.readFileSync('src/router/index.ts', 'utf8')
assert.match(routerSource, /name: 'not-found'/)

console.log(JSON.stringify({
  passed: true,
  checks: [
    'calendar dates reject impossible dates and stay on the local calendar day',
    'blood type and unknown review states preserve clinical meaning',
    'study capabilities support remote CT/MRI and block model actions in preview and local-upload modes',
    'logout, fresh-launch authentication, registration roles, and report draft recovery use one contract',
    'IndexedDB metadata and image blobs use separate indexed stores',
    'review state updates are unified and examination reports require exact linkage',
    'unknown routes render a dedicated not-found page',
  ],
}, null, 2))
