import { isArray } from "@edsolater/fnkit"
import { automaticlyOpenIDB } from "../openDB"
import { getStoreObjectEntries } from "./idbStoreEntry"
import { IDBStoreEntry, isIDBEntry } from "./idbStoreEntry"

export function isIDBScreenshot(data: any): data is IDBScreenshot {
  return typeof data === "object" && Object.values(data).every((pairs) => isArray(pairs) && pairs.every(isIDBEntry))
} /**
 * Screenshots: multi serious of entries
 */

export type IDBScreenshot = {
  [storeName: string]: IDBStoreEntry[]
} /**
 * Retrieves all the entries from the indexedDB stores in the specified database.
 * @param config - The configuration object containing the database name.
 * @returns A promise that resolves to an object containing the entries for each store in the database, or undefined if there was an error.
 * @example
 * getIDBScreenShot({ dbName: "myDB" }).then((entries) => {
 *   console.log(entries);
 * });
 */

export async function getIDBScreenshot(config: { dbName: string }): Promise<IDBScreenshot | undefined> {
  return automaticlyOpenIDB(config.dbName).then((db) => {
    const storeEntriesOfStores = Array.from(db.objectStoreNames).map((storeName) =>
      getStoreObjectEntries({ db, storeName }).then((entries) => ({ storeName, entries })),
    )
    const storeObjects = Promise.all(storeEntriesOfStores).then((storeEntries) =>
      Object.fromEntries(storeEntries.map(({ storeName, entries }) => [storeName, entries])),
    )
    return storeObjects
  })
}
/**
 * see {@link setIDBFromScreenshot}'s function name
 * @param config.dbName idb name
 * @param screenshot an object with storeName as key and entries(key + value) as value
 */

export async function setIDBFromScreenshot(config: { dbName: string }, screenshot: IDBScreenshot) {
  const { promise: done, resolve, reject } = Promise.withResolvers<void>()
  const db = automaticlyOpenIDB(config.dbName, { includesStoreNames: Object.keys(screenshot) })
  const actionPromiseList = [] as Promise<void>[]
  db.then((db) => {
    const transaction = db.transaction(Array.from(db.objectStoreNames), "readwrite")
    for (const [storeName, entries] of Object.entries(screenshot)) {
      const store = transaction.objectStore(storeName)
      for (const { key, value } of entries) {
        const action = store.put(value, key)
        action.onsuccess = () => {
          actionPromiseList.push(Promise.resolve())
        }
        action.onerror = (event) => {
          reject((event.target as IDBRequest).error)
        }
      }
    }
    Promise.all(actionPromiseList).then(() => resolve())
  })
  return done
}
