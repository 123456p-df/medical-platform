import type { PortalRole } from '@/types'

export function stableWorkspaceTabId(path: string, portal: PortalRole, scope: string) {
  const url = new URL(path, 'http://pulmolink.local')
  const segments = url.pathname.split('/').filter(Boolean)

  if (portal === 'doctor') {
    if (segments[0] !== 'doctor') return `doctor:${scope}:unknown:${url.pathname}`
    if (segments[1] === 'dashboard' || (segments[1] === 'patients' && segments.length === 2)) {
      return `doctor:${scope}:workspace`
    }
    if (segments[1] === 'archived') return `doctor:${scope}:archive`
    if (segments[1] === 'profile') return `doctor:${scope}:profile`
    if (segments[1] === 'patients' && segments[2]) {
      const patientId = decodeURIComponent(segments[2])
      const module = segments[3] === '3d' ? 'imaging' : segments[3] || 'overview'
      return `doctor:${scope}:patient:${patientId}:${module}`
    }
    return `doctor:${scope}:${url.pathname}`
  }

  if (segments[0] !== 'patient') return `patient:${scope}:unknown:${url.pathname}`
  if (segments[1] === 'profile') return `patient:${scope}:profile`
  if (segments[1] === 'onboarding') return `patient:${scope}:onboarding`
  if (segments[1] === 'examinations' && segments[2]) {
    return `patient:${scope}:examination:${decodeURIComponent(segments[2])}`
  }
  if (segments[1]) return `patient:${scope}:${segments[1]}`
  return `patient:${scope}:health`
}
