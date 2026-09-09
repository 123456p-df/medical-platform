export function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`pulmolink-v2-${key}`)
    return raw ? JSON.parse(raw) as T : structuredClone(fallback)
  } catch {
    return structuredClone(fallback)
  }
}

export function writeLocal(key: string, value: unknown) {
  localStorage.setItem(`pulmolink-v2-${key}`, JSON.stringify(value))
}
