import { mapGet, shrinkFn, type MayFn, type MayPromise } from "@edsolater/fnkit"
import { automaticlyOpenIDB } from "./openDB"
import { IDBStoreEntry } from "./utils/idbStoreEntry"
import { getStoreObjectEntries } from "./utils/idbStoreEntry"

export interface IDBStoreManager<V> {
  set(key: IDBValidKey, body: MayFn<MayPromise<V | undefined>, [prev: Promise<V | undefined>]>): Promise<void>
  get(key: IDBValidKey | IDBKeyRange): Promise<V | undefined>
  getAll(): Promise<IDBStoreEntry[] | undefined>
  has(key: IDBValidKey | IDBKeyRange): Promise<boolean>
  delete(key: IDBValidKey | IDBKeyRange): Promise<void>
  forEach(callback: (value: V, key: IDBValidKey) => void): Promise<void>

  version: Promise<number>
  close(): void
}

export type IDBStoreManagerConfiguration<T = any> = {
  dbName: string
  storeName?: string
  /** usually don't need to specify this
   *
   * (MDN doc):
   *
   * [Optional]. The version to open the database with.
   * - If the version is not provided and the database exists, then a connection to the database will be opened without changing its version.
   * - If the version is not provided and the database does not exist, then it will be created with version 1.
   *
   */
  version?: number
  onStoreLoaded?: (
    payloads: {
      store: Promise<IDBObjectStore>
    } & IDBStoreManager<T>,
  ) => void
}

/**
 * create a store manager for indexedDB
 * @param dbName
 * @param storeName
 */
export function createIDBStoreManager<T = unknown>({
  dbName,
  storeName = "default",
  onStoreLoaded,
}: IDBStoreManagerConfiguration<T>): IDBStoreManager<T> {
  const db = automaticlyOpenIDB(dbName, { includesStoreNames: [storeName] })

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

  async function close(): Promise<void> {
    return db.then((db) => db.close())
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
    get version() {
      return db.then((db) => db.version)
    },
    close,
  })

  async function set(key: IDBValidKey, body: MayFn<MayPromise<T | undefined>, [prev: Promise<T | undefined>]>) {
    return db
      .then((db) => {
        const transaction = db.transaction(storeName, "readwrite")
        const prevValue = get(key)
        const newValue = shrinkFn(body, [prevValue])
        Promise.resolve(newValue).then((value) => transaction.objectStore(storeName).put(value, key))
      })
      .catch((e) => {
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
      .then((db) => getStoreObjectEntries({ db, storeName }))
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
    get version() {
      return db.then((db) => db.version)
    },
    close,
  }
}

/**
 * a shorthand util for `idbManager.set()`
 * @example
 * setToIDB({dbName: "myDB", storeName: "myStore"}, "key", "value")
 */
export async function setIDBStoreValue<V>(
  config: IDBStoreManagerConfiguration,
  key: IDBValidKey,
  value: V | ((prev: V | undefined) => V),
): Promise<void> {
  const manager = createIDBStoreManager(config)
  return manager.set(key, value).finally(() => manager.close())
}

/**
 * a shorthand util for `idbManager.get()`
 * @example
 * getFromIDB({dbName: "myDB", storeName: "myStore"}, "key")
 */
export async function getIDBStoreValue<V>(
  config: IDBStoreManagerConfiguration,
  key: IDBValidKey,
): Promise<V | undefined> {
  const manager = createIDBStoreManager(config)
  return manager.get(key).finally(() => manager.close())
}
