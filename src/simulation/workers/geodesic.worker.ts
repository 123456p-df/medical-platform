import { buildSurfaceGraph, shortestSurfacePath } from '../cutting/graph'

interface GeodesicRequest {
  type: 'compute'
  requestId: number
  positions: ArrayBuffer
  indices: ArrayBuffer
  start: number
  end: number
}

self.onmessage = (event: MessageEvent<GeodesicRequest>) => {
  const message = event.data
  if (message.type !== 'compute') return
  try {
    const positions = new Float32Array(message.positions)
    const indices = new Uint32Array(message.indices)
    const graph = buildSurfaceGraph(positions, indices)
    const path = shortestSurfacePath(graph, message.start, message.end)
    self.postMessage(
      { type: 'result', requestId: message.requestId, path: path.buffer },
      { transfer: [path.buffer] },
    )
  } catch (reason) {
    self.postMessage({
      type: 'error',
      requestId: message.requestId,
      message: reason instanceof Error ? reason.message : 'Surface path calculation failed',
    })
  }
}

export {}
