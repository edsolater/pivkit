import { setIntervalWithSecondes } from "@edsolater/fnkit"
import { createEffect, onCleanup } from "solid-js"

/**
 * DOM: IntervalAPI effect hook
 * but auto clean
 */
export function createIntervalEffect(fn: () => void, interval: number) {
  createEffect(() => {
    const id = setIntervalWithSecondes(fn, interval)
    onCleanup(() => clearInterval(id))
  })
}
