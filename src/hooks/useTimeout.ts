import { setTimeoutWithSecondes } from "@edsolater/fnkit"
import { onCleanup, createEffect, onMount } from "solid-js"

/**
 * **DOM API (setTimeoutWithSecondes)**
 *
 * use seconds , not milliseconds \
 * will auto clear when component unmount
 */
export function useTimeout(callback: () => void, delay = 1) {
  onMount(() => {
    const timeoutId = setTimeoutWithSecondes(callback, delay)
    onCleanup(() => clearTimeout(timeoutId))
  })
}
