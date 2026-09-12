import { t } from '../i18n/index.ts'

export class ApiError extends Error {
  status: number
  code: number
  constructor(status: number, code: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

const codeMessages: Record<number, string> = {
  40101: 'Your session has expired. Please sign in again.',
  40102: 'Your session has expired. Please sign in again.',
  40103: 'Invalid username or password.',
  40301: 'You do not have access to this patient.',
  40901: 'This username is already registered.',
  50301: 'The segmentation model is not configured.',
  50302: 'The AI service is not configured.',
  50303: 'The database is unavailable. Please try again after the service recovers.',
  50304: 'The lung nodule detection model is not configured.',
  40005: 'The segmentation model does not support this imaging type.',
  42201: 'Check the input format and required fields.',
  40008: 'Lung nodule detection only supports CT images.',
  40009: 'Lung nodule detection requires an image tagged as lung.',
  40010: 'The examination date cannot be in the future.',
  40903: 'Lung nodule detection is already queued or running for this image.',
  50001: 'The server could not complete the request. Please try again.',
}

export function responseError(status: number, payload?: unknown): ApiError {
  const body = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
  const code = typeof body.code === 'number' ? body.code : 0
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  const fallback: Record<number, string> = {
    401: 'Your session has expired. Please sign in again.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    413: 'The uploaded file is too large.',
    422: 'Check the input format and required fields.',
    429: 'Too many requests. Please try again shortly.',
  }
  // Vite/nginx may return an empty or HTML 5xx response when the API is down.
  // Do not collapse that into an unhelpful "Request failed" message.
  const genericMessage = /^(request failed|internal server error|success)[.!。]?$/i.test(message)
  const detail = codeMessages[code] || (message && !genericMessage ? message : '') || fallback[status] ||
    (status === 0 || status >= 500
      ? 'The backend is unavailable. Please start the service and retry.'
      : 'The request failed. Please try again.')
  return new ApiError(status, code, t(detail))
}
