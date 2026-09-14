import dicomParser from 'dicom-parser'
import type { ExaminationType } from '@/types'
import { normalizeDicomDate } from './dates'

const dicomModalityMap: Record<string, ExaminationType> = {
  CT: 'CT', MR: 'MRI', MRI: 'MRI', XA: 'X-Ray', CR: 'X-Ray', DX: 'X-Ray', RG: 'X-Ray',
}

export function isRasterFile(file: File) {
  return /\.(png|jpe?g|webp|bmp)$/i.test(file.name) || ['image/png', 'image/jpeg', 'image/webp', 'image/bmp'].includes(file.type)
}

export function isSupportedFile(file: File) {
  return isRasterFile(file) || /\.dcm$/i.test(file.name) || file.type === 'application/dicom' || !file.name.includes('.')
}

function modalityFromName(name: string): ExaminationType | null {
  const upper = name.toUpperCase()
  if (/(\b|_|-)(MR|MRI|T1|T2|FLAIR)(\b|_|-)/.test(upper)) return 'MRI'
  if (/(\b|_|-)(XR|XRAY|X-RAY|CR|DX)(\b|_|-)/.test(upper)) return 'X-Ray'
  if (/(\b|_|-)(CT)(\b|_|-)/.test(upper)) return 'CT'
  return null
}

type Vec3 = [number, number, number]

export interface DicomFileMetadata {
  file: File
  modality: ExaminationType
  studyInstanceUID: string
  seriesInstanceUID: string
  sopInstanceUID: string
  patientId: string
  studyDate: string
  seriesDescription: string
  instanceNumber: number | null
  numberOfFrames: number
  imagePositionPatient: Vec3 | null
  imageOrientationPatient: [number, number, number, number, number, number] | null
  rows: number | null
  columns: number | null
  pixelSpacing: [number, number] | null
  transferSyntaxUID: string
}

export interface DicomSeriesGroup {
  key: string
  studyInstanceUID: string
  seriesInstanceUID: string
  modality: ExaminationType
  patientId: string
  studyDate: string
  seriesDescription: string
  transferSyntaxUIDs: string[]
  rows: number | null
  columns: number | null
  pixelSpacing: [number, number] | null
  sliceSpacing: number | null
  totalFrames: number
  files: File[]
  metadata: DicomFileMetadata[]
  warnings: string[]
}

function numberList(value: string | undefined, length: number): number[] | null {
  if (!value) return null
  const numbers = value.split('\\').map(Number)
  return numbers.length === length && numbers.every(Number.isFinite) ? numbers : null
}

function orientationKey(value: DicomFileMetadata['imageOrientationPatient']) {
  return value?.map(item => item.toFixed(5)).join('\\') || ''
}

function positionAlongNormal(item: DicomFileMetadata): number | null {
  const direction = item.imageOrientationPatient
  const position = item.imagePositionPatient
  if (!direction || !position) return null
  const normal: Vec3 = [
    direction[1] * direction[5] - direction[2] * direction[4],
    direction[2] * direction[3] - direction[0] * direction[5],
    direction[0] * direction[4] - direction[1] * direction[3],
  ]
  return normal[0] * position[0] + normal[1] * position[1] + normal[2] * position[2]
}

export async function readDicomMetadata(file: File): Promise<DicomFileMetadata> {
  let dataset: ReturnType<typeof dicomParser.parseDicom>
  try {
    const bytes = new Uint8Array(await file.arrayBuffer())
    dataset = dicomParser.parseDicom(bytes, { untilTag: 'x7fe00010' })
  } catch {
    throw new Error(`${file.name} 不是可读取的 DICOM 文件。`)
  }
  const studyInstanceUID = dataset.string('x0020000d')?.trim() || ''
  const seriesInstanceUID = dataset.string('x0020000e')?.trim() || ''
  const sopInstanceUID = dataset.string('x00080018')?.trim() || ''
  if (!studyInstanceUID || !seriesInstanceUID || !sopInstanceUID) {
    throw new Error(`${file.name} 缺少 Study、Series 或 SOP Instance UID。`)
  }
  const dicomModality = dataset.string('x00080060')?.trim().toUpperCase() || ''
  const modality = dicomModalityMap[dicomModality]
  if (!modality) throw new Error(`${file.name} 的 DICOM 模态 ${dicomModality || '未知'} 暂不支持。`)
  const position = numberList(dataset.string('x00200032'), 3)
  const orientation = numberList(dataset.string('x00200037'), 6)
  const spacing = numberList(dataset.string('x00280030'), 2)
  const instanceRaw = dataset.string('x00200013')?.trim()
  const instanceNumber = instanceRaw && Number.isFinite(Number(instanceRaw)) ? Number(instanceRaw) : null
  const framesRaw = Number(dataset.string('x00280008')?.trim() || 1)
  const numberOfFrames = Number.isSafeInteger(framesRaw) && framesRaw > 0 ? framesRaw : 1
  return {
    file,
    modality,
    studyInstanceUID,
    seriesInstanceUID,
    sopInstanceUID,
    patientId: dataset.string('x00100020')?.trim() || '',
    studyDate: normalizeDicomDate(dataset.string('x00080020')),
    seriesDescription: dataset.string('x0008103e')?.trim() || '',
    instanceNumber,
    numberOfFrames,
    imagePositionPatient: position as Vec3 | null,
    imageOrientationPatient: orientation as DicomFileMetadata['imageOrientationPatient'],
    rows: dataset.uint16('x00280010') ?? null,
    columns: dataset.uint16('x00280011') ?? null,
    pixelSpacing: spacing as [number, number] | null,
    transferSyntaxUID: dataset.string('x00020010')?.trim() || 'unknown',
  }
}

