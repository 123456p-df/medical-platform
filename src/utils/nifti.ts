import * as nifti from 'nifti-reader-js'

export interface NiftiMetadata {
  shape: [number, number, number]
  spacing: [number, number, number]
  affine: number[][]
  orientation: string
  datatype: string
  description: string
}

export interface NiftiVolume extends NiftiMetadata {
  data: DataView
  datatypeCode: number
  littleEndian: boolean
  slope: number
  intercept: number
  windowCenter: number
  windowWidth: number
}

const supportedDatatypes = new Map<number, { bytes: number; label: string }>([
  [nifti.NIFTI1.TYPE_UINT8, { bytes: 1, label: 'uint8' }],
  [nifti.NIFTI1.TYPE_INT8, { bytes: 1, label: 'int8' }],
  [nifti.NIFTI1.TYPE_INT16, { bytes: 2, label: 'int16' }],
  [nifti.NIFTI1.TYPE_UINT16, { bytes: 2, label: 'uint16' }],
  [nifti.NIFTI1.TYPE_INT32, { bytes: 4, label: 'int32' }],
  [nifti.NIFTI1.TYPE_UINT32, { bytes: 4, label: 'uint32' }],
  [nifti.NIFTI1.TYPE_FLOAT32, { bytes: 4, label: 'float32' }],
  [nifti.NIFTI1.TYPE_FLOAT64, { bytes: 8, label: 'float64' }],
])

function parsedMetadata(header: nifti.NIFTI1 | nifti.NIFTI2): NiftiMetadata {
  const dimensionCount = Number(header.dims[0])
  const shape = header.dims.slice(1, 4).map(Number) as [number, number, number]
  const hasExtraVolumes = dimensionCount > 3 && header.dims.slice(4, dimensionCount + 1).some(value => Number(value) > 1)
  if (dimensionCount < 3 || hasExtraVolumes || shape.some(value => !Number.isSafeInteger(value) || value <= 0)) {
    throw new Error('仅支持单个三维 NIfTI 体积；四维/时间序列请先拆分。')
  }
  const datatype = supportedDatatypes.get(header.datatypeCode)
  if (!datatype) throw new Error(`暂不支持此 NIfTI 像素类型（datatype ${header.datatypeCode}）。`)
  const affine = header.affine.map(row => row.map(Number))
  return {
    shape,
    spacing: header.pixDims.slice(1, 4).map(value => Math.abs(Number(value)) || 1) as [number, number, number],
    affine,
    orientation: header.convertNiftiSFormToNEMA(affine) || 'unknown',
    datatype: datatype.label,
    description: header.description?.trim() || '',
  }
}

async function uncompressedData(file: File) {
  const encoded = await file.arrayBuffer()
  if (!nifti.isCompressed(encoded)) return encoded
  // Full decompression also handles very small valid .nii.gz files. The library's
  // header-only stream waits for 540 bytes and can stall when the whole volume is smaller.
  return await nifti.decompressAsync(encoded)
}

export async function readNiftiMetadata(file: File): Promise<NiftiMetadata> {
  try {
    const data = await uncompressedData(file)
    if (!nifti.isNIFTI(data as ArrayBuffer)) throw new Error('invalid')
    return parsedMetadata(nifti.readHeader(data as ArrayBuffer))
  } catch (reason) {
    if (reason instanceof Error && (reason.message.startsWith('仅支持') || reason.message.startsWith('暂不支持'))) throw reason
    throw new Error(`${file.name} 不是可读取的 NIfTI 文件。`)
  }
}

function rawValue(volume: Pick<NiftiVolume, 'data' | 'datatypeCode' | 'littleEndian'>, index: number) {
  const littleEndian = volume.littleEndian
  switch (volume.datatypeCode) {
    case nifti.NIFTI1.TYPE_UINT8: return volume.data.getUint8(index)
    case nifti.NIFTI1.TYPE_INT8: return volume.data.getInt8(index)
    case nifti.NIFTI1.TYPE_INT16: return volume.data.getInt16(index * 2, littleEndian)
    case nifti.NIFTI1.TYPE_UINT16: return volume.data.getUint16(index * 2, littleEndian)
    case nifti.NIFTI1.TYPE_INT32: return volume.data.getInt32(index * 4, littleEndian)
    case nifti.NIFTI1.TYPE_UINT32: return volume.data.getUint32(index * 4, littleEndian)
    case nifti.NIFTI1.TYPE_FLOAT32: return volume.data.getFloat32(index * 4, littleEndian)
    case nifti.NIFTI1.TYPE_FLOAT64: return volume.data.getFloat64(index * 8, littleEndian)
    default: return 0
  }
}

export function niftiVoxelValue(volume: NiftiVolume, index: number) {
  return rawValue(volume, index) * volume.slope + volume.intercept
}

function defaultWindow(volume: NiftiVolume, voxelCount: number) {
  const sampleCount = Math.min(voxelCount, 200_000)
  const stride = Math.max(1, Math.floor(voxelCount / sampleCount))
  const samples: number[] = []
  for (let index = 0; index < voxelCount; index += stride) {
    const value = niftiVoxelValue(volume, index)
    if (Number.isFinite(value)) samples.push(value)
  }
  if (!samples.length) return { center: 0, width: 1 }
  samples.sort((left, right) => left - right)
  const low = samples[Math.floor((samples.length - 1) * 0.01)]
  const high = samples[Math.floor((samples.length - 1) * 0.99)]
  const width = Math.max(high - low, 1)
  return { center: low + width / 2, width }
}

export async function readNiftiVolume(file: File): Promise<NiftiVolume> {
  try {
    const data = await uncompressedData(file)
    if (!nifti.isNIFTI(data)) throw new Error('invalid')
    const header = nifti.readHeader(data)
    const metadata = parsedMetadata(header)
    const image = nifti.readImage(header, data)
    const datatype = supportedDatatypes.get(header.datatypeCode)!
    const voxelCount = metadata.shape.reduce((total, value) => total * value, 1)
    if (image.byteLength < voxelCount * datatype.bytes) throw new Error('truncated')
    const slope = Number.isFinite(header.scl_slope) && header.scl_slope !== 0 ? header.scl_slope : 1
    const intercept = Number.isFinite(header.scl_inter) ? header.scl_inter : 0
    const volume: NiftiVolume = {
      ...metadata,
      data: new DataView(image),
      datatypeCode: header.datatypeCode,
      littleEndian: header.littleEndian,
      slope,
      intercept,
      windowCenter: 0,
      windowWidth: 1,
    }
    const window = defaultWindow(volume, voxelCount)
    volume.windowCenter = window.center
    volume.windowWidth = window.width
    return volume
  } catch (reason) {
    if (reason instanceof Error && (reason.message.startsWith('仅支持') || reason.message.startsWith('暂不支持'))) throw reason
    throw new Error(`${file.name} 的 NIfTI 体素数据损坏或不完整。`)
  }
}
