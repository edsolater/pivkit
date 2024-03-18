import { MayArray } from "@edsolater/fnkit"
import { CreateSmartStoreOptions_BasicOptions, SmartSetStore } from "../createSmartStore"
import { createCallbacksStoreWithKeys } from "../utils/createCallbackStore"

type OnFirstAccessCallback<T extends Record<string, any>, K extends keyof T = any> = (payload: {
  value: T[K]
  store: T
  setStore: SmartSetStore<T>
}) => void | (() => void) /* clean function */
export type CreateSmartStoreOptions_OnFirstAccess<T extends Record<string, any>> = {
  /** don't need to worry about callback registed multi times, will invoke in micro  */
  onFirstAccess?: {
    [K in keyof T]?: MayArray<OnFirstAccessCallback<T, K>>
  }
  /** don't need to worry about callback registed multi times, will invoke in micro  */
  onAccess?: {
    [K in keyof T]?: MayArray<OnFirstAccessCallback<T, K>>
  }
}
export type StoreCallbackRegisterer_OnFirstAccess<T extends Record<string, any>> = {
  onFirstAccess: <K extends keyof T>(key: K, cb: OnFirstAccessCallback<T, K>) => { remove(): void }
  onAccess: <K extends keyof T>(key: K, cb: OnFirstAccessCallback<T, K>) => { remove(): void }
}

export function createSmartStore_onAccess<T extends Record<string, any>>(
  options?: CreateSmartStoreOptions_BasicOptions<T> & CreateSmartStoreOptions_OnFirstAccess<T>,
) {
  const keyedFirstAccessCallbackStore = createCallbacksStoreWithKeys<keyof T, OnFirstAccessCallback<T>>({
    initCallbacks: options?.onFirstAccess,
  })
  const keyedAccessCallbackStore = createCallbacksStoreWithKeys<keyof T, OnFirstAccessCallback<T>>({
    initCallbacks: options?.onAccess,
  })

  function invokeFirstAccess(propertyName: keyof T, newValue: any, store: T, setStore: SmartSetStore<T>) {
    return keyedFirstAccessCallbackStore.invoke(propertyName)({ value: newValue, store, setStore })
  }
  function addFirstAccessListener<K extends keyof T>(key: K, cb: OnFirstAccessCallback<T, K>) {
    return keyedFirstAccessCallbackStore.addListener(key)(cb)
  }

  function invokeAccess(propertyName: keyof T, newValue: any, store: T, setStore: SmartSetStore<T>) {
    return keyedAccessCallbackStore.invoke(propertyName)({ value: newValue, store, setStore })
  }
  function addAccessListener<K extends keyof T>(key: K, cb: OnFirstAccessCallback<T, K>) {
    return keyedAccessCallbackStore.addListener(key)(cb)
  }

  return { invokeFirstAccess, addFirstAccessListener, invokeAccess, addAccessListener }
}
