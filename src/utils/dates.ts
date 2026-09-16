export function localCalendarDate(value = new Date()): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isValidCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

export function normalizeDicomDate(value?: string): string {
  if (!value || !/^\d{8}$/.test(value)) return ''
  const normalized = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
  return isValidCalendarDate(normalized) ? normalized : ''
}

export function dateFromFilename(name: string, fallback = localCalendarDate()): string {
  const match = name.match(/(20\d{2})[-_]?([01]\d)[-_]?([0-3]\d)/)
  if (!match) return fallback
  const value = `${match[1]}-${match[2]}-${match[3]}`
  return isValidCalendarDate(value) && value <= fallback ? value : fallback
}
