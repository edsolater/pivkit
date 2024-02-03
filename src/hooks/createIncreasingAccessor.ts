import { createSignal, createEffect } from 'solid-js'

/**
 * **for debug**
 * n will increasing every second (in default, n start from 0)
 */
export function createIncresingAccessor(options?: { start?: number; eachTime?: number /* ms */ }) {
  const [increasing, setI] = createSignal(options?.start ?? 0)
  createEffect(() => {
    setInterval(() => {
      setI((s) => s + 1)
    }, options?.eachTime ?? 1000)
  })
  return increasing
}
