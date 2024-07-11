import { Signal, createEffect, createSignal, on, type Accessor } from "solid-js"

/**
 * a shortcut
 * TODO: maybe it can be in createISignal()?
 */
export function createSyncSignal<T>(options: {
  defaultValue?: Accessor<T>
  value: Accessor<T>
  /**
   * Note: this **will not** invoke when the inner value is the same as the input value
   *
   * this event callback is invoked by inner, user should use this and `opt:value` to establish two-way bind of outside value
   */
  onSetByInner?: (value: T, prevValue: T | undefined) => void
  /**
   * Note: this **will** invoke when the inner value is the same as the input value
   *
   */
  onSet?: (value: T, prevValue: T | undefined) => void
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
        options.onSet?.(newValue, prevValue)
        // same as input so no need to invoke the setter fn
        if (options.value && newValue === options.value()) return
        options.onSetByInner?.(newValue, prevValue)
      },
      { defer: true },
    ),
  )

  return [innerValue, setInnerValue]
}
