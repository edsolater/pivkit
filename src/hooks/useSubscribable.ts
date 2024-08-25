import { asyncInvoke, isShallowEqual, Subscribable } from "@edsolater/fnkit"
import { Accessor, createEffect, createSignal, on, onCleanup, onMount, untrack, type Setter } from "solid-js"
import { createStore, reconcile, unwrap, type SetStoreFunction } from "solid-js/store"
import { createIDBStoreManager } from "../webTools"

type SignalReturnedPair<U> = [
  accessor: Accessor<U>,
  setter: Setter<U>,
  utils: {
    /* update inner data from param:Subscribable */
    refresh(): void
  },
]

/**
 * useful for subscribe to a subscribable
 * if subscribable is a big store, use options.pick to pick a part of it
 * @param subscribable
 * @returns
 */
export function useSubscribable<T, U>(
  subscribable: Subscribable<T>,
  options: {
    /** only if raw subscribable is deep*/
    targetPath?: string
    /** @deprecated */
    onPickFromSubscribable: (subscribeValue: T) => U
    /** @deprecated */
    onSetToSubscribable: (newValue: U, subscribable: Subscribable<T>) => void
  },
): SignalReturnedPair<U>
export function useSubscribable<T>(subscribable: Subscribable<T>): SignalReturnedPair<T>
export function useSubscribable<T>(
  subscribable: Subscribable<T>,
  options?: {
    onPickFromSubscribable?: (subscribeValue: T) => any
    onSetToSubscribable?: (newValue: any, currentValue: any) => any
  },
): SignalReturnedPair<any> {
  // when it's innerValue, don't assign again
  let newSetInnerValue: T | undefined

  const getPickedValue = (subscribeValue) =>
    options?.onPickFromSubscribable ? options.onPickFromSubscribable(subscribeValue) : subscribeValue
  const setPickedValue = (newValue) => {
    options?.onSetToSubscribable ? options.onSetToSubscribable(newValue, subscribable) : subscribable.set(newValue)
  }

  const initValue = getPickedValue(subscribable())
  const [value, _setValue] = createSignal(initValue)

  // @ts-expect-error force
  const setValue: Setter<any> = (v) => {
    if (isShallowEqual(v, untrack(value))) return
    _setValue(v)
  }

  function setFromRawSubscribableValue(v: any): void {
    const newNeedToSetValue = getPickedValue(v)
    if (newNeedToSetValue === newSetInnerValue) {
      newSetInnerValue = undefined
    } else {
      newSetInnerValue = newNeedToSetValue
      setValue(newNeedToSetValue)
    }
  }
  /* update inner data from param:Subscribable */
  function forceRefreshFromSubscribable() {
    setFromRawSubscribableValue(subscribable())
  }
  onMount(() => {
    const { unsubscribe } = subscribable.subscribe(
      (v) => {
        asyncInvoke(() => setFromRawSubscribableValue(v))
      },
      { immediately: false },
    )
    onCleanup(unsubscribe)
  })

  createEffect(
    on(
      value,
      (v) => {
        asyncInvoke(() => {
          const newNeedToSetValue = v
          if (newNeedToSetValue === newSetInnerValue) {
            newSetInnerValue = undefined
            return
          } else {
            newSetInnerValue = newNeedToSetValue
            setPickedValue(v)
          }
        })
      },
      { defer: true },
    ),
  )
  return [value, setValue, { refresh: forceRefreshFromSubscribable }]
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
