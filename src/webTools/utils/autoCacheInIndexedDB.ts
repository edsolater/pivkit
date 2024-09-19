import {
  asyncInvoke,
  createSubscribable,
  createSubscribablePlugin,
  isObject,
  syncDataBetweenTwoSubscribable
} from "@edsolater/fnkit";
import { createIDBStoreManager } from "../idb";

/**
 * {@link createSubscribable}‘s plugin
 *
 * sync with indexedDB
 */
export const autoCacheInIndexedDB = (options: { dbName?: string; keyName: string }) =>
  createSubscribablePlugin(({ name: subscribableName }) => {
    //#region ---------------- define innerStoreValue and innerScribableValue ----------------
    const innerStoreValue = createSubscribable<any>()
    const innerScribableValue = createSubscribable<any>()
    syncDataBetweenTwoSubscribable(innerStoreValue, innerScribableValue)
    //#endregion

    //#region ---------------- inner state => indexedDB store ----------------
    let currentStoreValue: any
    const idbManager = createIDBStoreManager<any>({
      dbName: options.dbName ?? subscribableName ?? "default",
      onStoreLoaded: async ({ get }) => {
        const storeValue = await get(options?.keyName)
        if (storeValue) {
          innerStoreValue.set(storeValue)
          currentStoreValue = storeValue
        }
      },
    })
    asyncInvoke(() => {
      innerStoreValue.subscribe((storeValue) => {
        if (currentStoreValue !== storeValue) {
          idbManager.set(options.keyName, storeValue)
          currentStoreValue = storeValue
        }
      })
    })
    //#endregion

    return {
      onInit({ self, ...rest }) {
        self.then((self) => {
          //#region ---------------- inner subscribable value => self ----------------
          innerScribableValue.subscribe((syncedStoreValue) => {
            self.set(syncedStoreValue)
          })
          //#endregion
        })
      },
      onSet(value, prevValue) {
        console.log("🎉 plugin autoCacheInIndexedDB: subscribe and set to indexedDB: ", value)
        if (isObject(value) && Object.keys(value).length) {
          innerScribableValue.set(() => value)
        }
      },
    }
  })
