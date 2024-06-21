import { createSignal, createEffect } from "solid-js"

/**
 * **for debug**
 * n will increasing every second (in default, n start from 0)
 */
export function createIncreasingSeed(options?: {
  startFrom?: number
  step?: number /* default 1 */
  eachTime?: number /* ms */
}) {
  const [seed, setSeed] = createSignal(options?.startFrom ?? 0)
  createEffect(() => {
    setInterval(() => {
      setSeed((s) => s + 1)
    }, options?.eachTime ?? 1000)
  })
  return seed
}
