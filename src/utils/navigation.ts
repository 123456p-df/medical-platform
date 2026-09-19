import type { RouteLocationNormalizedLoaded } from 'vue-router'

export type NavigationKey =
  | 'patients'
  | 'archive'
  | 'overview'
  | 'imaging'
  | 'ai'
  | 'report'
  | 'examinations'
  | 'reports'
  | 'body'
  | 'assistant'

const routeNavigationKeys: Record<string, NavigationKey> = {
  'doctor-dashboard': 'patients',
  'doctor-archived': 'archive',
  'doctor-patients': 'patients',
  'doctor-patient-overview': 'overview',
  'doctor-patient-imaging': 'imaging',
  'doctor-patient-study-viewer': 'imaging',
  'doctor-patient-3d': 'imaging',
  'doctor-patient-ai': 'ai',
  'doctor-patient-report': 'report',
  'study-viewer': 'imaging',
  'patient-dashboard': 'overview',
  'patient-examinations': 'examinations',
  'patient-examination-detail': 'examinations',
  'patient-reports': 'reports',
  'patient-body': 'body',
  'patient-ai': 'assistant',
}

export function navigationKeyFromRoute(
  route: Pick<RouteLocationNormalizedLoaded, 'name'>,
): NavigationKey | null {
  if (!route.name) return null
  return routeNavigationKeys[String(route.name)] ?? null
}
