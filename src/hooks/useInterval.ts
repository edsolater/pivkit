import { isTimeSignal, setInterval, setTimeoutWithSecondes, type TimeSignal } from "@edsolater/fnkit"
import { onCleanup, onMount } from "solid-js"

type Options = { interval?: TimeSignal; delay?: TimeSignal; runImmediate?: boolean }

/**
 * **DOM API (setInterval)**
 *
 * use seconds , not milliseconds \
 * will auto clear when component unmount
 */
export function useInterval(
  ...args: [callback: () => void, s?: TimeSignal, delay?: TimeSignal] | [callback: () => void, options?: Options]
) {
  const callback = args[0]
  const options = (
    args.length === 2 || isTimeSignal(args[1]) ? (args[1] ?? 1) : { interval: args[1] ?? 1, delay: args[2] }
  ) as Options & { interval: TimeSignal }
  onMount(() => {
    if (options.delay) {
      setTimeoutWithSecondes(() => {
        const { cancel } = setInterval(callback, options)
        onCleanup(cancel)
      }, options.delay)
    } else {
      const { cancel } = setInterval(callback, options)
      onCleanup(cancel)
    }
  })
}
