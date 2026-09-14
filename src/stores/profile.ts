import { ref } from 'vue'
import { defineStore } from 'pinia'
import { ApiError, api, readSession, token } from '@/api/client'
import { localPreview } from '@/utils/runtime'

export interface ProfileFile { id: string; name: string; size_bytes: number; media_type: string; data_url?: string }
export interface Profile {
  username: string; role: string; display_name: string; title?: string; department?: string
  phone?: string; email?: string; bio?: string; avatar_url?: string; files: ProfileFile[]
}
type ProfileDraft = Pick<Profile, 'display_name' | 'title' | 'department' | 'phone' | 'email' | 'bio'>
type SessionIdentity = { id?: string; username?: string; name?: string; role?: 'doctor' | 'patient' }

const PREVIEW_PROFILE_PREFIX = 'pulmolink-preview-profile-v2:'

function currentIdentity(): SessionIdentity {
  try { return JSON.parse(readSession() || '{}') as SessionIdentity }
  catch { return {} }
}

function identityKey(identity = currentIdentity()) {
  return `${identity.role || 'unknown'}:${identity.id || 'anonymous'}`
}

function defaultPreviewProfile(identity = currentIdentity()): Profile {
  const doctor = identity.role === 'doctor'
  return {
    username: identity.username || identity.id || (doctor ? 'demo_doctor' : 'demo_patient'),
    role: doctor ? 'doctor' : 'patient',
    display_name: identity.name || (doctor ? 'Doctor' : 'Patient'),
    title: doctor ? 'Radiologist' : 'Patient',
    department: doctor ? 'Thoracic Imaging' : '',
    phone: '', email: '', bio: doctor ? 'Local synthetic preview profile.' : 'Local synthetic patient profile.', files: [],
  }
}

function dataUrl(file: Blob, onProgress?: (percent: number) => void) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onprogress = event => onProgress?.(event.lengthComputable ? Math.round(event.loaded / event.total * 100) : 0)
    reader.onerror = () => reject(reader.error || new Error('读取文件失败'))
    reader.onload = () => { onProgress?.(100); resolve(String(reader.result || '')) }
    reader.readAsDataURL(file)
  })
}

function uploadWithProgress<T>(path: string, file: Blob, filename: string, onProgress?: (percent: number) => void) {
  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const form = new FormData()
    form.append('file', file, filename)
    xhr.open('POST', '/api/v1' + path)
    xhr.timeout = 60_000
    const accessToken = token()
    if (accessToken) xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken)
    xhr.upload.onprogress = event => onProgress?.(event.lengthComputable ? Math.round(event.loaded / event.total * 100) : 0)
    xhr.onload = () => {
      let payload: { data?: T; code?: number; message?: string } = {}
      try { payload = JSON.parse(xhr.responseText || '{}') } catch { /* status handles invalid JSON */ }
      if (xhr.status >= 200 && xhr.status < 300 && payload.data) { onProgress?.(100); resolve(payload.data); return }
      reject(new ApiError(xhr.status, payload.code || 0, payload.message || '上传失败', { retryable: xhr.status === 0 || xhr.status >= 500 }))
    }
    xhr.onerror = () => reject(new ApiError(0, 0, '上传连接中断，请重试。', { retryable: true }))
    xhr.ontimeout = () => reject(new ApiError(0, 40800, '上传超时，请重试。', { retryable: true }))
    xhr.send(form)
  })
}

export const useProfileStore = defineStore('profile', () => {
  const data = ref<Profile | null>(null)
  let generation = 0
  let loadedIdentity = ''
  function reset() { generation++; loadedIdentity = ''; data.value = null }
  async function load() {
    const current = ++generation
    const identity = currentIdentity()
    const key = identityKey(identity)
    loadedIdentity = key
    if (localPreview) {
      const fallback = defaultPreviewProfile(identity)
      try {
        const saved = JSON.parse(localStorage.getItem(PREVIEW_PROFILE_PREFIX + key) || '{}')
        if (current === generation && loadedIdentity === key) data.value = { ...fallback, ...saved, files: saved.files || [] }
      }
      catch { if (current === generation && loadedIdentity === key) data.value = fallback }
      return
    }
    const result = await api<Profile>('/auth/profile')
    if (current === generation && loadedIdentity === key) data.value = result
  }
  async function save(draft: ProfileDraft) {
    const identity = currentIdentity()
    const key = identityKey(identity)
    if (localPreview) {
      data.value = { ...(data.value || defaultPreviewProfile(identity)), ...draft }
      localStorage.setItem(PREVIEW_PROFILE_PREFIX + key, JSON.stringify(data.value))
      return
    }
    await api('/auth/profile', { method: 'PATCH', body: JSON.stringify(draft) })
    await load()
  }
  function persistPreview() {
    const key = identityKey()
    if (data.value) localStorage.setItem(PREVIEW_PROFILE_PREFIX + key, JSON.stringify(data.value))
  }
  async function saveAvatar(file: Blob, onProgress?: (percent: number) => void) {
    if (localPreview) {
      if (!data.value) data.value = defaultPreviewProfile()
      data.value.avatar_url = await dataUrl(file, onProgress)
      persistPreview()
      return
    }
    data.value = await uploadWithProgress<Profile>('/auth/profile/avatar', file, 'avatar.jpg', onProgress)
  }
  async function removeAvatar() {
    if (localPreview) {
      if (data.value) delete data.value.avatar_url
      persistPreview()
      return
    }
    data.value = await api('/auth/profile/avatar', { method: 'DELETE' })
  }
  async function uploadFile(file: File, onProgress?: (percent: number) => void) {
    if (localPreview) {
      if (!data.value) data.value = defaultPreviewProfile()
      if (data.value.files.length >= 20) throw new Error('最多保存 20 份个人附件。')
      const item: ProfileFile = {
        id: `local-${Date.now()}`,
        name: file.name,
        size_bytes: file.size,
        media_type: file.type || 'application/octet-stream',
        data_url: await dataUrl(file, onProgress),
      }
      data.value.files.unshift(item)
      persistPreview()
      return item
    }
    const item = await uploadWithProgress<ProfileFile>('/auth/profile/files', file, file.name, onProgress)
    await load()
    return item
  }
  async function removeFile(id: string) {
    if (localPreview) {
      if (data.value) data.value.files = data.value.files.filter(file => file.id !== id)
      persistPreview()
      return
    }
    await api('/auth/profile/files/' + id, { method: 'DELETE' })
    await load()
  }
  return { data, load, save, saveAvatar, removeAvatar, uploadFile, removeFile, reset }
})
