/**
 * @todo option:endUntil、option:eachMS、option:eachFrameCount
 */
export function requestLoopAnimationFrame(
  fn: (payloads: { pasedTime: number | undefined }) => void,
  options?: {
    /** if ture, cancel the frame loop */
    endUntil?: () => boolean
  },
) {
  let rAFId: number
  let prevTime: number | undefined = undefined
  const frameCallback = (...args: Parameters<FrameRequestCallback>) => {
    const [time] = args
    const pastTime = prevTime != null ? time - prevTime : undefined
    prevTime = time
    fn({ pasedTime: pastTime })
    rAFId = globalThis.requestAnimationFrame(frameCallback)
  }
  rAFId = globalThis.requestAnimationFrame(frameCallback)
  function getCurrentPastTime() {
    return prevTime
  }
  function cancel() {
    return globalThis.cancelAnimationFrame(rAFId)
  }
  function getAFId() {
    return rAFId
  }
  const manager = {
    get pastTime() {
      return getCurrentPastTime()
    },
    getCurrentPastTime,
    cancel,
    get rAFId() {
      return getAFId()
    },
    getAFId,
  }
  return manager
}
