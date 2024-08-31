import { createEffect, createSignal, on, onMount, type Accessor, type Setter } from "solid-js"
import { createLocalStorageStoreManager } from "./storageManagers"
import { listenDomEvent } from "../utils"
import { createIDBStoreManager } from "../idb"

/**
 * @todo currently only localStorage is supported
 */
export function useStorageValue(options: { key: string; defaultValue?: string }) {
  const manager = createLocalStorageStoreManager<any>()
  const [value, setValue] = createSignal<string | undefined>(options.defaultValue)
  onMount(() => {
    manager.get(options.key).then((value) => {
      setValue(value)
    })
  })
  createEffect(
    on(value, async () => {
      const storedValue = await manager.get(options.key)
      if (storedValue !== value()) {
        manager.set(options.key, value())
      }
    }),
  )
  return [value, setValue] as const
}

export function useLocalStorageValue(
  key: string,
  defaultValue?: string,
): [Accessor<string | undefined>, Setter<string | undefined>] {
  const [value, setValue] = createSignal<string | undefined>(globalThis.localStorage.getItem(key) ?? defaultValue)
  createEffect(
    on(
      value,
      (v) => {
        Promise.resolve().then(() => {
          const storedValue = globalThis.localStorage.getItem(key)
          if (storedValue !== v) {
            if (v != null) {
              globalThis.localStorage.setItem(key, v)
            } else {
              globalThis.localStorage.removeItem(key)
            }
          }
        })
      },
      { defer: true },
    ),
  )
  onMount(() => {
    listenDomEvent(globalThis.window, "storage", ({ ev }) => {
      const { key: newKey, newValue } = ev as StorageEvent
      if (key === newKey) {
        if (newValue != null) {
          setValue(newValue)
        } else {
          setValue(defaultValue)
        }
      }
    })
  })
  return [value, setValue]
}

export function useIDBValue<V = any>(opts: {
  dbName?: string
  key: string
  defaultValue?: V
}): [Accessor<V | undefined>, Setter<V | undefined>] {
  const [value, setValue] = createSignal<V | undefined>(opts.defaultValue)
  const idbManager = createIDBStoreManager<V | undefined>({
    dbName: opts.dbName ?? "useIDBValue",
    storeName: opts.key,
  })
  createEffect(
    on(value, async () => {
      const storedValue = await idbManager.get(opts.key)
      if (storedValue !== value()) {
        idbManager.set(opts.key, value())
      }
    }),
  )
  return [value, setValue] as const
}
