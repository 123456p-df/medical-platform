import { request } from '@/api/client'
import { MAX_BROWSER_VOLUME_BYTES } from './volumePixels'
import type { Shape3D, SliceAxis, SlicePixels } from './volumePixels'

async function readVolumeBody(
  response: Response,
  signal: AbortSignal,
  progress: (value: number) => void,
): Promise<Uint8Array> {
  const reader = response.body?.getReader()
  if (!reader) throw new Error('浏览器无法读取影像数据流')
  const declared = Number(response.headers.get('content-length'))
  const first = await reader.read()
  if (first.done || !first.value) throw new Error('影像传输不完整，请重试')
  const gzip = first.value.length >= 2 && first.value[0] === 0x1f && first.value[1] === 0x8b
  const mark = (offset: number) => {
    progress(Math.min(99, Math.floor(offset / Math.max(declared || offset, 1) * 100)))
  }
  if (gzip && typeof DecompressionStream !== 'undefined') {
    const stream = new DecompressionStream('gzip')
    const writer = stream.writable.getWriter()
    const decoded = new Response(stream.readable).arrayBuffer()
    let offset = 0
    try {
      offset += first.value.length
      mark(offset)
      await writer.write(first.value)
      while (true) {
        if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
        const { value, done } = await reader.read()
        if (done) break
        offset += value.length
        mark(offset)
        await writer.write(value)
      }
      await writer.close()
    } catch (reason) {
      await writer.abort(reason).catch(() => {})
      throw reason
    } finally {
      await reader.cancel().catch(() => {})
    }
    return new Uint8Array(await decoded)
  }
  const chunks: Uint8Array[] = [first.value]
  let totalLength = first.value.length
  mark(totalLength)
  try {
    while (true) {
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
      const { value, done } = await reader.read()
      if (done) break
      chunks.push(value)
      totalLength += value.length
      mark(totalLength)
    }
  } finally {
    await reader.cancel().catch(() => {})
  }
  const bytes = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.length
  }
  return bytes
}

type Job = {
  id: number
  axis: SliceAxis
  index: number
  preset: string
  customWindow?: [number, number]
  resolve: (result: SlicePixels | null) => void
}
export class VolumeRenderer {
  private worker: Worker
  private controller = new AbortController()
  private pending = new Map<SliceAxis, Job>()
  private active?: Job
  private nextId = 0
  private disposed = false
  private ready = false
  private loaded?: () => void
  private failed?: (reason: Error) => void

  constructor(private onFailure: (reason: Error) => void = () => {}) {
    this.worker = new Worker(new URL('./volume.worker.ts', import.meta.url), { type: 'module' })
    this.worker.onmessage = ({ data }) => {
      if (data.type === 'ready') { this.ready = true; this.loaded?.(); return }
      if (data.type === 'error' && !this.ready) { this.failed?.(new Error(data.message)); return }
      if (data.id !== this.active?.id) return
      if (data.type === 'error') { this.onFailure(new Error(data.message)); this.dispose(); return }
      this.active?.resolve(data.type === 'rendered' ? data : null)
      this.active = undefined
      this.pump()
    }
    this.worker.onerror = () => {
      const reason = new Error('浏览器影像工作线程启动失败')
      this.failed?.(reason); this.onFailure(reason)
      this.dispose()
    }
  }

  async load(imageId: string, shape: Shape3D, progress: (value: number) => void) {
    const count = shape.reduce((a, b) => a * b, 1)
    if (!Number.isSafeInteger(count) || count * 2 > MAX_BROWSER_VOLUME_BYTES) {
      throw new Error('此影像超出本地连续浏览的 256 MiB 上限，可使用逐张预览。')
    }
    const ready = new Promise<void>((resolve, reject) => { this.loaded = resolve; this.failed = reject })
    void ready.catch(() => {})
    const response = await request('/medical-images/' + imageId + '/volume', {
      signal: this.controller.signal,
      priority: 'high',
    } as RequestInit)
    const dtype = response.headers.get('X-Voxel-Dtype')
    const shuffle = Number(response.headers.get('X-Byte-Shuffle') || '0')
    const payload = await readVolumeBody(response, this.controller.signal, progress)
    if (payload.byteLength < 16) throw new Error('影像传输不完整，请重试')
    if (this.disposed) throw new DOMException('Aborted', 'AbortError')
    const bytes = payload.byteOffset === 0 && payload.byteLength === payload.buffer.byteLength
      ? payload
      : payload.slice()
    this.worker.postMessage(
      { type: 'load', shape: [...shape], buffer: bytes.buffer, byteLength: bytes.byteLength, dtype, shuffle },
      [bytes.buffer],
    )
    await ready
    progress(100)
  }

  render(axis: SliceAxis, index: number, preset: string, customWindow?: [number, number]): Promise<SlicePixels | null> {
    if (this.disposed || !this.ready) return Promise.resolve(null)
    return new Promise(resolve => {
      // Only the latest destination per plane waits behind the single active frame.
      this.pending.get(axis)?.resolve(null)
      this.pending.set(axis, { id: ++this.nextId, axis, index, preset, customWindow, resolve })
      this.pump()
    })
  }

  private pump() {
    if (this.active || this.disposed) return
    const next = this.pending.values().next().value as Job | undefined
    if (!next) return
    this.pending.delete(next.axis); this.active = next
    const { id, axis, index, preset, customWindow } = next
    this.worker.postMessage({ type: 'render', id, axis, index, preset, customWindow })
  }

  dispose() {
    if (this.disposed) return
    this.disposed = true
    this.controller.abort(); this.worker.terminate()
    this.failed?.(new DOMException('Aborted', 'AbortError'))
    this.active?.resolve(null); this.active = undefined
    for (const job of this.pending.values()) job.resolve(null)
    this.pending.clear()
  }
}
