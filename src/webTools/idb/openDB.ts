import { isNumber, type ID, type MayPromise } from "@edsolater/fnkit"

const connectedDBs = new Map<string, Set<MayPromise<IDBDatabase>>>() // a collection of connected databases

/**
 * {@link connectedDBs}'s helper function
 * record the connection of the database
 */
async function recordDBConnection(dbName: string, db: MayPromise<IDBDatabase>): Promise<IDBDatabase> {
  if (!connectedDBs.has(dbName)) {
    connectedDBs.set(dbName, new Set())
  }
  connectedDBs.get(dbName)?.add(db)

  Promise.resolve(db).then((db) =>
    db.addEventListener("close", () => {
      connectedDBs.get(dbName)?.delete(db)
    }),
  )
  return db
}

/**
 * {@link connectedDBs}'s helper function
 * close all connections of the database
 */
function closeAllConnections(dbName: string): void {
  connectedDBs.get(dbName)?.forEach((db) => Promise.resolve(db).then((db) => db.close()))
  connectedDBs.delete(dbName)
}

/**
 * if specified store name doesn't exist, it will be created, and the db's version will be updated
 *
 * thus, you can use this function to open indexedDB without worrying about the version, it will automatically upgrade to the newest version
 * @param dbName
 * @param storeName
 */
export async function automaticlyOpenIDB(dbName: string, storeName: string): Promise<IDBDatabase> {
  const db = openDB({ dbName, onUpgradeNeeded: (db) => db.createObjectStore(storeName) })

  const noNeedUpgrade = await db.then((db) => db.objectStoreNames.contains(storeName))
  if (noNeedUpgrade) {
    return recordDBConnection(dbName, db)
  } else {
    const dbInfo = await globalThis.indexedDB.databases().then((dbs) => dbs.find((db) => db.name === dbName))
    const dbNewestVersion = dbInfo?.version
    const noThisDBBefore = !isNumber(dbNewestVersion)
    if (noThisDBBefore) return recordDBConnection(dbName, db)

    // need to upgrade to new version
    closeAllConnections(dbName)
    const newDB = openDB({
      dbName,
      version: dbNewestVersion + 1,
      onUpgradeNeeded: (ndb) => {
        ndb.createObjectStore(storeName)
        // migrateAllOldStoreObjects({ oldDB: oldDB, newDB: ndb })
      },
    })
    return recordDBConnection(dbName, newDB)
  }
}

/**
 * just a helper function to open indexedDB
 */
async function openDB(options: {
  dbName: string
  version?: number
  onUpgradeNeeded?(db: IDBDatabase): void
}): Promise<IDBDatabase> {
  const newDBOpenRequest = globalThis.indexedDB.open(options.dbName, options.version)
  const { promise: newDB, resolve, reject } = Promise.withResolvers<IDBDatabase>()
  newDBOpenRequest.onerror = (event) => {
    reject((event.target as IDBOpenDBRequest).error)
  }
  newDBOpenRequest.onsuccess = (event) => {
    const _db = (event.target as IDBOpenDBRequest).result
    resolve(_db)
  }
  newDBOpenRequest.onupgradeneeded = (event) => {
    const _db = (event.target as IDBOpenDBRequest).result
    options.onUpgradeNeeded?.(_db)
  }
  return newDB
}

/**
 * side-effect function
 *
 * Migrate(copy) all old store objects to the new store
 *
 * Use cursor to iterate all objects in the old store, and put them into the new store
 *
 * @returns Promise<boolean> will be fulfilled when all objects are copied
 */
async function migrateAllOldStoreObjects(options: { oldDB: IDBDatabase; newDB: IDBDatabase }): Promise<boolean> {
  // Get all object stores in the old database
  const oldObjectStores = options.oldDB.objectStoreNames

  const migrationSignals: Promise<boolean>[] = []

  for (const storeName of oldObjectStores) {
    // Create the same object store in the new database
    if (!options.newDB.objectStoreNames.contains(storeName)) {
      const oldStoreTransaction = options.oldDB.transaction(storeName, "readonly")
      const oldStore = oldStoreTransaction.objectStore(storeName)

      // Create a new object store with the same keyPath and autoIncrement configuration
      const newStore = options.newDB.createObjectStore(storeName, {
        keyPath: oldStore.keyPath || undefined,
        autoIncrement: oldStore.autoIncrement || false,
      })

      // Use cursor to iterate all objects in the old object store and insert them into the new object store
      const cursorRequest = oldStore.openCursor()
      cursorRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result

        if (cursor) {
          // Insert the object from the old store into the new store
          const putRequest = newStore.put(cursor.value, cursor.key)

          putRequest.onsuccess = () => {
            // Continue to the next object
            cursor.continue()
          }

          putRequest.onerror = (putEvent) => {
            console.error(`Failed to copy record from ${storeName}:`, (putEvent.target as IDBRequest).error)
          }
        }
      }

      cursorRequest.onerror = (event) => {
        console.error(`Failed to open cursor on ${storeName}:`, (event.target as IDBRequest).error)
      }

      // Create a promise that detect whether the migration is completed
      const migrationSignal = new Promise<boolean>((resolve, reject) => {
        oldStoreTransaction.oncomplete = () => {
          console.log(`Migration completed for ${storeName}`)
          resolve(true)
        }
        oldStoreTransaction.onerror = (event) => {
          console.error(`Transaction failed for ${storeName}:`, (event.target as IDBRequest).error)
          reject((event.target as IDBRequest).error)
        }
      })
      migrationSignals.push(migrationSignal)
    }
  }

  return Promise.all(migrationSignals).then(() => true)
}
