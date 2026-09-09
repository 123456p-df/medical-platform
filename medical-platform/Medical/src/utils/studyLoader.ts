import dicomParser from 'dicom-parser'
import type { ExaminationType } from '@/types'

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

export async function detectModalityFromFiles(files: File[]): Promise<ExaminationType | null> {
  const detected = new Set<ExaminationType>()
  for (const file of files) {
    let modality: ExaminationType | null = null
    if (!isRasterFile(file)) {
      try {
        const bytes = new Uint8Array(await file.slice(0, 2 * 1024 * 1024).arrayBuffer())
        const dataset = dicomParser.parseDicom(bytes, { untilTag: 'x00080061' })
        modality = dicomModalityMap[dataset.string('x00080060')?.trim().toUpperCase() ?? ''] ?? null
      } catch { /* Files without readable metadata require a manual choice. */ }
    }
    modality ??= modalityFromName(file.name)
    if (modality) detected.add(modality)
  }
  if (detected.size > 1) throw new Error('Mixed imaging types. Import CT, MRI, and X-Ray as separate studies.')
  return detected.values().next().value ?? null
}

export function viewerModeForModality(modality: ExaminationType) {
  return modality === 'X-Ray' ? 'projection' : 'multiplanar'
}
