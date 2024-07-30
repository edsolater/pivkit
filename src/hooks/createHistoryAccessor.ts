import { createTimeStamp, type TimeStamp } from "@edsolater/fnkit";
import { type Accessor, createEffect, createSignal, on } from "solid-js";

type History<T> = { value: T; stamp: TimeStamp }[]

/**
 *
 * @param toRecordAccessor
 * @returns history accessor
 */
export function createHistoryAccessor<T>(toRecordAccessor: Accessor<T>): Accessor<History<T>> {
  const [history, setHistory] = createSignal<History<T>>([])

  createEffect(
    on(toRecordAccessor, (value) => {
      setHistory((prev) => [...prev, { value, stamp: createTimeStamp() }])
    }),
  )

  return history
}

/**
 * utils of {@link History}
 */
export function useHistoryComparer<T, U>(
  historyA: Accessor<History<T>>,
  historyB: Accessor<History<U>>,
): { aIsNewer: Accessor<boolean> } {
  const [aIsNewer, setAIsNewer] = createSignal(false)
  function checkHistoryAIsNewer(historyA: History<T>, historyB: History<U>) {
    const lastA = historyA[historyA.length - 1]
    const lastB = historyB[historyB.length - 1]
    if (!lastA || !lastB) return
    setAIsNewer(lastA.stamp > lastB.stamp)
  }
  createEffect(on([historyA, historyB], ([a, b]) => checkHistoryAIsNewer(a, b)))
  return { aIsNewer }
}
