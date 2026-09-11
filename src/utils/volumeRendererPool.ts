import { ApiError, request } from '@/api/client'
import { VolumeRenderer } from './volumeRenderer'
import type { Shape3D } from './volumePixels'

const MAX_POOL_BYTES = 512 * 1024 * 1024

interface PoolEntry {
  imageId: string
  shape: Shape3D
  bytes: number
  renderer: VolumeRenderer
  ready: Promise<void>
  refs: number
  lastUsed: number
  progress: number
  progressListeners: Set<(value: number) => void>
  failureListeners: Set<(reason: Error) => void>
  permissionTimer?: ReturnType<typeof setInterval>
}

export interface VolumeRendererHandle {
  renderer: VolumeRenderer
  release: () => void
}

const entries = new Map<string, PoolEntry>()
let pooledBytes = 0

function sameShape(left: Shape3D, right: Shape3D) {
  return left.every((value, index) => value === right[index])
}

async function revalidate(imageId: string) {
  const response = await request('/medical-images/' + imageId)
  await response.body?.cancel().catch(() => {})
}

function discard(entry: PoolEntry, reason?: Error, notify = true) {
  if (entries.get(entry.imageId) !== entry) return
  entries.delete(entry.imageId)
  pooledBytes = Math.max(0, pooledBytes - entry.bytes)
  if (entry.permissionTimer) clearInterval(entry.permissionTimer)
  entry.renderer.dispose()
  if (reason && notify) {
    for (const listener of entry.failureListeners) listener(reason)
  }
  entry.progressListeners.clear()
  entry.failureListeners.clear()
}

function pruneIdle() {
  const idle = [...entries.values()]
    .filter(entry => entry.refs === 0)
    .sort((left, right) => left.lastUsed - right.lastUsed)
  for (const entry of idle) {
    if (pooledBytes <= MAX_POOL_BYTES) break
    discard(entry, undefined, false)
  }
}

function startPermissionChecks(entry: PoolEntry) {
  if (entry.permissionTimer || entry.refs === 0) return
  entry.permissionTimer = setInterval(async () => {
    if (entry.refs === 0 || entries.get(entry.imageId) !== entry) return
    try {
      await revalidate(entry.imageId)
    } catch (reason) {
      if (reason instanceof ApiError && [401, 403, 404].includes(reason.status)) {
        discard(entry, reason)
      }
    }
  }, 30_000)
}

function createEntry(imageId: string, shape: Shape3D) {
  const bytes = shape.reduce((product, value) => product * value, 1) * 4
  let entry: PoolEntry
  const renderer = new VolumeRenderer(reason => discard(entry, reason))
  entry = {
    imageId,
    shape: [...shape] as Shape3D,
    bytes,
    renderer,
    ready: Promise.resolve(),
    refs: 0,
    lastUsed: Date.now(),
    progress: 0,
    progressListeners: new Set(),
    failureListeners: new Set(),
  }
  entries.set(imageId, entry)
  pooledBytes += bytes
  entry.ready = renderer.load(imageId, shape, value => {
    entry.progress = value
    for (const listener of entry.progressListeners) listener(value)
  }).catch(reason => {
    const error = reason instanceof Error ? reason : new Error('Volume loading failed')
    discard(entry, error)
    throw error
  })
  return entry
}

export async function acquireVolumeRenderer(
  imageId: string,
  shape: Shape3D,
  onProgress: (value: number) => void = () => {},
  onFailure: (reason: Error) => void = () => {},
): Promise<VolumeRendererHandle> {
  let entry = entries.get(imageId)
  if (entry && !sameShape(entry.shape, shape)) {
    discard(entry, new Error('Volume geometry changed'))
    entry = undefined
  }
  if (entry) {
    await revalidate(imageId)
    if (entries.get(imageId) !== entry) {
      return acquireVolumeRenderer(imageId, shape, onProgress, onFailure)
    }
  } else {
    entry = createEntry(imageId, shape)
  }

  entry.refs += 1
  entry.lastUsed = Date.now()
  entry.progressListeners.add(onProgress)
  entry.failureListeners.add(onFailure)
  onProgress(entry.progress)
  startPermissionChecks(entry)

  let released = false
  const release = () => {
    if (released) return
    released = true
    entry!.progressListeners.delete(onProgress)
    entry!.failureListeners.delete(onFailure)
    entry!.refs = Math.max(0, entry!.refs - 1)
    entry!.lastUsed = Date.now()
    if (entry!.refs === 0 && entry!.permissionTimer) {
      clearInterval(entry!.permissionTimer)
      entry!.permissionTimer = undefined
    }
    pruneIdle()
  }

  try {
    await entry.ready
    return { renderer: entry.renderer, release }
  } catch (reason) {
    release()
    throw reason
  }
}

export function invalidateVolumeRenderer(imageId: string, reason?: Error) {
  const entry = entries.get(imageId)
  if (entry) discard(entry, reason)
}

export function clearVolumeRendererPool() {
  for (const entry of [...entries.values()]) discard(entry, undefined, false)
  pooledBytes = 0
}
