import type { Examination } from '@/types'

const DATABASE_NAME = 'pulmolink-preview-studies-v4'
const STORE_NAME = 'studies'

export interface LocalUploadedStudy {
  examination: Examination
  files: File[]
  importedAt: string
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: 'examination.id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveLocalUpload(study: LocalUploadedStudy): Promise<void> {
  const database = await openDatabase()
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite')
      transaction.objectStore(STORE_NAME).put(study)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
  } finally {
    database.close()
  }
}

export async function getLocalUploads(patientId?: string): Promise<LocalUploadedStudy[]> {
  const database = await openDatabase()
  try {
    const studies = await new Promise<LocalUploadedStudy[]>((resolve, reject) => {
      const request = database.transaction(STORE_NAME).objectStore(STORE_NAME).getAll()
      request.onsuccess = () => resolve(request.result as LocalUploadedStudy[])
      request.onerror = () => reject(request.error)
    })
    return patientId
      ? studies.filter(study => study.examination.patientId === patientId)
      : studies
  } finally {
    database.close()
  }
}

export async function getLocalUploadFiles(examinationId: string): Promise<File[]> {
  const database = await openDatabase()
  try {
    return await new Promise<File[]>((resolve, reject) => {
      const request = database.transaction(STORE_NAME).objectStore(STORE_NAME).get(examinationId)
      request.onsuccess = () => resolve((request.result as LocalUploadedStudy | undefined)?.files ?? [])
      request.onerror = () => reject(request.error)
    })
  } finally {
    database.close()
  }
}

export function isLocalUpload(examination?: Pick<Examination, 'id' | 'source'> | null) {
  return examination?.source === 'local-upload' || examination?.id.startsWith('LOCAL-STUDY-') || false
}
