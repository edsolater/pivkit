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
