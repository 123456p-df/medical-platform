const previewSetting = import.meta.env.VITE_LOCAL_PREVIEW
// Browser-only synthetic data is an explicit test mode. Development, preview,
// and production otherwise share the same backend identity and record system.
export const localPreview = previewSetting === 'true'
