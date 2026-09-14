import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'
import dicomParser from 'dicom-parser'

globalThis.testDicomParser = dicomParser

async function sourceModule(file, replacements = []) {
  let source = fs.readFileSync(file, 'utf8')
  for (const [before, after] of replacements) source = source.replace(before, after)
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText
  return import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'))
}

function element(group, tag, vr, value) {
  let data
  if (Buffer.isBuffer(value)) data = value
  else if (vr === 'US') { data = Buffer.alloc(2); data.writeUInt16LE(value) }
  else if (vr === 'UL') { data = Buffer.alloc(4); data.writeUInt32LE(value) }
  else {
    data = Buffer.from(String(value))
    if (data.length % 2) data = Buffer.concat([data, Buffer.from(vr === 'UI' ? [0] : [32])])
  }
  const long = ['OB', 'OW', 'SQ', 'UN', 'UT'].includes(vr)
  const header = Buffer.alloc(long ? 12 : 8)
  header.writeUInt16LE(group)
  header.writeUInt16LE(tag, 2)
  header.write(vr, 4)
  if (long) header.writeUInt32LE(data.length, 8)
  else header.writeUInt16LE(data.length, 6)
  return Buffer.concat([header, data])
}

function dicomFixture({ study, series, sop, instance, z, modality = 'CT', frames = 1 }) {
  const sopClass = '1.2.840.10008.5.1.4.1.1.2'
  const meta = Buffer.concat([
    element(2, 1, 'OB', Buffer.from([0, 1])),
    element(2, 2, 'UI', sopClass),
    element(2, 3, 'UI', sop),
    element(2, 16, 'UI', '1.2.840.10008.1.2.1'),
    element(2, 18, 'UI', '2.25.99999'),
  ])
  const pixels = Buffer.alloc(4 * 4 * 2 * frames)
  const tags = [
    [8, 22, 'UI', sopClass], [8, 24, 'UI', sop], [8, 32, 'DA', '20260913'], [8, 96, 'CS', modality],
    [16, 32, 'LO', 'P001'], [32, 13, 'UI', study], [32, 14, 'UI', series], [32, 19, 'IS', String(instance)],
    [32, 50, 'DS', `0\\0\\${z}`], [32, 55, 'DS', '1\\0\\0\\0\\1\\0'],
    [40, 2, 'US', 1], [40, 4, 'CS', 'MONOCHROME2'], [40, 8, 'IS', String(frames)], [40, 16, 'US', 4], [40, 17, 'US', 4],
    [40, 48, 'DS', '0.7\\0.8'], [40, 256, 'US', 16], [40, 257, 'US', 16], [40, 258, 'US', 15],
    [40, 259, 'US', 0], [0x7fe0, 16, 'OW', pixels],
  ]
  return Buffer.concat([
    Buffer.alloc(128), Buffer.from('DICM'), element(2, 0, 'UL', meta.length), meta,
    ...tags.map(tag => element(...tag)),
  ])
}

const patientIds = await sourceModule('src/utils/patientIds.ts')
assert.equal(patientIds.normalizePatientId('  P20260021  '), 'P20260021')
assert.equal(patientIds.normalizePatientId(['17', '18']), '17')
assert.equal(patientIds.backendPatientId('17'), 17)
assert.throws(() => patientIds.backendPatientId('P20260021'), /数字 ID/)

const mappers = await sourceModule('src/api/mappers.ts', [
  ["import { reviewStatus } from '@/utils/clinicalValues'", "const reviewStatus = value => typeof value === 'string' ? value : 'Unknown'"],
])
const affine = [[1, 0, 0, 10], [0, 2, 0, 20], [0, 0, 3, 30], [0, 0, 0, 1]]
const mappedImage = mappers.mapImage({
  image_id: 'IMG', patient_id: 17, image_type: 'CT', organ_id: 'lung', slice_count: 3,
  study_date: '2026-09-13', created_at: '2026-09-13T00:00:00Z', shape: [4, 4, 3],
  spacing: [1, 2, 3], acquisition: { affine },
})
assert.deepEqual(mappedImage.acquisition.affine, affine)
assert.equal(mappedImage.source, 'remote')
const mappedRecord = mappers.mapRecord({
  record_id: 1, patient_id: 17, organ_id: 'lung', organ_ids: ['lung'], examination_id: 'IMG',
  diagnosis: 'D', description: 'E', recommendation: '', reviewed: true, signed_at: '2026-09-13T01:00:00Z',
  record_date: '2026-09-13', doctor_name: 'Doctor', addenda: [{ addendum_id: 2, record_id: 1,
    author_user_id: 3, author_name: 'Doctor', reason: 'Correction', content: 'Text', created_at: '2026-09-13T02:00:00Z' }],
})
assert.equal(mappedRecord.signedAt, '2026-09-13T01:00:00Z')
assert.equal(mappedRecord.addenda[0].reason, 'Correction')

const findingGeometry = await sourceModule('src/utils/findingGeometry.ts')
assert.deepEqual(
  findingGeometry.findingGeometryFromVoxel([1, 2, 3], [1, 2, 3, 4, 5, 6], [1, 1, 1], { affine }),
  { centerWorldMm: [11, 24, 39], boxWorldMm: [11, 24, 39, 4, 10, 18] },
)

const loader = await sourceModule('src/utils/studyLoader.ts', [
  ["import dicomParser from 'dicom-parser'", 'const dicomParser = globalThis.testDicomParser'],
  ["import { normalizeDicomDate } from './dates'", "const normalizeDicomDate = value => { if (!value || !/^\\d{8}$/.test(value)) return ''; const result = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`; const [year, month, day] = result.split('-').map(Number); const date = new Date(year, month - 1, day); return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? result : '' }"],
])
const files = [
  new File([dicomFixture({ study: '2.25.1', series: '2.25.1.1', sop: '2.25.11', instance: 2, z: 10 })], 'slice-2.dcm'),
  new File([dicomFixture({ study: '2.25.1', series: '2.25.1.1', sop: '2.25.10', instance: 1, z: 5 })], 'slice-1.dcm'),
  new File([dicomFixture({ study: '2.25.1', series: '2.25.1.2', sop: '2.25.12', instance: 1, z: 0 })], 'other-series.dcm'),
  new File([dicomFixture({ study: '2.25.2', series: '2.25.2.1', sop: '2.25.20', instance: 1, z: 0, frames: 3 })], 'multiframe.dcm'),
]
const groups = await loader.analyzeDicomFiles(files)
assert.equal(groups.length, 3)
const firstSeries = groups.find(group => group.seriesInstanceUID === '2.25.1.1')
assert.deepEqual(firstSeries.files.map(file => file.name), ['slice-1.dcm', 'slice-2.dcm'])
assert.equal(firstSeries.studyDate, '2026-09-13')
assert.deepEqual(firstSeries.pixelSpacing, [0.7, 0.8])
assert.equal(firstSeries.sliceSpacing, 5)
assert.equal(groups.find(group => group.seriesInstanceUID === '2.25.2.1').totalFrames, 3)
await assert.rejects(loader.analyzeDicomFiles([new File(['plain text'], 'invalid-CT.dcm')]), /不是可读取的 DICOM/)

console.log(JSON.stringify({
  passed: true,
  checks: [
    'patient IDs remain strings until the backend boundary',
    'image affine and signed report metadata survive DTO mapping',
    'voxel finding geometry converts to world coordinates',
    'DICOM files group by Study/Series and sort by spatial position',
    'invalid .dcm content is rejected',
  ],
}, null, 2))
