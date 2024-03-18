import { AnyFn } from "@edsolater/fnkit"

/**
 *
 * callback mode is a too often used code mode
 * so, wrap it into a function is better
 */

export function callbackManager<CB extends AnyFn>() {
  const registedCallbacks: Set<CB> = new Set()

  function registerCallback(cb: CB) {
    registedCallbacks.add(cb)
    return {
      unregister() {
        registedCallbacks.delete(cb)
      },
    }
  }

  // Invokes all registered callbacks with the input params
  function invokeCallbacks(...params: Parameters<CB>) {
    registedCallbacks.forEach((cb) => cb(...params))
  }
  return { registerCallback, invokeCallbacks }
}
