
export type IDBStoreEntry = {
  key: IDBValidKey;
  value: any;
};

export function isIDBEntry(data: any): data is IDBStoreEntry {
  return typeof data === "object" && "key" in data && "value" in data;
}/**
 * Retrieves the entries from the specified store in the indexedDB database.
 * @param params - The parameters object containing the database and store names.
 * @returns A promise that resolves to an array of entries from the specified store, or undefined if there was an error.
 * @example
 * getStoreObjectEntries({ db: myDB, storeName: "myStore" }).then((entries) => {
 *   console.log(entries);
 * });
 */

export async function getStoreObjectEntries(params: { db: IDBDatabase; storeName: string} ): Promise<IDBStoreEntry[]> {
  const { promise: storeEntries, resolve, reject } = Promise.withResolvers<IDBStoreEntry[]>()
  const objectStore = params.db.transaction(params.storeName, "readonly").objectStore(params.storeName)
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

  return storeEntries
}

