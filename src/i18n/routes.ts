export const routeTitleKeys: Record<string, string> = {
  'doctor-dashboard': 'Patient Workspace',
  'doctor-patients': 'Patient Workspace',
  'doctor-patient-overview': 'Patient Record',
  'doctor-patient-imaging': 'Medical Imaging',
  'doctor-patient-ai': 'AI Assistant',
  'doctor-patient-report': 'Doctor Report',
  'doctor-patient-3d': 'Digital Human',
  'doctor-patient-study-viewer': '3D / 2D Viewer',
  'patient-dashboard': 'My Health',
  'patient-examinations': 'My Examinations',
  'patient-examination-detail': 'Examination Detail',
  'patient-reports': 'My Reports',
  'patient-body': 'My Body',
  'patient-ai': 'AI Assistant',
}

export function routeTitleKey(name: unknown, path = '') {
  if (path.endsWith('/profile')) return 'Profile'
  return routeTitleKeys[String(name)] || 'PulmoLink'
}
