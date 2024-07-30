import { getTime, setIntervalWithSecondes } from "@edsolater/fnkit"
import { createSignal, onCleanup, type Accessor } from "solid-js"

export function useLoopTask<R>({
  cb,
  delay = 1,
  immediate = true,
}: {
  cb: () => R
  delay?: number
  immediate?: boolean
}): {
  isRunning: Accessor<boolean>
  startLoop(): () => void // return stop action
  stopLoop(): void
  invokeOnce(): R
  lastInvokeTime: Accessor<number>
} {
  const [lastInvokeTime, setLastInvokeTime] = createSignal(0)
  const [isRunning, setIsRunning] = createSignal(false)
  let intervalId: any = null

  function startLoop() {
    if (isRunning()) return () => {}
    setIsRunning(true)
    intervalId = setIntervalWithSecondes(() => {
      invokeOnce()
    }, delay)
    if (immediate) {
      invokeOnce()
    }

    return stopLoop
  }

  function stopLoop() {
    setIsRunning(false)
    clearInterval(intervalId)
  }

  function invokeOnce() {
    setLastInvokeTime(getTime())
    return cb?.()
  }

  // stop loop when component unmount
  onCleanup(stopLoop)

  return {
    lastInvokeTime,
    invokeOnce,
    isRunning,
    startLoop,
    stopLoop,
  }
}
