import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { request } from '@/api/client'

const MAX_ENTRIES = 3
const MAX_BYTES = 16 * 1024 * 1024

type Entry = {
  template: THREE.Group
  bytes: number
  lastUsed: number
  refs: number
  evicted: boolean
}
export type ModelLease = {
  scene: THREE.Group
  release: () => void
}
const entries = new Map<string, Entry>()
const pending = new Map<string, Promise<Entry>>()

function disposeTemplate(template: THREE.Group) {
  template.traverse(child => {
    if (!(child instanceof THREE.Mesh)) return
    child.geometry.dispose()
    const materials = Array.isArray(child.material) ? child.material : [child.material]
    materials.forEach(material => {
      if ('map' in material && material.map instanceof THREE.Texture) material.map.dispose()
      material.dispose()
    })
  })
}
function cloneScene(template: THREE.Group) {
  return template.clone(true)
}
function evictIfNeeded() {
  const totalBytes = () => [...entries.values()].reduce((sum, entry) => sum + entry.bytes, 0)
  while (entries.size > MAX_ENTRIES || totalBytes() > MAX_BYTES) {
    const candidate = [...entries.entries()]
      .filter(([, entry]) => entry.refs === 0)
      .sort(([, left], [, right]) => left.lastUsed - right.lastUsed)[0]
    if (!candidate) break
    const [key, entry] = candidate
    entries.delete(key)
    entry.evicted = true
    disposeTemplate(entry.template)
  }
}
async function loadEntry(key: string, url: string, signal?: AbortSignal) {
  const response = await request(url, { signal })
  const buffer = await response.arrayBuffer()
  const gltf = await new GLTFLoader().parseAsync(buffer, '')
  const entry: Entry = {
    template: gltf.scene,
    bytes: buffer.byteLength,
    lastUsed: performance.now(),
    refs: 0,
    evicted: false,
  }
  entries.set(key, entry)
  return entry
}
export async function loadCachedModel(key: string, url: string, signal?: AbortSignal): Promise<ModelLease> {
  let entry = entries.get(key)
  if (!entry) {
    let loading = pending.get(key)
    if (!loading) {
      loading = loadEntry(key, url, signal).finally(() => pending.delete(key))
      pending.set(key, loading)
    }
    entry = await loading
  }
  entry.lastUsed = performance.now()
  entry.refs += 1
  evictIfNeeded()
  let released = false
  return {
    scene: cloneScene(entry.template),
    release() {
      if (released) return
      released = true
      entry!.refs = Math.max(0, entry!.refs - 1)
      entry!.lastUsed = performance.now()
      if (entry!.evicted && entry!.refs === 0) disposeTemplate(entry!.template)
      evictIfNeeded()
    },
  }
}
export function clearModelCache() {
  for (const [key, entry] of entries) {
    entries.delete(key)
    entry.evicted = true
    if (entry.refs === 0) disposeTemplate(entry.template)
  }
}
