const previewSetting = import.meta.env.VITE_LOCAL_PREVIEW
const isLoopbackHost =
  typeof window !== 'undefined' &&
  (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')

// Local development opens directly into the synthetic doctor workspace.
// Set VITE_LOCAL_PREVIEW=false when testing the real authentication backend.
export const localPreview =
  previewSetting === 'true' || (previewSetting !== 'false' && import.meta.env.DEV && isLoopbackHost)
