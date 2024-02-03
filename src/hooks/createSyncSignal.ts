import { Signal, createEffect, createSignal, on } from 'solid-js'

/**
 * a shortcut
 */
export function createSyncSignal<T>(options: {
  defaultValue(): T
  getValueFromOutside: (prev?: T) => T | undefined
  onInvokeSetter?: (value: T) => void
}): Signal<T>
export function createSyncSignal<T>(options: {
  defaultValue?(): T
  getValueFromOutside: (prev?: T) => T
  onInvokeSetter?: (value: T) => void
}): Signal<T | undefined>
export function createSyncSignal<T>(options: {
  defaultValue?(): T
  getValueFromOutside: (prev?: T) => T | undefined
  onInvokeSetter?: (value: T) => void
}): Signal<T | undefined> {
  const [accessor, setAccessor] = createSignal(
    'defaultValue' in options
      ? options.defaultValue?.() ?? options.getValueFromOutside()
      : options.getValueFromOutside()
  )

  // invoke `get`
  createEffect(() => setAccessor((prev) => options.getValueFromOutside(prev) ?? prev))

  // invoke `set`
  createEffect(
    on(
      accessor,
      (newValue, prevValue) => {
        // same as input so no need to invoke the setter fn
        if (newValue === options.getValueFromOutside()) return
        options.onInvokeSetter?.(newValue as T)
      },
      { defer: true }
    )
  )

  return [accessor, setAccessor]
}
