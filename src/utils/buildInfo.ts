export const buildId = typeof __PULMOLINK_BUILD_ID__ !== 'undefined'
  ? __PULMOLINK_BUILD_ID__
  : 'development'

export const buildChannel = import.meta.env.MODE
