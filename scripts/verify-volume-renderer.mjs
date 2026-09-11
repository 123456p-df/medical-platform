import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { reactive } from 'vue'

const source = ts.transpileModule(fs.readFileSync('src/utils/volumePixels.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText
const pixelsModule = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const { parseVolume, renderVolumeSlice, parseLabelVolume, extractLabelPlane, compositeStain } = await import(pixelsModule)
function fixture(shape = [2, 3, 4]) {
  const prefix = "{'descr': '<f4', 'fortran_order': False, 'shape': (" + shape.join(', ') + "), }"
  const header = prefix.padEnd(117) + '\n'
  const buffer = new ArrayBuffer(128 + shape.reduce((a, b) => a * b, 1) * 4)
  const bytes = new Uint8Array(buffer)
  bytes.set([147, 78, 85, 77, 80, 89, 1, 0]); new DataView(buffer).setUint16(8, 118, true)
  bytes.set(new TextEncoder().encode(header), 10)
  new Float32Array(buffer, 128).forEach((_, i, values) => { values[i] = i })
  return buffer
}
const volume = parseVolume(fixture(), [2, 3, 4])
// Hand-written radiological pixel order, checked independently of render-loop indices.
for (const [axis, index, expected] of [
  ['axial', 1, [21, 9, 17, 5, 13, 1]],
  ['coronal', 1, [19, 7, 18, 6, 17, 5, 16, 4]],
  ['sagittal', 1, [23, 19, 15, 22, 18, 14, 21, 17, 13, 20, 16, 12]],
]) {
  const result = renderVolumeSlice(volume, axis, index, 'soft')
  assert.deepEqual([...result.pixels.filter((_, i) => i % 4 === 0)], expected.map(v => Math.floor((v + 160) / 400 * 255)))
  assert.ok(result.pixels.filter((_, i) => i % 4 === 3).every(v => v === 255))
}
assert.throws(() => parseVolume(fixture(), [4, 3, 2]), /矩阵不匹配/)
assert.throws(() => parseVolume(fixture(), [2, 3, 4], 210), /不完整/)
assert.throws(() => parseVolume(new ArrayBuffer(50), [2, 3, 4]), /格式无效/)
assert.throws(() => renderVolumeSlice(volume, 'axial', 4, 'lung'), /超出范围/)
assert.throws(() => renderVolumeSlice(volume, 'axial', -1, 'lung'), /超出范围/)
const uniform = { shape: [2, 3, 4], voxels: new Float32Array(24).fill(5) }
assert.ok(renderVolumeSlice(uniform, 'axial', 0, 'auto').pixels.filter((_, i) => i % 4 !== 3).every(v => v === 0))
function labelFixture(shape = [2, 3, 4]) {
  const prefix = "{'descr': '<u2', 'fortran_order': False, 'shape': (" + shape.join(', ') + "), }"
  const header = prefix.padEnd(117) + '\n'
  const count = shape.reduce((a, b) => a * b, 1)
  const buffer = new ArrayBuffer(128 + count * 2)
  const bytes = new Uint8Array(buffer)
  bytes.set([147, 78, 85, 77, 80, 89, 1, 0]); new DataView(buffer).setUint16(8, 118, true)
  bytes.set(new TextEncoder().encode(header), 10)
  const labels = new Uint16Array(buffer, 128)
  labels[0] = 1
  labels[1] = 1
  labels[2] = 3
  return buffer
}
const labels = parseLabelVolume(labelFixture(), [2, 3, 4])
assert.equal(labels.labels[0], 1)
assert.equal(extractLabelPlane(labels, 'axial', 0).plane.length, 6)
const stained = { width: 2, height: 1, data: new Uint8ClampedArray([10, 10, 10, 255, 10, 10, 10, 255]) }
const colors = new Map([[1, { color: [200, 0, 0], outlineOnly: false }], [3, { color: [8, 8, 8], outlineOnly: true }]])
compositeStain(stained, new Uint16Array([1, 3]), new Set([1, 3]), colors, 0.5)
assert.ok(stained.data[0] > 10)
assert.equal(stained.data[4], 8)
console.log('PASS: NPY validation, truncation, orientation, windowing, opacity, bounds and stain overlay.')
const fortran = fixture(), fortranBytes = new Uint8Array(fortran)
const originalHeader = new TextDecoder().decode(fortranBytes.subarray(10, 128))
fortranBytes.set(new TextEncoder().encode(originalHeader.replace('False', 'True ').padEnd(118)), 10)
const fvalues = new Float32Array(fortran, 128)
for (let x = 0; x < 2; x++) for (let y = 0; y < 3; y++) for (let z = 0; z < 4; z++) fvalues[x + y * 2 + z * 6] = (x * 3 + y) * 4 + z
const fvolume = parseVolume(fortran, [2, 3, 4])
for (const axis of ['axial', 'coronal', 'sagittal']) assert.deepEqual(renderVolumeSlice(fvolume, axis, 1, 'auto'), renderVolumeSlice(volume, axis, 1, 'auto'))
console.log('PASS: identical pixels for C-order and Fortran-order files.')

// Real worker scheduling contract: replace queued destinations and release outstanding jobs on disposal.
let fakeWorker, requests = 0
globalThis.Worker = class {
  messages = []
  constructor() { fakeWorker = this }
  postMessage(message) {
    structuredClone(message)
    if (message.type === 'load') queueMicrotask(() => this.onmessage({ data: { type: 'ready' } }))
    else this.messages.push(message)
  }
  finish() { const message = this.messages.shift(); this.onmessage({ data: { ...message, type: 'rendered', pixels: new Uint8ClampedArray(4) } }) }
  terminate() { this.terminated = true }
}
globalThis.testRequest = async () => { requests++; return new Response(fixture()) }
const engineSource = ts.transpileModule(fs.readFileSync('src/utils/volumeRenderer.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText.replace(/import \{ request \} from ['"]@\/api\/client['"];?/, 'const request = globalThis.testRequest;')
  .replace("'./volumePixels'", JSON.stringify(pixelsModule))
  .replace("new URL('./volume.worker.ts', import.meta.url)", "'test-worker'")
const { VolumeRenderer } = await import(`data:text/javascript;base64,${Buffer.from(engineSource).toString('base64')}`)
const engine = new VolumeRenderer()
await engine.load('isolated-test', reactive([2, 3, 4]), () => {})
const first = engine.render('axial', 0, 'lung')
const replaced = engine.render('axial', 1, 'lung')
const latest = engine.render('axial', 3, 'lung')
assert.equal(await replaced, null)
assert.equal(fakeWorker.messages.length, 1)
fakeWorker.finish(); assert.ok((await first).pixels)
assert.equal(fakeWorker.messages[0].index, 3)
fakeWorker.finish(); await latest
const pending = engine.render('coronal', 1, 'lung')
engine.dispose()
assert.equal(await pending, null)
assert.ok(fakeWorker.terminated)
assert.equal(requests, 1, 'Local navigation must not make a network request per frame')
console.log('PASS: latest-frame queue, single volume download, disposal and pending-frame cleanup.')

if (process.argv.includes('--real')) {
  const root = path.resolve('.cache/real-imaging/validation')
  const results = JSON.parse(fs.readFileSync(path.join(root, 'results.json'), 'utf8'))
  const report = []
  for (const sample of results) {
    const bytes = fs.readFileSync(path.join(root, sample.sample + '.npy'))
    const parsed = parseVolume(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), sample.shape)
    const preset = sample.modality === 'CT' ? 'lung' : 'auto'
    for (const check of sample.checks) {
      const result = renderVolumeSlice(parsed, check.axis, check.index, preset)
      const expected = fs.readFileSync(path.join(root, `${sample.sample}-${check.axis}-${check.index}.gray`))
      const actual = result.pixels.filter((_, i) => i % 4 === 0)
      assert.equal(actual.length, expected.length)
      let differences = 0, maxError = 0
      for (let i = 0; i < actual.length; i++) if (actual[i] !== expected[i]) { differences++; maxError = Math.max(maxError, Math.abs(actual[i] - expected[i])) }
      assert.equal(differences, 0, `${sample.sample} ${check.axis}/${check.index}: ${differences} differing pixels, max error ${maxError}`)
    }
    // Warm up all axes; measure many widely spaced positions, as in rapid scrubbing.
    const axes = ['axial', 'coronal', 'sagittal'], dimensions = [2, 1, 0]
    for (let i = 0; i < 12; i++) renderVolumeSlice(parsed, axes[i % 3], i, preset)
    const durations = []
    for (let i = 0; i < 180; i++) {
      const axis = axes[i % 3], index = (i * 37) % sample.shape[dimensions[i % 3]]
      const start = performance.now(); renderVolumeSlice(parsed, axis, index, preset)
      durations.push(performance.now() - start)
    }
    durations.sort((a, b) => a - b)
    const metric = { sample: sample.sample, frames: durations.length, p50_ms: +durations[90].toFixed(2), p95_ms: +durations[171].toFixed(2), max_ms: +durations.at(-1).toFixed(2), matching_slices: sample.checks.length }
    report.push(metric); console.log(JSON.stringify(metric))
  }
  fs.writeFileSync(path.join(root, 'browser-renderer-benchmark.json'), JSON.stringify(report, null, 2))
  console.log('PASS: real CT/MRI renderer matches all 18 server PNGs pixel-for-pixel.')
}
