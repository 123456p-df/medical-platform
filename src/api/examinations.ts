import { ApiError, api, collection, token } from './client'
import { mapImage, type ImageDTO } from './mappers'

export interface UploadProgress {
  phase: 'uploading' | 'processing'
  loaded: number
  total: number
  percent: number
}

export const examinationApi = {
  async getExaminationsByPatient(id: string) { return (await collection<ImageDTO>('/patients/' + id + '/medical-images')).map(mapImage) },
  async getExaminationById(id: string) { return mapImage(await api<ImageDTO>('/medical-images/' + id)) },
  async uploadStudy(
    patientId: string,
    file: File,
    organId: string,
    imageType: 'CT' | 'MRI',
    studyDate: string,
    options: { signal?: AbortSignal; onProgress?: (progress: UploadProgress) => void } = {},
  ) {
    const form = new FormData()
    form.append('file', file)
    form.append('organ_id', organId)
    form.append('image_type', imageType)
    if (studyDate) form.append('study_date', studyDate)
    if (!options.signal && !options.onProgress) {
      return mapImage(await api<ImageDTO>('/patients/' + patientId + '/medical-images', {
        method: 'POST',
        body: form,
      }))
    }

    return new Promise<ReturnType<typeof mapImage>>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const abort = () => xhr.abort()
      xhr.open('POST', '/api/v1/patients/' + patientId + '/medical-images')
      xhr.timeout = 5 * 60_000
      const accessToken = token()
      if (accessToken) xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken)
      xhr.upload.onprogress = event => {
        const total = event.lengthComputable ? event.total : file.size
        const percent = total > 0 ? Math.min(100, Math.round(event.loaded / total * 100)) : 0
        options.onProgress?.({ phase: 'uploading', loaded: event.loaded, total, percent })
      }
      xhr.upload.onload = () => options.onProgress?.({ phase: 'processing', loaded: file.size, total: file.size, percent: 100 })
      xhr.onload = () => {
        options.signal?.removeEventListener('abort', abort)
        let payload: { data?: ImageDTO; code?: number; message?: string } = {}
        try { payload = JSON.parse(xhr.responseText || '{}') }
        catch { /* handled by status below */ }
        if (xhr.status >= 200 && xhr.status < 300 && payload.data) {
          resolve(mapImage(payload.data))
          return
        }
        reject(new ApiError(xhr.status, payload.code || 0, payload.message || '上传失败', { retryable: xhr.status === 0 || xhr.status >= 500 }))
      }
      xhr.onerror = () => reject(new ApiError(0, 0, '上传连接中断，请重试。', { retryable: true }))
      xhr.ontimeout = () => reject(new ApiError(0, 40800, '上传超时，请重试。', { retryable: true }))
      xhr.onabort = () => reject(new DOMException('上传已取消', 'AbortError'))
      options.signal?.addEventListener('abort', abort, { once: true })
      if (options.signal?.aborted) abort()
      else xhr.send(form)
    })
  },
}
