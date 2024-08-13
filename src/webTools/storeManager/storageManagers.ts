interface StoreManager<V = unknown> {
  set: (key: string, body: V) => Promise<void>
  get: (key: string) => Promise<V | undefined>
  has: (key: string) => Promise<boolean>
  delete: (key: string) => Promise<void>
}

export function createLocalStorageStoreManager<T = unknown>(): StoreManager<T> {
  async function set(key: string, body: unknown) {
    globalThis.localStorage.setItem(key, JSON.stringify(body))
  }
  async function get(key: string) {
    const content = globalThis.localStorage.getItem(key)
    if (content) {
      return JSON.parse(globalThis.localStorage.getItem(key)!)
    }
    return undefined
  }
  async function deleteItem(key: string) {
    globalThis.localStorage.removeItem(key)
  }
  async function has(key: string) {
    return globalThis.localStorage.getItem(key) != null
  }
  return {
    set,
    get,
    delete: deleteItem,
    has,
  }
}

export function createSessionStorageStoreManager<T = unknown>(): StoreManager<T> {
  async function set(key: string, body: unknown) {
    globalThis.sessionStorage.setItem(key, JSON.stringify(body))
  }
  async function get(key: string) {
    const content = globalThis.sessionStorage.getItem(key)
    if (content) {
      return JSON.parse(globalThis.sessionStorage.getItem(key)!)
    }
    return undefined
  }
  async function deleteItem(key: string) {
    globalThis.sessionStorage.removeItem(key)
  }
  async function has(key: string) {
    return globalThis.sessionStorage.getItem(key) != null
  }
  return {
    set,
    get,
    delete: deleteItem,
    has,
  }
}

type IDBStoreEntry = {
  key: IDBValidKey
  value: any
}

export type IDBStoreManager<V> = {
  set: (key: IDBValidKey, body: V) => Promise<void>
  get: (key: IDBValidKey | IDBKeyRange) => Promise<V | undefined>
  getAll: () => Promise<IDBStoreEntry[] | undefined>
  has: (key: IDBValidKey | IDBKeyRange) => Promise<boolean>
  delete: (key: IDBValidKey | IDBKeyRange) => Promise<void>
  forEach: (callback: (value: V, key: IDBValidKey) => void) => Promise<void>
}

export function createIDBStoreManager<T = unknown>({
  dbName,
  storeName = "default",
  version = 1,
  onStoreLoaded,
}: {
  dbName: string
  storeName?: string
  version?: number
  onStoreLoaded?: (payloads: { store: Promise<IDBObjectStore> } & IDBStoreManager<T>) => void
}): IDBStoreManager<T> {
  const dbOpenRequest = globalThis.indexedDB.open(dbName, version)

  const { promise: db, resolve, reject } = Promise.withResolvers<IDBDatabase>()

  dbOpenRequest.onerror = (event) => {
    reject((event.target as IDBOpenDBRequest).error)
  }
  dbOpenRequest.onblocked = (event) => {
    reject((event.target as IDBOpenDBRequest).error)
  }
  dbOpenRequest.onupgradeneeded = (event) => {
    const _db = (event.target as IDBOpenDBRequest).result
    resolve(_db)
    _db.createObjectStore(storeName)
  }
  dbOpenRequest.onsuccess = (event) => {
    const _db = (event.target as IDBOpenDBRequest).result
    resolve(_db)
  }

  async function forEach(callback: (value: T, key: IDBValidKey) => void) {
    db.then((db) => {
      const transaction = db.transaction(storeName, "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.openCursor()
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue
        if (cursor) {
          callback(cursor.value, cursor.key)
          cursor.continue()
        }
      }
      request.onerror = (event) => {
        console.error((event.target as IDBRequest).error)
      }
    }).catch((e) => {
      console.error(e)
    })
  }

  //init actions
  onStoreLoaded?.({
    get store() {
      return db.then((db) => db.transaction(storeName, "readwrite").objectStore(storeName))
    },
    set,
    get,
    getAll,
    has,
    delete: deleteItem,
    forEach,
  })

  async function set(key: IDBValidKey, body: T) {
    db.then((db) => {
      const transaction = db.transaction(storeName, "readwrite")
      transaction.objectStore(storeName).put(body, key)
    }).catch((e) => {
      console.error(e)
    })
  }
  async function get(key: IDBValidKey | IDBKeyRange) {
    return db
      .then((db) => {
        const { promise: result, resolve, reject } = Promise.withResolvers<T>()
        const request = db.transaction(storeName, "readonly").objectStore(storeName).get(key)
        request.addEventListener("success", (event) => {
          resolve((event.target as IDBRequest).result)
        })
        request.addEventListener("error", (event) => {
          reject((event.target as IDBRequest).error)
        })
        return result
      })
      .catch((e) => {
        console.error(e)
        return undefined
      })
  }

  async function getAll() {
    return db
      .then((db) => {
        const { promise: result, resolve, reject } = Promise.withResolvers<IDBStoreEntry[]>()
        const objectStore = db.transaction(storeName, "readonly").objectStore(storeName)
        const cursorRequest = objectStore.openCursor()

        const allEntries: IDBStoreEntry[] = []

        cursorRequest.addEventListener("success", (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
          if (cursor) {
            allEntries.push({ key: cursor.key, value: cursor.value })
            cursor.continue()
          } else {
            resolve(allEntries)
          }
        })

        cursorRequest.addEventListener("error", (event) => {
          reject((event.target as IDBRequest).error)
        })

        return result
      })
      .catch((e) => {
        console.error(e)
        return []
      })
  }
  async function deleteItem(key: IDBValidKey | IDBKeyRange) {
    db.then((db) => {
      const transaction = db.transaction(storeName, "readwrite")
      transaction.objectStore(storeName).delete(key)
    }).catch((e) => {
      console.error(e)
      return undefined
    })
  }
  async function has(key: IDBValidKey | IDBKeyRange) {
    const v = await get(key)
    return v != null
  }
  return {
    forEach,
    set,
    get,
    getAll,
    delete: deleteItem,
    has,
  }
}
export function createMemoryStoreManager<T>(): StoreManager<T> {
  const store = new Map<string, unknown>()
  async function set(key: string, body: unknown) {
    store.set(key, body)
  }
  async function get(key: string) {
    return store.get(key) as T | undefined
  }
  async function deleteItem(key: string) {
    store.delete(key)
  }
  async function has(key: string) {
    return store.has(key)
  }
  return {
    set,
    get,
    delete: deleteItem,
    has,
  }
}
