type PromisifiedRequest<T> = Promise<T>

function requestToPromise<T>(request: IDBRequest<T>): PromisifiedRequest<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

const DB_NAME = 'figsense'
const DB_VERSION = 1
const EMBEDDING_STORE = 'embeddingIndex'
const EMBEDDING_DOCKEY_INDEX = 'docKey'

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(EMBEDDING_STORE)) {
        const store = db.createObjectStore(EMBEDDING_STORE, { keyPath: 'key' })
        store.createIndex(EMBEDDING_DOCKEY_INDEX, 'docKey', { unique: false })
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })

  return dbPromise
}

export type EmbeddingIndexRecord = {
  key: string
  docKey: string
  nodeId: string
  sig: string
  vec: number[]
  updatedAt: number
}

export async function countEmbeddingIndex(docKey: string): Promise<number> {
  const db = await openDb()
  const tx = db.transaction(EMBEDDING_STORE, 'readonly')
  const store = tx.objectStore(EMBEDDING_STORE)
  const index = store.index(EMBEDDING_DOCKEY_INDEX)
  const count = await requestToPromise(index.count(docKey))
  await transactionDone(tx)
  return count
}

export async function listEmbeddingIndex(docKey: string): Promise<EmbeddingIndexRecord[]> {
  const db = await openDb()
  const tx = db.transaction(EMBEDDING_STORE, 'readonly')
  const store = tx.objectStore(EMBEDDING_STORE)
  const index = store.index(EMBEDDING_DOCKEY_INDEX)
  const result = await requestToPromise(index.getAll(docKey))
  await transactionDone(tx)
  return (result ?? []) as EmbeddingIndexRecord[]
}

export async function putEmbeddingIndex(records: EmbeddingIndexRecord[]): Promise<void> {
  if (records.length === 0) return
  const db = await openDb()
  const tx = db.transaction(EMBEDDING_STORE, 'readwrite')
  const store = tx.objectStore(EMBEDDING_STORE)
  for (const record of records) {
    store.put(record)
  }
  await transactionDone(tx)
}

export async function clearEmbeddingIndex(docKey: string): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(EMBEDDING_STORE, 'readwrite')
  const store = tx.objectStore(EMBEDDING_STORE)
  const index = store.index(EMBEDDING_DOCKEY_INDEX)

  await new Promise<void>((resolve, reject) => {
    const cursorReq = index.openKeyCursor(IDBKeyRange.only(docKey))
    cursorReq.onerror = () => reject(cursorReq.error)
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result
      if (!cursor) {
        resolve()
        return
      }
      store.delete(cursor.primaryKey)
      cursor.continue()
    }
  })

  await transactionDone(tx)
}

