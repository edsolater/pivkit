import { isFunction, shrinkFn } from "@edsolater/fnkit"
import { Accessor, createEffect, createMemo, untrack } from "solid-js"
import { createStore, unwrap, type SetStoreFunction } from "solid-js/store"
import {
  StoreCallbackRegisterer_OnFirstAccess,
  createSmartStore_onAccess,
  type CreateSmartStoreOptions_OnFirstAccess,
} from "./features/onFirstAccess"
import {
  createSmartStore_onPropertyChange,
  type CreateSmartStoreOptions_OnPropertyChange,
  type StoreCallbackRegisterer_OnPropertyChange,
} from "./features/onPropertyChange"
import {
  createSmartStore_onStoreInit,
  type CreateSmartStoreOptions_OnStoreInit,
  type StoreCallbackRegisterer_OnStoreInit,
} from "./features/onStoreInit"
import { createStoreSetter } from "./utils/setStoreByObject"

export type CreateSmartStoreOptions_BasicOptions<T extends Record<string, any>> = {}
export type CreateSmartStoreOptions<T extends Record<string, any>> = CreateSmartStoreOptions_BasicOptions<T> &
  CreateSmartStoreOptions_OnPropertyChange<T> &
  CreateSmartStoreOptions_OnFirstAccess<T> &
  CreateSmartStoreOptions_OnStoreInit<T>

export type SmartSetStore<T extends Record<string, any>> = (
  dispatch: ((prevStore?: T) => Partial<T>) | Partial<T>,
) => void

export type SmartStore<T extends Record<string, any>> = {
  store: T
  unwrappedStore: T
  /** new object will merge to original   */
  setStore: SmartSetStore<T>

  /** dangerous shortcut, just use store as much as you can  */
  createStorePropertySignal<F>(pick: (store: T) => F): () => F

  /** dangerous shortcut, just use store as much as you can  */
  createStorePropertySetter<F>(pick: (store: T) => F): (dispatcher: F | ((prev: F) => F)) => void

  /** don't use. as much as possible, it's unwrapped solidjs/store setStore */
  _rawStore: T

  /** don't use. as much as possible, it's unwrapped solidjs/store setStore */
  _rawSetStore: SetStoreFunction<T>
} & StoreCallbackRegisterer_OnPropertyChange<T> &
  StoreCallbackRegisterer_OnStoreInit<T> &
  StoreCallbackRegisterer_OnFirstAccess<T>

/** CORE, please client createContextStore or createGlobalStore\
 * 🚧 use solid system to hold reactive system
 *
 * store has two feature:
 * - change onChange
 * - object has merge to original store, not cover original store
 *
 */
export function createSmartStore<T extends Record<string, any>>(
  defaultValue: T | Accessor<T>,
  options?: CreateSmartStoreOptions<T>,
): SmartStore<T> {
  const de = shrinkFn(defaultValue)
  const [rawStore, rawSetStore] = createStore<T>(de)
  /** if pass a function, it will be trate with createEffect to track reactive */
  if (isFunction(defaultValue)) {
    createEffect(() => {
      const newValue = shrinkFn(defaultValue)
      setStore(newValue)
    })
  }
  let accessCount: Record<string | symbol, number> = {}
  let setCount: Record<string | symbol, number> = {}

  // -------- features --------
  const { invoke: invokeOnChanges, addListener: addListenerPropertyChange } =
    createSmartStore_onPropertyChange<T>(options)
  const { invoke: invokeOnStoreInit, addListener: addListenerStoreInit } = createSmartStore_onStoreInit<T>(options)
  const {
    invokeFirstAccess: invokeOnFirstAccess,
    addFirstAccessListener: addListenerFirstAccess,
    invokeAccess: invokeOnAccess,
    addAccessListener: addListenerAccess,
  } = createSmartStore_onAccess<T>(options)

  const store = new Proxy(rawStore, {
    get: (store, p, receiver) => {
      accessCount[p] = (accessCount[p] ?? 0) + 1
      if (accessCount[p] === 1) {
        invokeOnFirstAccess(p as string, rawStore[p as string], rawStore, setStore)
      }
      invokeOnAccess(p as string, rawStore[p as string], rawStore, setStore)
      const propertyName = p as string
      const value = Reflect.get(store, propertyName, receiver)
      return value
    },
  }) as T

  // access unwrappedStore will not change accessCount
  const store2 = new Proxy(rawStore, {
    get: (target, p, receiver) => {
      const propertyName = p as string
      const value = Reflect.get(target, propertyName, receiver)
      return value
    },
  }) as T

  const unwrappedStore = new Proxy(store2, {
    get(target, p, receiver) {
      const pureStore = unwrap(target)
      return Reflect.get(pureStore, p, receiver)
    },
  })

  function setStore(dispatch: ((prevValue?: T) => Partial<T>) | Partial<T>): void {
    const prevStore = untrack(() => rawStore)
    const newStorePieces = isFunction(dispatch) ? dispatch(prevStore) : dispatch
    if (!newStorePieces) return // no need to update store with the same value
    Object.entries(newStorePieces).forEach(([propertyName, newValue]) => {
      setCount[propertyName] = (setCount[propertyName] ?? 0) + 1
      // @ts-ignore
      const prevValue = prevStore[propertyName]
      if (prevValue !== newValue) {
        invokeOnChanges(propertyName, newValue, prevValue, store, setStore)
      }
    })
    rawSetStore(createStoreSetter(newStorePieces))
  }

  function createStorePropertySignal<F>(pick: (store: T) => F): () => F {
    return createMemo(() => pick(store))
  }

  function createStorePropertySetter<F>(pick: (store: T) => F): (dispatcher: F | ((prev: F) => F)) => void {
    return (dispatcher) => {
      let propertyName: keyof T | undefined = undefined
      const prevValue = pick(
        new Proxy(store, {
          get(target, p, receiver) {
            propertyName = p as string
            return Reflect.get(target, p, receiver)
          },
        }),
      )
      const newValue = isFunction(dispatcher) ? dispatcher(prevValue) : dispatcher
      if (propertyName) {
        // @ts-expect-error don't know why
        setStore({ [propertyName]: newValue })
      }
    }
  }

  invokeOnStoreInit(store, setStore)

  return {
    store: store,
    unwrappedStore: unwrappedStore,
    setStore: setStore,

    // shortcut
    createStorePropertySignal: createStorePropertySignal,
    createStorePropertySetter: createStorePropertySetter,

    onStoreInit: addListenerStoreInit,
    onPropertyChange: addListenerPropertyChange,
    onFirstAccess: addListenerFirstAccess,
    onAccess: addListenerAccess,

    _rawStore: rawStore as T,
    _rawSetStore: rawSetStore,
  }
}
