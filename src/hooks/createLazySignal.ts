import { Signal, createEffect, createSignal, untrack } from 'solid-js'

/**
 * signal's action will only load when first access the acessor
 * if it's promise, default is undefined
 * lazyValue is in track scope
 */
export function createLazySignal<V>(lazyLoadInitValue: () => V): Signal<V> {
  const [hasAccessed, setHasAccessed] = createSignal(false)
  let innerOnFirstAccessFunction = lazyLoadInitValue
  const [value, _setValue] = createSignal<V | undefined>(undefined) // no need to type check

  function get() {
    untrack(() => {
      if (!hasAccessed()) {
        setHasAccessed(true)
        // Don't know how to avoid init get value twice
        const value = innerOnFirstAccessFunction()
        _setValue(() => value)
      }
    })
    return value()
  }

  function set(...args: Parameters<typeof _setValue>) {
    untrack(() => {
      if (hasAccessed()) {
        return _setValue(...args)
      } else {
        const oldInnerOnFirstAccessFunction = innerOnFirstAccessFunction
        innerOnFirstAccessFunction = () => {
          oldInnerOnFirstAccessFunction()
          _setValue(...args)
          return value() as V
        }
      }
    })
  }

  createEffect(() => {
    if (!hasAccessed()) return
    const value = lazyLoadInitValue()
    _setValue(() => value)
  })
  // @ts-expect-error force
  return [get, set]
}
