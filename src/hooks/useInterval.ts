import {
  isTimeType,
  setInterval,
  type IntervalTaskFunction,
  type SetIntervalOptions,
  type TimeType,
} from "@edsolater/fnkit"
import { onCleanup, onMount } from "solid-js"

type Options = SetIntervalOptions

export type IntervalController = {
  run(): void
  cancel(): void
  forceRunNextLoop(): void
}
/**
 * **DOM API (setInterval)**
 *
 * use seconds , not milliseconds \
 * will auto clear when component unmount
 */
export function useInterval(
  ...args:
    | [callback: IntervalTaskFunction, s?: TimeType, delay?: TimeType]
    | [callback: IntervalTaskFunction, options?: Options]
): IntervalController {
  const callback = args[0]
  const options = (
    args.length > 2 || isTimeType(args[1]) ? { interval: args[1] ?? 1, delay: args[2] } : (args[1] ?? { interval: 1 })
  ) as Options & { interval: TimeType }

  const { haveManuallyController, ...restOptions } = options

  const tools = {
    run(): void {
      throw new Error("runAction not ready yet")
    },
    cancel(): void {
      throw new Error("cancel not ready yet")
    },
    forceRunNextLoop(): void {
      throw new Error("forceRunNextLoop not ready yet")
    },
  }

  onMount(() => {
    const { run, cancel, forceRunNextLoop } = setInterval(callback, { haveManuallyController, ...restOptions })
    onCleanup(cancel)
    tools.cancel = cancel
    tools.run = run
    tools.forceRunNextLoop = forceRunNextLoop
  })

  return tools
}
