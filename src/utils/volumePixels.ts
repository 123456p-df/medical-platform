export type SliceAxis = 'axial' | 'coronal' | 'sagittal'
export type Shape3D = [number, number, number]
export type VolumeData = { shape: Shape3D; voxels: Float32Array; strides?: Shape3D }
export type LabelVolume = { shape: Shape3D; labels: Uint16Array; strides?: Shape3D }
export type SlicePixels = {
  width: number
  height: number
  pixels: Uint8ClampedArray
  rawPlane?: Float32Array
  windowCenter?: number
  windowWidth?: number
}
export const MAX_BROWSER_VOLUME_BYTES = 256 * 1024 * 1024
export const WINDOW_PRESETS: Record<string, [number, number]> = {
  lung: [-600, 1500],
  soft: [40, 400],
  bone: [400, 1800],
  brain: [40, 80],
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

export function renderVolumeSlice(
  volume: VolumeData,
  axis: SliceAxis,
  index: number,
  preset: string,
  customWindow?: [number, number],
  includeRawPlane = true,
): SlicePixels {
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
  let center: number, winWidth: number

  if (customWindow && customWindow[1] > 0) {
    center = customWindow[0]
    winWidth = customWindow[1]
    low = center - winWidth / 2
    high = center + winWidth / 2
  } else if (WINDOW_PRESETS[preset]) {
    const w = WINDOW_PRESETS[preset]
    center = w[0]
    winWidth = w[1]
    low = center - winWidth / 2
    high = center + winWidth / 2
  } else {
    const sorted = plane.slice().sort()
    const percentile = (q: number) => {
      const position = (sorted.length - 1) * q, lower = Math.floor(position), fraction = position - lower
      return sorted[lower] * (1 - fraction) + sorted[Math.min(lower + 1, sorted.length - 1)] * fraction
    }
    low = percentile(.01)
    high = percentile(.99)
    center = Math.round((low + high) / 2)
    winWidth = Math.round(high - low)
  }

  const pixels = new Uint8ClampedArray(plane.length * 4)
  const span = high - low
  for (let i = 0; i < plane.length; i++) {
    const value = span > 0 ? Math.floor(Math.fround(Math.min(1, Math.max(0,
      Math.fround(Math.fround(plane[i] - low) / span))) * 255)) : 0
    pixels[i * 4] = pixels[i * 4 + 1] = pixels[i * 4 + 2] = value
    pixels[i * 4 + 3] = 255
  }

  return {
    width,
    height,
    pixels,
    rawPlane: includeRawPlane ? plane : undefined,
    windowCenter: center,
    windowWidth: winWidth,
  }
}

/**
 * 将某一正交视口上的 Canvas 像素坐标 (col, row) 映射为全局 3D 体素空间坐标 (vx, vy, vz)
 */
export function parseLabelVolume(buffer: ArrayBuffer, expectedShape: Shape3D): LabelVolume {
  const bytes = new Uint8Array(buffer), view = new DataView(buffer)
  if (bytes.length < 12 || bytes[0] !== 0x93 || String.fromCharCode(...bytes.subarray(1, 6)) !== 'NUMPY') {
    throw new Error('标签体积格式无效')
  }
  const version = bytes[6]
  if (![1, 2, 3].includes(version)) throw new Error('不支持的标签缓存版本')
  const prefix = version === 1 ? 10 : 12
  const length = version === 1 ? view.getUint16(8, true) : view.getUint32(8, true)
  const offset = prefix + length
  if (length > 65536 || offset > bytes.length) throw new Error('标签体积头部无效')
  const header = new TextDecoder().decode(bytes.subarray(prefix, offset))
  const order = /['"]fortran_order['"]\s*:\s*(False|True)/.exec(header)?.[1]
  if (!/['"]descr['"]\s*:\s*['"]<u2['"]/.test(header) || !order) {
    throw new Error('标签缓存必须是小端序 uint16')
  }
  const shape = /['"]shape['"]\s*:\s*\(([^)]+)\)/.exec(header)?.[1]
    .split(',').map(v => v.trim()).filter(Boolean).map(Number)
  if (!shape || shape.length !== 3 || shape.some((v, i) => !Number.isSafeInteger(v) || v < 2 || v !== expectedShape[i])) {
    throw new Error('标签体素矩阵不匹配')
  }
  const count = shape.reduce((a, b) => a * b, 1)
  if (offset + count * 2 > bytes.length) throw new Error('标签体积传输不完整')
  const [nx, ny, nz] = shape
  return {
    shape: shape as Shape3D,
    labels: new Uint16Array(buffer, offset, count),
    strides: order === 'True' ? [1, nx, nx * ny] : [ny * nz, nz, 1],
  }
}

export function extractLabelPlane(volume: LabelVolume, axis: SliceAxis, index: number): { width: number; height: number; plane: Uint16Array } {
  const [nx, ny, nz] = volume.shape
  const dimension: 0 | 1 | 2 = axis === 'axial' ? 2 : axis === 'coronal' ? 1 : 0
  if (axis !== 'axial' && axis !== 'coronal' && axis !== 'sagittal') {
    throw new Error('切片位置超出范围')
  }
  if (!Number.isInteger(index) || index < 0 || index >= volume.shape[dimension]) {
    throw new Error('切片位置超出范围')
  }
  const width = axis === 'sagittal' ? ny : nx, height = axis === 'axial' ? ny : nz
  const plane = new Uint16Array(width * height)
  const [sx, sy, sz] = volume.strides || [ny * nz, nz, 1]
  const columnStride = axis === 'sagittal' ? sy : sx
  const rowStride = axis === 'axial' ? sy : sz
  const origin = index * (axis === 'axial' ? sz : axis === 'coronal' ? sy : sx)
  if (columnStride > rowStride) {
    for (let col = 0; col < width; col++) {
      const columnOffset = origin + (width - 1 - col) * columnStride
      for (let row = 0; row < height; row++) plane[row * width + col] = volume.labels[columnOffset + (height - 1 - row) * rowStride]
    }
  } else {
    for (let row = 0, p = 0; row < height; row++) {
      const rowOffset = origin + (height - 1 - row) * rowStride
      for (let col = 0; col < width; col++, p++) plane[p] = volume.labels[rowOffset + (width - 1 - col) * columnStride]
    }
  }
  return { width, height, plane }
}

export type StainStyle = { color: [number, number, number]; outlineOnly: boolean }

export function compositeStain(
  image: ImageData,
  plane: Uint16Array,
  visible: Set<number>,
  colors: Map<number, StainStyle>,
  opacity: number,
) {
  const { width, height, data } = image
  const alpha = Math.min(1, Math.max(0, opacity))
  const neighbor = (x: number, y: number, label: number) => {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue
        const nx = x + dx, ny = y + dy
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) return true
        if (plane[ny * width + nx] !== label) return true
      }
    }
    return false
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      const label = plane[i]
      if (!label || !visible.has(label)) continue
      const style = colors.get(label)
      if (!style) continue
      if (style.outlineOnly && !neighbor(x, y, label)) continue
      const o = i * 4
      const [r, g, b] = style.color
      if (style.outlineOnly) {
        data[o] = r
        data[o + 1] = g
        data[o + 2] = b
        data[o + 3] = 255
      } else {
        data[o] = Math.round(data[o] * (1 - alpha) + r * alpha)
        data[o + 1] = Math.round(data[o + 1] * (1 - alpha) + g * alpha)
        data[o + 2] = Math.round(data[o + 2] * (1 - alpha) + b * alpha)
      }
    }
  }
}

