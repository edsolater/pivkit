/**
 * @todo option:endUntil、option:eachMS、option:eachFrameCount
 */
export function requestLoopAnimationFrame(
  fn: FrameRequestCallback,
  options?: {
    /** if ture, cancel the frame loop */
    endUntil?: () => boolean
    eachMS?: number
  }
) {
  let rAFId: number
  const frameCallback = (...args: Parameters<FrameRequestCallback>) => {
    fn(...args)
    globalThis.requestAnimationFrame(frameCallback)
  }
  rAFId = globalThis.requestAnimationFrame(frameCallback)
  return {
    rAFId() {
      return rAFId
    },
    cancel() {
      return globalThis.cancelAnimationFrame(rAFId)
    },
  }
}
