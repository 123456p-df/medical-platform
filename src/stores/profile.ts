import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api, SESSION_KEY } from '@/api/client'
import { localPreview } from '@/utils/runtime'
import type { UserSession } from '@/types'
export interface ProfileFile { id: string; name: string; size_bytes: number; media_type: string }
export interface Profile {
  username: string; role: string; display_name: string; title?: string; department?: string
  phone?: string; email?: string; bio?: string; avatar_url?: string; files: ProfileFile[]
}
type ProfileDraft = Pick<Profile, 'display_name' | 'title' | 'department' | 'phone' | 'email' | 'bio'>
const LEGACY_PREVIEW_PROFILE_KEY = 'pulmolink-preview-profile'
const PREVIEW_PROFILE_PREFIX = 'pulmolink-preview-profile-v2:'

function previewSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY) || 'null') as UserSession | null
  } catch { return null }
}

function defaultPreviewProfile(): Profile {
  const session = previewSession()
  return {
    username: session?.username || '',
    role: session?.role || '',
    display_name: session?.name || session?.username || '',
    title: session?.role === 'doctor' ? 'Medical staff' : 'Patient',
    department: '', phone: '', email: '', bio: '', files: [],
  }
}

function previewProfileKey(username: string) {
  return PREVIEW_PROFILE_PREFIX + username
}
export const useProfileStore = defineStore('profile', () => {
  const data = ref<Profile | null>(null)
  let generation = 0
  function reset() { generation++; data.value = null }
  async function load() {
    const current = generation
    if (localPreview) {
      const defaults = defaultPreviewProfile()
      try {
        localStorage.removeItem(LEGACY_PREVIEW_PROFILE_KEY)
        data.value = { ...defaults, ...JSON.parse(localStorage.getItem(previewProfileKey(defaults.username)) || '{}') }
      }
      catch { data.value = { ...defaults } }
      return
    }
    const result = await api<Profile>('/auth/profile')
    if (current === generation) data.value = result
  }
  async function save(draft: ProfileDraft) {
    if (localPreview) {
      data.value = { ...(data.value || defaultPreviewProfile()), ...draft }
      localStorage.setItem(previewProfileKey(data.value.username), JSON.stringify(data.value))
      return
    }
    await api('/auth/profile', { method: 'PATCH', body: JSON.stringify(draft) })
    await load()
  }
  return { data, load, save, reset }
})
