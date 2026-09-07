import type { ExaminationType } from '@/types'

const dicomModalityMap: Record<string, ExaminationType> = {
  CT: 'CT',
  MR: 'MRI',
  MRI: 'MRI',
  XA: 'X-Ray',
  CR: 'X-Ray',
  DX: 'X-Ray',
  RG: 'X-Ray',
}

function modalityFromName(name: string, fallback: ExaminationType): ExaminationType {
  const upper = name.toUpperCase()
  if (/(\b|_|-)(MR|MRI|T1|T2|FLAIR|BRAIN)(\b|_|-)/.test(upper)) return 'MRI'
  if (/(\b|_|-)(CT|LUNG|CHEST)(\b|_|-)/.test(upper)) return 'CT'
  if (/(\b|_|-)(XR|XRAY|X-RAY|CR|DX|CHEST)(\b|_|-)/.test(upper)) return 'X-Ray'
  return fallback
}

function extensionOf(name: string) {
  const lower = name.toLowerCase()
  if (lower.endsWith('.nii.gz')) return '.nii.gz'
  const dot = lower.lastIndexOf('.')
  return dot >= 0 ? lower.slice(dot) : ''
}

async function readDicomModality(file: File): Promise<ExaminationType | null> {
  if (!file.name.toLowerCase().endsWith('.dcm')) return null
  const header = await file.slice(0, 2 * 1024 * 1024).arrayBuffer()
  const bytes = new Uint8Array(header)

  // Scan a small prefix for the Modality tag (0008,0060) using explicit VR little endian.
  const upperBound = Math.min(bytes.length - 10, 1024 * 1024)
  for (let i = 0; i < upperBound; i += 1) {
    if (bytes[i] === 0x08 && bytes[i + 1] === 0x00 && bytes[i + 2] === 0x60 && bytes[i + 3] === 0x00) {
      const vr = String.fromCharCode(bytes[i + 4], bytes[i + 5])
      const lengthOffset = i + 6
      let length = 0
      if (vr === 'CS' || vr === 'SH' || vr === 'LO' || vr === 'UI') {
        length = bytes[lengthOffset] + (bytes[lengthOffset + 1] << 8)
      } else {
        length = (bytes[lengthOffset] << 8) + bytes[lengthOffset + 1]
      }
      if (length > 0 && length <= 32 && i + lengthOffset + 2 + length <= bytes.length) {
        const valueStart = lengthOffset + 2
        const value = String.fromCharCode(...bytes.slice(valueStart, valueStart + length)).trim()
        return dicomModalityMap[value.toUpperCase()] ?? null
      }
    }
  }
  return null
}

export async function detectModalityFromFiles(files: File[]): Promise<ExaminationType> {
  const firstDicom = files.find((file) => file.name.toLowerCase().endsWith('.dcm'))
  if (firstDicom) {
    const dicomModality = await readDicomModality(firstDicom)
    if (dicomModality) return dicomModality
  }

  for (const file of files) {
    const extension = extensionOf(file.name)
    if (extension === '.dcm') continue
    if (extension === '.nii' || extension === '.nii.gz' || extension === '.nrrd') {
      return modalityFromName(file.name, 'CT')
    }
    if (file.type.startsWith('image/')) {
      return 'X-Ray'
    }
    if (extension === '.zip') {
      return modalityFromName(file.name, 'CT')
    }
  }

  const firstName = files[0]?.name ?? ''
  return modalityFromName(firstName, 'CT')
}

export function viewerModeForModality(modality: ExaminationType) {
  if (modality === 'X-Ray') return 'projection'
  return 'multiplanar'
}
