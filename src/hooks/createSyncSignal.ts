import { Signal, createEffect, createSignal, on, type Accessor } from "solid-js"

/**
 * a shortcut
 */
export function createSyncSignal<T>(options: {
  defaultValue?: Accessor<T>
  value: Accessor<T>
  onSetByInner?: (value: T, prevValue: T | undefined) => void
}): Signal<T> {
  const [innerValue, setInnerValue] = createSignal(
    "defaultValue" in options ? options.defaultValue!() : options.value(),
  )

  // cause from outside: value -> innerValue
  createEffect(
    on(
      options.value,
      (newValue) => {
        // same as input so no need to invoke the setter fn,
        // but this is handled by the innerValue signal 's original
        setInnerValue(() => newValue)
      },
      { defer: true },
    ),
  )

  // cause from inside: innerValue -> value
  createEffect(
    on(
      innerValue,
      (newValue, prevValue) => {
        // same as input so no need to invoke the setter fn
        if (newValue === options.value()) return
        options.onSetByInner?.(newValue as T, prevValue)
      },
      { defer: true },
    ),
  )

  return [innerValue, setInnerValue]
}
