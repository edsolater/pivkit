import { setIntervalWithSecondes } from "@edsolater/fnkit"
import { onCleanup, createEffect, onMount } from "solid-js"

/**
 * **DOM API (setInterval)**
 *
 * use seconds , not milliseconds \
 * will auto clear when component unmount
 */
export function useInterval(callback: () => void, s = 1, delay?: number) {
  onMount(() => {
    const intervalId = setIntervalWithSecondes(callback, s)
    onCleanup(() => clearInterval(intervalId))
  })
}
