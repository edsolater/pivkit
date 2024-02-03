import { MayArray } from '@edsolater/fnkit'
import { CreateSmartStoreOptions_BasicOptions, SmartSetStore } from '../createSmartStore'
import { createCallbacksStoreWithKeys } from '../utils/createCallbackStore'

export type OnChangeCallback<T extends Record<string, any>, K extends keyof T = any> = (payload: {
  value: T[K]
  prevValue: T[K] | undefined
  store: T
  setStore: SmartSetStore<T>
}) => void | (() => void) /* clean function */

export type CreateSmartStoreOptions_OnPropertyChange<T extends Record<string, any>> = {
  onPropertyChange?: {
    [K in keyof T]?: MayArray<OnChangeCallback<T, K>>
  }
}
export type StoreCallbackRegisterer_OnPropertyChange<T extends Record<string, any>> = {
  onPropertyChange: <K extends keyof T>(key: K, cb: OnChangeCallback<T, K>) => { remove(): void }
}

export function createSmartStore_onPropertyChange<T extends Record<string, any>>(
  options?: CreateSmartStoreOptions_BasicOptions<T> & CreateSmartStoreOptions_OnPropertyChange<T>
) {
  const keyedCallbackStore = createCallbacksStoreWithKeys<keyof T, OnChangeCallback<T>>({
    initCallbacks: options?.onPropertyChange,
  })
  function invoke(propertyName: string, newValue: any, prevValue: any, store: T, setStore: SmartSetStore<T>) {
    return keyedCallbackStore.invoke(propertyName)({ value: newValue, prevValue, store, setStore })
  }
  function addListener<K extends keyof T>(key: K, cb: OnChangeCallback<T, K>) {
    return keyedCallbackStore.addListener(key)(cb)
  }
  return { invoke, addListener }
}
