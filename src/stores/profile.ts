import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/api/client'
import { localPreview } from '@/utils/runtime'
export interface ProfileFile { id: string; name: string; size_bytes: number; media_type: string }
export interface Profile {
  username: string; role: string; display_name: string; title?: string; department?: string
  phone?: string; email?: string; bio?: string; avatar_url?: string; files: ProfileFile[]
}
type ProfileDraft = Pick<Profile, 'display_name' | 'title' | 'department' | 'phone' | 'email' | 'bio'>
const PREVIEW_PROFILE_KEY = 'pulmolink-preview-profile'
const defaultPreviewProfile: Profile = { username: 'demo_doctor', role: 'doctor', display_name: 'Dr. Zhang Wei', title: 'Radiologist', department: 'Thoracic Imaging', phone: '', email: '', bio: 'Local synthetic preview profile.', files: [] }
export const useProfileStore = defineStore('profile', () => {
  const data = ref<Profile | null>(null)
  let generation = 0
  function reset() { generation++; data.value = null }
  async function load() {
    const current = generation
    if (localPreview) {
      try { data.value = { ...defaultPreviewProfile, ...JSON.parse(localStorage.getItem(PREVIEW_PROFILE_KEY) || '{}') } }
      catch { data.value = { ...defaultPreviewProfile } }
      return
    }
    const result = await api<Profile>('/auth/profile')
    if (current === generation) data.value = result
  }
  async function save(draft: ProfileDraft) {
    if (localPreview) {
      data.value = { ...(data.value || defaultPreviewProfile), ...draft }
      localStorage.setItem(PREVIEW_PROFILE_KEY, JSON.stringify(data.value))
      return
    }
    await api('/auth/profile', { method: 'PATCH', body: JSON.stringify(draft) })
    await load()
  }
  return { data, load, save, reset }
})
