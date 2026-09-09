export type SliceAxis = 'axial' | 'coronal' | 'sagittal'
export type Shape3D = [number, number, number]
export type VolumeData = { shape: Shape3D; voxels: Float32Array; strides?: Shape3D }
export type SlicePixels = { width: number; height: number; pixels: Uint8ClampedArray }
export const MAX_BROWSER_VOLUME_BYTES = 256 * 1024 * 1024
const windows: Record<string, [number, number]> = {
  lung: [-600, 1500], soft: [40, 400], bone: [400, 1800], brain: [40, 80],
}

// Canonical RAS orientation and NPY storage order are independent; support both C and Fortran.
export function parseVolume(buffer: ArrayBuffer, expectedShape: Shape3D, byteLength = buffer.byteLength): VolumeData {
  const bytes = new Uint8Array(buffer, 0, byteLength), view = new DataView(buffer)
  if (bytes.length < 12 || bytes[0] !== 0x93 || String.fromCharCode(...bytes.subarray(1, 6)) !== 'NUMPY') {
    throw new Error('影像体积格式无效')
  }
  const version = bytes[6]
  if (![1, 2, 3].includes(version)) throw new Error('不支持的影像缓存版本')
  const prefix = version === 1 ? 10 : 12
  const length = version === 1 ? view.getUint16(8, true) : view.getUint32(8, true)
  const offset = prefix + length
  if (length > 65536 || offset > bytes.length || offset % 4) throw new Error('影像体积头部无效')
  const header = new TextDecoder().decode(bytes.subarray(prefix, offset))
  const order = /['"]fortran_order['"]\s*:\s*(False|True)/.exec(header)?.[1]
  if (!/['"]descr['"]\s*:\s*['"]<f4['"]/.test(header) || !order) {
    throw new Error('影像缓存必须是小端序 float32')
  }
  const shape = /['"]shape['"]\s*:\s*\(([^)]+)\)/.exec(header)?.[1]
    .split(',').map(v => v.trim()).filter(Boolean).map(Number)
  if (!shape || shape.length !== 3 || shape.some((v, i) => !Number.isSafeInteger(v) || v < 2 || v !== expectedShape[i])) {
    throw new Error('影像体素矩阵不匹配')
  }
  const count = shape.reduce((a, b) => a * b, 1)
  if (!Number.isSafeInteger(count) || count * 4 > MAX_BROWSER_VOLUME_BYTES || offset + count * 4 > bytes.length) {
    throw new Error('影像体积超限或传输不完整')
  }
  const [nx, ny, nz] = shape
  return { shape: shape as Shape3D, voxels: new Float32Array(buffer, offset, count), strides: order === 'True' ? [1, nx, nx * ny] : [ny * nz, nz, 1] }
}

export function renderVolumeSlice(volume: VolumeData, axis: SliceAxis, index: number, preset: string): SlicePixels {
  const [nx, ny, nz] = volume.shape
  const dimension = axis === 'axial' ? 2 : axis === 'coronal' ? 1 : axis === 'sagittal' ? 0 : -1
  if (dimension < 0 || !Number.isInteger(index) || index < 0 || index >= (volume.shape as number[])[dimension]) {
    throw new Error('切片位置超出范围')
  }
  const width = axis === 'sagittal' ? ny : nx, height = axis === 'axial' ? ny : nz
  const plane = new Float32Array(width * height)
  const [sx, sy, sz] = volume.strides || [ny * nz, nz, 1]
  const columnStride = axis === 'sagittal' ? sy : sx
  const rowStride = axis === 'axial' ? sy : sz
  const origin = index * (axis === 'axial' ? sz : axis === 'coronal' ? sy : sx)
  // Radiological view: reverse each displayed plane coordinate; no interpolation of voxels.
  // Walk the tighter source stride first to avoid a page/cache miss per voxel in large CTs.
  if (columnStride > rowStride) {
    for (let col = 0; col < width; col++) {
      const columnOffset = origin + (width - 1 - col) * columnStride
      for (let row = 0; row < height; row++) plane[row * width + col] = volume.voxels[columnOffset + (height - 1 - row) * rowStride]
    }
  } else {
    for (let row = 0, p = 0; row < height; row++) {
      const rowOffset = origin + (height - 1 - row) * rowStride
      for (let col = 0; col < width; col++, p++) plane[p] = volume.voxels[rowOffset + (width - 1 - col) * columnStride]
    }
  }
  let low: number, high: number
  const window = windows[preset]
  if (window) { low = window[0] - window[1] / 2; high = window[0] + window[1] / 2 }
  else {
    const sorted = plane.slice().sort()
    const percentile = (q: number) => {
      const position = (sorted.length - 1) * q, lower = Math.floor(position), fraction = position - lower
      return sorted[lower] * (1 - fraction) + sorted[Math.min(lower + 1, sorted.length - 1)] * fraction
    }
    low = percentile(.01); high = percentile(.99)
  }
  const pixels = new Uint8ClampedArray(plane.length * 4)
  const span = high - low
  for (let i = 0; i < plane.length; i++) {
    // Match NumPy float32 windowing and uint8 truncation used by the PNG endpoint.
    const value = span > 0 ? Math.floor(Math.fround(Math.min(1, Math.max(0,
      Math.fround(Math.fround(plane[i] - low) / span))) * 255)) : 0
    pixels[i * 4] = pixels[i * 4 + 1] = pixels[i * 4 + 2] = value
    pixels[i * 4 + 3] = 255
  }
  return { width, height, pixels }
}
