import type { UserSession } from '@/types'

export type DemoAccountKey = 'admin' | 'doctor' | 'patientFull' | 'patientTest'

export interface DemoAccount {
  username: 'admin' | 'demo_doctor' | 'demo_patient_full' | 'demo_patient_test'
  password: '123456'
  label: string
  description: string
  session: UserSession
}

export const DEMO_PASSWORD = '123456' as const

export const DEMO_ACCOUNTS: Record<DemoAccountKey, DemoAccount> = {
  admin: {
    username: 'admin',
    password: DEMO_PASSWORD,
    label: 'Administrator',
    description: 'Manage all demo patients and system workflows.',
    session: {
      id: 'admin', username: 'admin', name: 'Administrator', role: 'doctor', accessToken: 'local-preview',
    },
  },
  doctor: {
    username: 'demo_doctor',
    password: DEMO_PASSWORD,
    label: 'Doctor Portal',
    description: 'Review imaging, AI findings, and patient reports.',
    session: {
      id: 'demo_doctor', username: 'demo_doctor', name: 'Demo Doctor', role: 'doctor', accessToken: 'local-preview',
    },
  },
  patientFull: {
    username: 'demo_patient_full',
    password: DEMO_PASSWORD,
    label: 'Complete Patient',
    description: 'View a complete patient record with examinations and signed reports.',
    session: {
      id: 'P20260021', username: 'demo_patient_full', name: 'Complete Demo Patient', role: 'patient', accessToken: 'local-preview',
    },
  },
  patientTest: {
    username: 'demo_patient_test',
    password: DEMO_PASSWORD,
    label: 'Report Test Patient',
    description: 'Verify that a newly signed doctor report is visible to its patient.',
    session: {
      id: 'P20260037', username: 'demo_patient_test', name: 'Report Test Patient', role: 'patient', accessToken: 'local-preview',
    },
  },
}

export const DEMO_ACCOUNTS_BY_USERNAME = Object.fromEntries(
  Object.values(DEMO_ACCOUNTS).map(account => [account.username, account]),
) as Record<string, DemoAccount>
