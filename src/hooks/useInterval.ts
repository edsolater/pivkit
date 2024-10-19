import { setIntervalWithSecondes, setTimeoutWithSecondes } from "@edsolater/fnkit"
import { onCleanup, onMount } from "solid-js"

/**
 * **DOM API (setInterval)**
 *
 * use seconds , not milliseconds \
 * will auto clear when component unmount
 */
export function useInterval(callback: () => void, s = 1, delay?: number) {
  onMount(() => {
    if (delay) {
      setTimeoutWithSecondes(() => {
        const intervalId = setIntervalWithSecondes(callback, s)
        onCleanup(() => clearInterval(intervalId))
      }, delay)
    } else {
      const intervalId = setIntervalWithSecondes(callback, s)
      onCleanup(() => clearInterval(intervalId))
    }
  })
}
