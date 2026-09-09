import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { mockDoctor, mockPatients } from '@/data/mockData'
import type { PortalRole, UserSession } from '@/types'

const STORAGE_KEY = 'pulmolink-session'

function readStoredSession(): UserSession | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as UserSession) : null
  } catch {
    return null
  }
}

function persistSession(value: UserSession | null) {
  if (value) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } else {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}

export const useAuthStore = defineStore('auth', () => {
  const session = ref<UserSession | null>(readStoredSession())

  const isAuthenticated = computed(() => session.value !== null)
  const portal = computed<PortalRole | null>(() => session.value?.role ?? null)

  function login(role: PortalRole) {
    if (role === 'doctor') {
      session.value = {
        id: mockDoctor.id,
        name: mockDoctor.name,
        role: 'doctor',
        title: mockDoctor.title,
      }
      persistSession(session.value)
      return
    }

    const patient = mockPatients[0]
    session.value = {
      id: patient.id,
      name: patient.name,
      role: 'patient',
    }
    persistSession(session.value)
  }

  function logout() {
    session.value = null
    persistSession(null)
  }

  return {
    session,
    isAuthenticated,
    portal,
    login,
    logout,
  }
})
