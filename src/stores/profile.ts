import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/api/client'
const localPreview = import.meta.env.VITE_LOCAL_PREVIEW === 'true'
export interface ProfileFile { id: string; name: string; size_bytes: number; media_type: string }
export interface Profile {
  username: string; role: string; display_name: string; title?: string; department?: string
  phone?: string; email?: string; bio?: string; avatar_url?: string; files: ProfileFile[]
}
export const useProfileStore = defineStore('profile', () => {
  const data = ref<Profile | null>(null)
  let generation = 0
  function reset() { generation++; data.value = null }
  async function load() {
    const current = generation
    if (localPreview) {
      data.value = { username: 'demo_doctor', role: 'doctor', display_name: 'Dr. Zhang Wei', title: 'Radiologist', department: 'Thoracic Imaging', phone: '', email: '', bio: 'Local synthetic preview profile.', files: [] }
      return
    }
    const result = await api<Profile>('/auth/profile')
    if (current === generation) data.value = result
  }
  return { data, load, reset }
})
