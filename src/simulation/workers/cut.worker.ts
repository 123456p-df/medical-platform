import { openPredictedSeam, splitMeshAlongVertexPath } from '../cutting/topology'

interface CutRequest {
  type: 'open'
  requestId: number
  positions: ArrayBuffer
  indices: ArrayBuffer
  path: ArrayBuffer
  maximumHalfWidth: number
}

self.onmessage = (event: MessageEvent<CutRequest>) => {
  const message = event.data
  if (message.type !== 'open') return
  try {
    const split = splitMeshAlongVertexPath(
      new Float32Array(message.positions),
      new Uint32Array(message.indices),
      new Uint32Array(message.path),
    )
    const positions = openPredictedSeam(split, message.maximumHalfWidth)
    const transfer = [
      positions.buffer,
      split.indices.buffer,
      split.leftBoundary.buffer,
      split.rightBoundary.buffer,
      split.affectedTriangles.buffer,
      split.newVertices.buffer,
      split.removedConstraints.buffer,
    ]
    self.postMessage({
      type: 'result',
      requestId: message.requestId,
      positions: positions.buffer,
      indices: split.indices.buffer,
      leftBoundary: split.leftBoundary.buffer,
      rightBoundary: split.rightBoundary.buffer,
      affectedTriangles: split.affectedTriangles.buffer,
      newVertices: split.newVertices.buffer,
      removedConstraints: split.removedConstraints.buffer,
    }, { transfer })
  } catch (reason) {
    self.postMessage({
      type: 'error',
      requestId: message.requestId,
      message: reason instanceof Error ? reason.message : 'Elastic incision prediction failed',
    })
  }
}

export {}
