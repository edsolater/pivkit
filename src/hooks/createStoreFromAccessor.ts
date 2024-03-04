import { type Accessor, createEffect } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'

/** T must is object */
export function createStoreFromAccessor<T extends object>(
  signal: Accessor<T>,
  options?: {
    key: string
  }
) {
  const [store, setStore] = createStore(signal())
  createEffect(() => {
    setStore(reconcile(signal(), { key: options?.key }))
  })
  return store
}
