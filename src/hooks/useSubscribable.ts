import { Subscribable } from "@edsolater/fnkit"
import { Accessor, createEffect, createSignal, on, onCleanup, onMount, type Setter } from "solid-js"
import { type SetStoreFunction, createStore, unwrap, reconcile } from "solid-js/store"
import { createIDBStoreManager } from "../webTools"

/**
 * useful for subscribe to a subscribable
 * if subscribable is a big store, use options.pick to pick a part of it
 * @param subscribable
 * @returns
 */
export function useSubscribable<T, U>(
  subscribable: Subscribable<T>,
  options: {
    pick: (subscribeValue: T) => U
    set: (newValue: U, s: Subscribable<T>) => void
  },
): [Accessor<U>, Setter<U>]
export function useSubscribable<T>(subscribable: Subscribable<T>): [Accessor<T>, Setter<T>]
export function useSubscribable<T>(
  subscribable: Subscribable<T>,
  options?: {
    pick?: (subscribeValue: T) => any
    set?: (newValue: any, s: Subscribable<T>) => void
  },
): [Accessor<any>, Setter<any>] {
  const getPickedValue = (subscribeValue) => (options?.pick ? options.pick(subscribeValue) : subscribeValue)
  const setPickedValue = (newValue) => {
    options?.set ? options.set(newValue, subscribable) : subscribable.set(newValue)
  }

  const initValue = getPickedValue(subscribable())
  const [value, setValue] = createSignal(initValue)

  onMount(() => {
    const { unsubscribe } = subscribable.subscribe((v) => setValue(getPickedValue(v)))
    onCleanup(unsubscribe)
  })

  createEffect(
    on(
      value,
      (v) => {
        setPickedValue(v)
      },
      { defer: true },
    ),
  )
  return [value, setValue]
}

/**
 * useful for subscribe to a subscribable
 * @param subscribable
 * @returns
 */
export function useSubscribableStore<T extends object>(
  subscribable: Subscribable<T>,
  options?: {
    canCachedByIndexDB?: boolean
    /** name is for indexedDB */
    dbName?: string
  },
): [T, SetStoreFunction<T>] {
  const [store, setStore] = createStore(subscribable())

  const wrappedSet = (...args) => {
    // @ts-expect-error
    const result = setStore(...args)
    console.log("set to subscribable: ", unwrap(store))
    subscribable.set({ ...unwrap(store) })
    return result
  }

  createEffect(() => {
    const { unsubscribe } = subscribable.subscribe(
      (s) => {
        if (s != unwrap(store)) {
          return setStore(reconcile(s))
        }
      },
      { immediately: false },
    )
    onCleanup(unsubscribe)
  })

  // ---------------- indexedDB ----------------
  if (options?.canCachedByIndexDB) {
    const idbManager = createIDBStoreManager<T>({
      dbName: options.dbName ?? subscribable.name ?? "default",
      onStoreLoaded: async ({ get }) => {
        const valueStore = await get("store")
        if (valueStore) {
          console.log("on idb connected: valueStore: ", subscribable())
          subscribable.set(valueStore)
        }
      },
    })
    onMount(() => {
      const { unsubscribe } = subscribable.subscribe(
        (value) => {
          console.log("🎉subscribe and set to indexedDB: ", value)
          if (Object.keys(value).length) {
            idbManager.set("store", value)
          }
        },
        { immediately: false },
      )
      onCleanup(unsubscribe)
    })
  }

  return [store, wrappedSet]
}
