import { createEffect, onCleanup } from "solid-js"

/**
 * DOM: IntervalAPI effect hook
 * but auto clean
 */
export function createIntervalEffect(fn: () => void, interval: number) {
  createEffect(() => {
    const id = setInterval(fn, interval)
    onCleanup(() => clearInterval(id))
  })
}
