import { setTimeoutWithSecondes } from "@edsolater/fnkit"

/**
 * easier to use than `setTimeout`
 */
export function promisedTimeout(s: number) {
  let timeoutId: number | NodeJS.Timeout | undefined = undefined
  const detector = new Promise((resolve) => {
    timeoutId = setTimeoutWithSecondes(resolve, s)
  })
  const stop = () => {
    if (timeoutId) {
      clearTimeout(timeoutId as any)
      timeoutId = undefined
    }
  }
  Object.assign(detector, { timeoutId, stop })
  return detector
}
