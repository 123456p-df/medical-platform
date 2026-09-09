/// <reference lib="webworker" />
import { parseVolume, renderVolumeSlice } from './volumePixels'
import type { Shape3D, SliceAxis, VolumeData } from './volumePixels'
let volume: VolumeData | undefined
const worker = self as DedicatedWorkerGlobalScope
worker.onmessage = (event: MessageEvent<{
  type: 'load' | 'render'; id: number; buffer: ArrayBuffer; shape: Shape3D; byteLength: number;
  axis: SliceAxis; index: number; preset: string;
}>) => {
  const message = event.data
  try {
    if (message.type === 'load') {
      volume = parseVolume(message.buffer, message.shape, message.byteLength)
      worker.postMessage({ type: 'ready' })
    } else {
      if (!volume) throw new Error('影像尚未加载')
      const start = performance.now()
      const result = renderVolumeSlice(volume, message.axis, message.index, message.preset)
      worker.postMessage({ type: 'rendered', id: message.id, ...result, milliseconds: performance.now() - start }, [result.pixels.buffer])
    }
  } catch (e) {
    worker.postMessage({ type: 'error', id: message.id, message: e instanceof Error ? e.message : '影像绘制失败' })
  }
}
