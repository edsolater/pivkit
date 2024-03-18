import { Accessor, createEffect, createSignal } from "solid-js"

/** accept promise return an accessor  */
export function usePromise<T, F = undefined>(promise: Accessor<Promise<T>>, fallbackValue?: F): Accessor<T | F> {
  const [accessor, set] = createSignal(fallbackValue)
  createEffect(() => {
    promise().then(set)
  })
  return accessor as Accessor<T | F>
}
