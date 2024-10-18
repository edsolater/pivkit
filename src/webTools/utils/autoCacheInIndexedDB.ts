import {
  assert,
  createSubscribable,
  isObject,
  type SubscribablePlugin
} from "@edsolater/fnkit"
import { getIDBStoreValue, setIDBStoreValue } from "../idb"

/**
 * {@link createSubscribable}‘s plugin
 *
 * sync with indexedDB
 */
export const autoCacheInIndexedDB = (options: {
  dbName?: string
  storeName?: string
  keyName: string
}): SubscribablePlugin<any> =>
  (({ params, self }) => {
    const idbTargetConfig = {
      dbName: options.dbName ?? params.name ?? "default",
      storeName: options.storeName ?? "default",
    }

    function checkIDBValueIsEqualWithInnerValue(idbValue: any, innerValue: any) {
      if (isObject(idbValue) && isObject(innerValue)) {
        return JSON.stringify(idbValue) === JSON.stringify(innerValue)
      } else {
        return idbValue === innerValue
      }
    }

    async function getDataFromIDB() {
      return getIDBStoreValue(idbTargetConfig, options.keyName)
    }

    function setDataToIDB(storeValue: any) {
      console.log("new to idb stored value: ", storeValue)
      setIDBStoreValue(idbTargetConfig, options.keyName, storeValue)
    }

    let isInitSyncing = false // prevent infinite set-get-set-get loop

    self.then((s) => {
      getDataFromIDB().then((idbValue) => {
        if (!checkIDBValueIsEqualWithInnerValue(idbValue, s())) {
          assert(!isInitSyncing, "why isInitSyncing is 🤔🤔🤔?")
          s.set(idbValue)
          isInitSyncing = true
        }
      })
      s.subscribe((newValue) => {
        if (!isInitSyncing) {
          setDataToIDB(newValue)
        } else {
          isInitSyncing = false
        }
      })
    })
  }) as SubscribablePlugin<any>
