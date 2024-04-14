import { Subscribable } from "@edsolater/fnkit"
import { Accessor, createEffect, createSignal, onCleanup } from "solid-js"
/**
 * use subscribable as a solid-js signal
 */
export function useSubscribable<T>(subscribable: Subscribable<T>): Accessor<T | undefined>
export function useSubscribable<T>(subscribable: Subscribable<T>, defaultValue: T): Accessor<T>
export function useSubscribable<T>(subscribable: Subscribable<T>, defaultValue?: T) {
  const [value, setValue] = createSignal(subscribable() ?? defaultValue, { equals: false })
  createEffect(() => {
    const { unsubscribe } = subscribable.subscribe(setValue)
    onCleanup(unsubscribe)
  })
  return value
}
