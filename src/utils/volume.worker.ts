/// <reference lib="webworker" />
import { decodeVolumePayload, renderVolumeSlice } from './volumePixels'
import type { Shape3D, SliceAxis, VolumeData } from './volumePixels'
let volume: VolumeData | undefined
const worker = self as DedicatedWorkerGlobalScope
worker.onmessage = (event: MessageEvent<{
  type: 'load' | 'render'
  id: number
  buffer: ArrayBuffer
  shape: Shape3D
  byteLength: number
  dtype?: string | null
  shuffle?: number
  axis: SliceAxis
  index: number
  preset: string
  customWindow?: [number, number]
}>) => {
  const message = event.data
  void (async () => {
    try {
      if (message.type === 'load') {
        volume = await decodeVolumePayload(message.buffer, message.shape, message.byteLength, message.dtype, message.shuffle || 0)
        worker.postMessage({ type: 'ready' })
      } else {
        if (!volume) throw new Error('影像尚未加载')
        const start = performance.now()
        const result = renderVolumeSlice(volume, message.axis, message.index, message.preset, message.customWindow, true)
        const transferList: Transferable[] = [result.pixels.buffer]
        if (result.rawPlane) {
          transferList.push(result.rawPlane.buffer)
        }
        worker.postMessage(
          { type: 'rendered', id: message.id, ...result, milliseconds: performance.now() - start },
          transferList,
        )
      }
    } catch (e) {
      worker.postMessage({ type: 'error', id: message.id, message: e instanceof Error ? e.message : '影像绘制失败' })
    }
  })()
}