export async function analyzeDicomFiles(files: File[]): Promise<DicomSeriesGroup[]> {
  if (!files.length) return []
  const metadata: DicomFileMetadata[] = []
  const seenSop = new Set<string>()
  const duplicateNames: string[] = []
  for (const file of files) {
    const item = await readDicomMetadata(file)
    if (seenSop.has(item.sopInstanceUID)) {
      duplicateNames.push(file.name)
      continue
    }
    seenSop.add(item.sopInstanceUID)
    metadata.push(item)
  }
  const grouped = new Map<string, DicomFileMetadata[]>()
  for (const item of metadata) {
    const key = `${item.studyInstanceUID}|${item.seriesInstanceUID}`
    grouped.set(key, [...(grouped.get(key) || []), item])
  }
  return [...grouped.entries()].map(([key, items]) => {
    const modalities = new Set(items.map(item => item.modality))
    const dimensions = new Set(items.map(item => `${item.rows}x${item.columns}`))
    const orientations = new Set(items.map(item => orientationKey(item.imageOrientationPatient)).filter(Boolean))
    const spacings = new Set(items.map(item => item.pixelSpacing?.map(value => value.toFixed(5)).join('\\') || '').filter(Boolean))
    const transferSyntaxes = new Set(items.map(item => item.transferSyntaxUID))
    if (modalities.size !== 1 || dimensions.size > 1 || orientations.size > 1 || spacings.size > 1 || transferSyntaxes.size > 1) {
      throw new Error(`Series ${items[0].seriesInstanceUID} 的模态、矩阵、方向、像素间距或传输语法不一致，请拆分后导入。`)
    }
    let usedFallbackOrder = false
    items.sort((left, right) => {
      const leftPosition = positionAlongNormal(left)
      const rightPosition = positionAlongNormal(right)
      if (leftPosition !== null && rightPosition !== null && leftPosition !== rightPosition) return leftPosition - rightPosition
      usedFallbackOrder = true
      if (left.instanceNumber !== null && right.instanceNumber !== null && left.instanceNumber !== right.instanceNumber) {
        return left.instanceNumber - right.instanceNumber
      }
      return left.file.name.localeCompare(right.file.name, undefined, { numeric: true })
    })
    const first = items[0]
    const spatialPositions = items.map(positionAlongNormal).filter((value): value is number => value !== null)
    const sliceSpacing = spatialPositions.length > 1
      ? spatialPositions.slice(1).reduce((sum, value, index) => sum + Math.abs(value - spatialPositions[index]), 0) / (spatialPositions.length - 1)
      : null
    const warnings: string[] = []
    if (usedFallbackOrder) warnings.push('部分切片缺少空间位置，已回退到 InstanceNumber/文件名排序。')
    if (duplicateNames.length) warnings.push(`已忽略 ${duplicateNames.length} 个重复 SOP Instance。`)
    return {
      key,
      studyInstanceUID: first.studyInstanceUID,
      seriesInstanceUID: first.seriesInstanceUID,
      modality: first.modality,
      patientId: first.patientId,
      studyDate: first.studyDate,
      seriesDescription: first.seriesDescription,
      transferSyntaxUIDs: [...transferSyntaxes],
      rows: first.rows,
      columns: first.columns,
      pixelSpacing: first.pixelSpacing,
      sliceSpacing,
      totalFrames: items.reduce((sum, item) => sum + item.numberOfFrames, 0),
      files: items.map(item => item.file),
      metadata: items,
      warnings,
    }
  })
}

export async function detectModalityFromFiles(files: File[]): Promise<ExaminationType | null> {
  const detected = new Set<ExaminationType>()
  for (const file of files) {
    let modality: ExaminationType | null = null
    if (!isRasterFile(file)) modality = (await readDicomMetadata(file)).modality
    else modality = modalityFromName(file.name)
    if (modality) detected.add(modality)
  }
  if (detected.size > 1) throw new Error('Mixed imaging types. Import CT, MRI, and X-Ray as separate studies.')
  return detected.values().next().value ?? null
}

export function viewerModeForModality(modality: ExaminationType) {
  return modality === 'X-Ray' ? 'projection' : 'multiplanar'
}
