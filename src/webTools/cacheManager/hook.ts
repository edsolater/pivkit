import { createEffect, createSignal, on, onMount, type Accessor, type Setter } from "solid-js"
import { createLocalStorageStoreManager } from "./storageManagers"
import { listenDomEvent } from "../utils";

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

