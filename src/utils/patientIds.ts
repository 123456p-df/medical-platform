export function normalizePatientId(value: unknown): string {
  if (Array.isArray(value)) value = value[0]
  if (typeof value !== 'string' && typeof value !== 'number') return ''
  const normalized = String(value).trim()
  return normalized && normalized !== 'undefined' && normalized !== 'null' ? normalized : ''
}

export function backendPatientId(value: string): number {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new Error('当前患者没有可用于真实后端的数字 ID。')
  }
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed)) throw new Error('患者 ID 超出可支持范围。')
  return parsed
}
