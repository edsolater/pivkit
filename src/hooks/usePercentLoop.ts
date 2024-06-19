import { createSignal, onCleanup, onMount, type Accessor } from "solid-js"
import { useLoopTask } from "./useLoopTask"

/**
 * 0 ~ 1
 * mainly for {@link ../components/CircularProgress | CircularProgress}
 * @todo is it possible to use css not js thread?
 */
export function usePercentLoop({
  canRoundCountOverOne,
  onRoundEnd,
  eachSecondPercent = 1 / 10,
  updateEach = 1000,
}: {
  updateEach?: number // default 1000ms
  canRoundCountOverOne?: boolean
  onRoundEnd?: () => void
  eachSecondPercent?: number
} = {}): {
  percent: Accessor<number>
  reset: () => void
} {
  const [percent, setPercent] = createSignal(0) // 0 ~ 1

  const { startLoop, stopLoop } = useLoopTask({
    cb: () => {
      setPercent((percent) => {
        const nextPercent = percent + eachSecondPercent / (updateEach / 1000)
        if (nextPercent >= 1) {
          if (canRoundCountOverOne) {
            onRoundEnd?.()
            return 0
          } else {
            return 1
          }
        } else {
          return nextPercent
        }
      })
    },
    delay: updateEach,
  })

  onMount(() => {
    startLoop()
    onCleanup(stopLoop)
  })

  return {
    percent,
    reset() {
      setPercent(0)
    },
  }
}


