import { createCachedGlobalHook } from "../createGlobalHook"
import { createSmartStore, CreateSmartStoreOptions } from "../smartStore/createSmartStore"
import { OnChangeCallback } from "../smartStore/features/onPropertyChange"

export function createGlobalStore<T extends Record<string, any>>(
  defaultValue: T,
  options?: CreateSmartStoreOptions<T>,
): [
  useStore: () => T,
  // don't use if possible, data in store is reactive
  rawStore: T,
  // don't use if possible, data in store is reactive
  onPropertyChange: <K extends keyof T>(
    key: K,
    cb: OnChangeCallback<T, K>,
  ) => {
    remove(): void
  },
] {
  const { store, _rawStore, onPropertyChange } = createSmartStore(defaultValue, options)
  const useStore = createCachedGlobalHook(() => store)
  return [useStore, _rawStore, onPropertyChange]
}
