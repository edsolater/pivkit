import { isTimeSignal, setInterval, setTimeout, type IntervalTaskFunction, type TimeSignal } from "@edsolater/fnkit"
import { onCleanup, onMount } from "solid-js"

type Options = { interval?: TimeSignal; delay?: TimeSignal; immediate?: boolean }

/**
 * **DOM API (setInterval)**
 *
 * use seconds , not milliseconds \
 * will auto clear when component unmount
 */
export function useInterval(
  ...args:
    | [callback: IntervalTaskFunction, s?: TimeSignal, delay?: TimeSignal]
    | [callback: IntervalTaskFunction, options?: Options]
) {
  const callback = args[0]
  const options = (
    args.length > 2 || isTimeSignal(args[1]) ? { interval: args[1] ?? 1, delay: args[2] } : (args[1] ?? { interval: 1 })
  ) as Options & { interval: TimeSignal }
  onMount(() => {
    if (options.delay) {
      setTimeout(
        () => {
          const { cancel } = setInterval(callback, options)
          onCleanup(cancel)
        },
        { delay: options.delay },
      )
    } else {
      const { cancel } = setInterval(callback, options)
      onCleanup(cancel)
    }
  })
}
