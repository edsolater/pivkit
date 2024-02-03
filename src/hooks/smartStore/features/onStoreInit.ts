import { MayArray } from '@edsolater/fnkit'
import { CreateSmartStoreOptions_BasicOptions, SmartSetStore } from '../createSmartStore'
import { createCallbacksStore } from '../utils/createCallbackStore'

type OnStoreInitCallback<T extends Record<string, any>> = (payload: {
  store: T
  setStore: SmartSetStore<T>
}) => void | (() => void) /* clean function */

export type CreateSmartStoreOptions_OnStoreInit<T extends Record<string, any>> = {
  onStoreInit?: MayArray<OnStoreInitCallback<T>>
}

export type StoreCallbackRegisterer_OnStoreInit<T extends Record<string, any>> = {
  onStoreInit: (cb: OnStoreInitCallback<T>) => { remove(): void }
}

export function createSmartStore_onStoreInit<T extends Record<string, any>>(
  options?: CreateSmartStoreOptions_BasicOptions<T> & CreateSmartStoreOptions_OnStoreInit<T>
) {
  const callbackStore = createCallbacksStore<OnStoreInitCallback<T>>({
    initCallbacks: options?.onStoreInit,
  })

  function invoke(store: T, setStore: SmartSetStore<T>) {
    callbackStore.invoke({ store, setStore })
  }
  function addListener(cb: OnStoreInitCallback<T>) {
    return callbackStore.addListener(cb)
  }
  return { invoke, addListener }
}
