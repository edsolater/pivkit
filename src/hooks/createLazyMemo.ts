import { Accessor } from 'solid-js'
import { createLazySignal } from './createLazySignal'

/**
 * only load when access
 */

export function createLazyMemo<V>(lazyLoadInitValue: () => V): Accessor<V> {
  const [accessor] = createLazySignal(lazyLoadInitValue)
  return accessor
}