export function canvasToVoxel(
  axis: SliceAxis,
  col: number,
  row: number,
  sliceIndex: number,
  shape: Shape3D,
): [number, number, number] {
  const [nx, ny, nz] = shape
  let vx = 0, vy = 0, vz = 0
  if (axis === 'axial') {
    vx = Math.max(0, Math.min(nx - 1, nx - 1 - Math.round(col)))
    vy = Math.max(0, Math.min(ny - 1, ny - 1 - Math.round(row)))
    vz = Math.max(0, Math.min(nz - 1, sliceIndex))
  } else if (axis === 'coronal') {
    vx = Math.max(0, Math.min(nx - 1, nx - 1 - Math.round(col)))
    vy = Math.max(0, Math.min(ny - 1, sliceIndex))
    vz = Math.max(0, Math.min(nz - 1, nz - 1 - Math.round(row)))
  } else if (axis === 'sagittal') {
    vx = Math.max(0, Math.min(nx - 1, sliceIndex))
    vy = Math.max(0, Math.min(ny - 1, ny - 1 - Math.round(col)))
    vz = Math.max(0, Math.min(nz - 1, nz - 1 - Math.round(row)))
  }
  return [vx, vy, vz]
}

/**
 * 将全局 3D 体素空间坐标 (vx, vy, vz) 映射为特定视口上的 Canvas 像素坐标 (col, row) 与该视口的目标切片号
 */
export function voxelToCanvas(
  axis: SliceAxis,
  vx: number,
  vy: number,
  vz: number,
  shape: Shape3D,
): { col: number; row: number; sliceIndex: number } {
  const [nx, ny, nz] = shape
  let col = 0, row = 0, sliceIndex = 0
  if (axis === 'axial') {
    col = nx - 1 - vx
    row = ny - 1 - vy
    sliceIndex = vz
  } else if (axis === 'coronal') {
    col = nx - 1 - vx
    row = nz - 1 - vz
    sliceIndex = vy
  } else if (axis === 'sagittal') {
    col = ny - 1 - vy
    row = nz - 1 - vz
    sliceIndex = vx
  }
  return { col, row, sliceIndex }
}
