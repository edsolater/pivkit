import { type SetStoreFunction, createStore } from "solid-js/store"

/**
 * link {@Link createStore}, but have more utils
 */
export function createIStore<T extends object>(
  initialStore: T,
  options?: {
    name?: string
    /**
     * any property change will invoke this,
     * inner store's change can't be reactive by {@link create}
     */
    onChange?: (newStore: T) => void
  },
): [store: T, setStore: SetStoreFunction<T>, utils: unknown] {
  const [store, _setStore] = createStore(initialStore)

  // wrapped setStore to invoke onChange
  const setStore = ((...params) => {
    // @ts-ignore
    const r = _setStore(...params)
    options?.onChange?.(store)
    return r
  }) as SetStoreFunction<T>

  return [store, setStore, {}]
}
