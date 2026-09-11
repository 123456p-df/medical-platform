import { request } from '@/api/client'
import { MAX_BROWSER_VOLUME_BYTES } from './volumePixels'
import type { Shape3D, SliceAxis, SlicePixels } from './volumePixels'

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
      const reason = new Error('The browser imaging worker could not start.')
      this.failed?.(reason); this.onFailure(reason)
      this.dispose()
    }
  }

  async load(imageId: string, shape: Shape3D, progress: (value: number) => void) {
    const size = shape.reduce((a, b) => a * b, 1) * 4
    if (!Number.isSafeInteger(size) || size > MAX_BROWSER_VOLUME_BYTES) throw new Error('This volume exceeds the 256 MiB continuous-view limit. Single-slice preview remains available.')
    const ready = new Promise<void>((resolve, reject) => { this.loaded = resolve; this.failed = reject })
    // Consume a potential worker error while fetch is still pending.
    void ready.catch(() => {})
    const response = await request('/medical-images/' + imageId + '/volume', { signal: this.controller.signal })
    const reader = response.body?.getReader()
    if (!reader) throw new Error('The browser cannot read the imaging data stream.')
    // Preallocate once; avoid keeping chunks plus a second full-volume concatenation.
    const bytes = new Uint8Array(size + 65548)
    let offset = 0
    try {
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        if (offset + value.length > bytes.length) throw new Error('The imaging payload is larger than expected.')
        bytes.set(value, offset); offset += value.length
        progress(Math.min(99, Math.floor(offset / (size + 128) * 100)))
      }
    } finally { await reader.cancel().catch(() => {}) }
    if (offset < size + 10) throw new Error('The imaging transfer is incomplete. Please retry.')
    if (this.disposed) throw new DOMException('Aborted', 'AbortError')
    this.worker.postMessage({ type: 'load', shape: [...shape], buffer: bytes.buffer, byteLength: offset }, [bytes.buffer])
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
