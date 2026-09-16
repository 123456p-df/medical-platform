import type { Examination } from '@/types'

const DATABASE_NAME = 'pulmolink-preview-studies-v4'
const DATABASE_VERSION = 2
const LEGACY_STORE = 'studies'
const METADATA_STORE = 'study-metadata'
const FILE_STORE = 'study-files'

export interface LocalUploadedStudyInput {
  examination: Examination
  files: File[]
  importedAt: string
}

export interface LocalUploadedStudyMetadata {
  examination: Examination
  importedAt: string
  patientId: string
  fileCount: number
  totalBytes: number
}

interface StoredStudyFile {
  id: string
  examinationId: string
  index: number
  file: File
}

function databaseError(error: DOMException | null) {
  if (error?.name === 'QuotaExceededError') return new Error('浏览器本地空间不足，无法保存这组影像。')
  return new Error(error?.message || '无法访问浏览器本地影像库。')
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onblocked = () => reject(new Error('另一个页面正在使用旧版本影像库，请关闭其他 PulmoLink 页面后重试。'))
    request.onupgradeneeded = event => {
      const database = request.result
      const transaction = request.transaction
      if (!transaction) return
      const metadata = database.objectStoreNames.contains(METADATA_STORE)
        ? transaction.objectStore(METADATA_STORE)
        : database.createObjectStore(METADATA_STORE, { keyPath: 'examination.id' })
      if (!metadata.indexNames.contains('patientId')) metadata.createIndex('patientId', 'patientId')
      const files = database.objectStoreNames.contains(FILE_STORE)
        ? transaction.objectStore(FILE_STORE)
        : database.createObjectStore(FILE_STORE, { keyPath: 'id' })
      if (!files.indexNames.contains('examinationId')) files.createIndex('examinationId', 'examinationId')

      if ((event.oldVersion || 0) < 2 && database.objectStoreNames.contains(LEGACY_STORE)) {
        const cursorRequest = transaction.objectStore(LEGACY_STORE).openCursor()
        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result
          if (!cursor) return
          const legacy = cursor.value as LocalUploadedStudyInput
          const examinationId = legacy.examination.id
          metadata.put({
            examination: legacy.examination,
            importedAt: legacy.importedAt,
            patientId: legacy.examination.patientId,
            fileCount: legacy.files.length,
            totalBytes: legacy.files.reduce((sum, file) => sum + file.size, 0),
          } satisfies LocalUploadedStudyMetadata)
          legacy.files.forEach((file, index) => files.put({
            id: `${examinationId}::${index}`,
            examinationId,
            index,
            file,
          } satisfies StoredStudyFile))
          cursor.continue()
        }
      }
    }
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close()
      resolve(request.result)
    }
    request.onerror = () => reject(databaseError(request.error))
  })
}

export async function estimateLocalStorage() {
  const estimate = await navigator.storage?.estimate?.()
  return { usage: estimate?.usage || 0, quota: estimate?.quota || 0 }
}

export async function saveLocalUpload(study: LocalUploadedStudyInput): Promise<void> {
  const database = await openDatabase()
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction([METADATA_STORE, FILE_STORE], 'readwrite')
      transaction.objectStore(METADATA_STORE).put({
        examination: study.examination,
        importedAt: study.importedAt,
        patientId: study.examination.patientId,
        fileCount: study.files.length,
        totalBytes: study.files.reduce((sum, file) => sum + file.size, 0),
      } satisfies LocalUploadedStudyMetadata)
      study.files.forEach((file, index) => transaction.objectStore(FILE_STORE).put({
        id: `${study.examination.id}::${index}`,
        examinationId: study.examination.id,
        index,
        file,
      } satisfies StoredStudyFile))
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(databaseError(transaction.error))
      transaction.onabort = () => reject(databaseError(transaction.error))
    })
  } finally {
    database.close()
  }
}

export async function getLocalUploads(patientId?: string): Promise<LocalUploadedStudyMetadata[]> {
  const database = await openDatabase()
  try {
    return await new Promise<LocalUploadedStudyMetadata[]>((resolve, reject) => {
      const store = database.transaction(METADATA_STORE).objectStore(METADATA_STORE)
      const request = patientId
        ? store.index('patientId').getAll(IDBKeyRange.only(patientId))
        : store.getAll()
      request.onsuccess = () => resolve(request.result as LocalUploadedStudyMetadata[])
      request.onerror = () => reject(databaseError(request.error))
    })
  } finally {
    database.close()
  }
}

export async function getLocalUploadFiles(examinationId: string): Promise<File[]> {
  const database = await openDatabase()
  try {
    const records = await new Promise<StoredStudyFile[]>((resolve, reject) => {
      const request = database.transaction(FILE_STORE).objectStore(FILE_STORE)
        .index('examinationId').getAll(IDBKeyRange.only(examinationId))
      request.onsuccess = () => resolve(request.result as StoredStudyFile[])
      request.onerror = () => reject(databaseError(request.error))
    })
    return records.sort((left, right) => left.index - right.index).map(record => record.file)
  } finally {
    database.close()
  }
}

export function isLocalUpload(examination?: Pick<Examination, 'id' | 'source'> | null) {
  return examination?.source === 'local-upload' || examination?.id.startsWith('LOCAL-STUDY-') || false
}
