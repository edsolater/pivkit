/**
 * easier to use than `setTimeout`
 */
export function promisedTimeout(ms: number) {
  let timeoutId: number | NodeJS.Timeout | undefined = undefined
  const detector = new Promise((resolve) => {
    timeoutId = setTimeout(resolve, ms)
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
