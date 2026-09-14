import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const buildDir = process.argv[2] || 'dist-v5-stage4-smoke'
const assetDir = path.join(buildDir, 'assets')
const assets = fs.readdirSync(assetDir).map(name => ({ name, bytes: fs.statSync(path.join(assetDir, name)).size }))
const one = prefix => assets.find(asset => asset.name.startsWith(prefix) && asset.name.endsWith('.js'))
const entry = one('index-')
const cornerstone = one('CornerstoneViewer-')
const gltf = one('GLTFLoader-')

assert(entry && cornerstone && gltf, 'expected lazy route chunks are missing')
assert(entry.bytes <= 350_000, `entry chunk exceeds 350 KB: ${entry.bytes}`)
assert(cornerstone.bytes <= 3_600_000, `Cornerstone chunk exceeds 3.6 MB: ${cornerstone.bytes}`)
assert(gltf.bytes <= 650_000, `GLTF chunk exceeds 650 KB: ${gltf.bytes}`)
assert.notEqual(entry.name, cornerstone.name)
assert.notEqual(entry.name, gltf.name)

console.log(JSON.stringify({ passed: true, buildDir, budgets: {
  entry: { bytes: entry.bytes, limit: 350_000 },
  cornerstone: { bytes: cornerstone.bytes, limit: 3_600_000 },
  gltf: { bytes: gltf.bytes, limit: 650_000 },
} }, null, 2))
