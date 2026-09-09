import type { Examination } from '@/types'

export interface UploadedStudy { examination: Examination; files: File[] }

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('pulmolink-studies-v2', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('studies', { keyPath: 'examination.id' })
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveUpload(study: UploadedStudy): Promise<void> {
  const db = await openDatabase()
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('studies', 'readwrite')
      transaction.objectStore('studies').put(study)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })
  } finally { db.close() }
}

export async function getUploads(): Promise<UploadedStudy[]> {
  const db = await openDatabase()
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction('studies').objectStore('studies').getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } finally { db.close() }
}

export async function getUploadedFiles(examinationId: string): Promise<File[]> {
  return (await getUploads()).find((study) => study.examination.id === examinationId)?.files ?? []
}
