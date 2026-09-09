import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/api/client'
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
    const result = await api<Profile>('/auth/profile')
    if (current === generation) data.value = result
  }
  return { data, load, reset }
})
