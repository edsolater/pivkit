import {
  isNumber,
  setTimeout,
  type SetTimeoutOptions,
  type TimeoutTaskFunction
} from "@edsolater/fnkit"

type Options = SetTimeoutOptions
export type TimeoutController = {
  run(): void
  cancel(): void
}

export function useTimeout(
  ...args: [callback: TimeoutTaskFunction, options?: Options] | [callback: TimeoutTaskFunction, delay?: number]
): TimeoutController {
  const callback = args[0]
  const options = (isNumber(args[1]) ? { delay: args[1] } : args[1]) ?? {}
  const { haveManuallyController, ...restOptions } = options

  const tools = {
    run(): void {
      throw new Error("runAction not ready yet")
    },
    cancel(): void {
      throw new Error("cancel not ready yet")
    },
  }

  const { run, cancel } = setTimeout(callback, restOptions)

  tools.cancel = cancel
  tools.run = run
  return tools
}
