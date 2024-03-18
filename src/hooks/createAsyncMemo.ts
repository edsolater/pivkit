import { MayFn, MayPromise, shrinkFn } from "@edsolater/fnkit"
import { Accessor, createEffect, createSignal, on } from "solid-js"

export function createAsyncMemo<V>(asyncGetValue: () => MayPromise<V>): Accessor<V>
export function createAsyncMemo<V, F>(asyncGetValue: () => MayPromise<V>, fallbackValue: MayFn<F>): Accessor<V | F>
export function createAsyncMemo<V, F = undefined>(
  asyncGetValue: () => MayPromise<V>,
  fallbackValue?: MayFn<F>,
): Accessor<undefined extends F ? V : V | F> {
  const [accessor, setter] = createSignal(shrinkFn(fallbackValue))
  createEffect(
    on(asyncGetValue, () => {
      Promise.resolve()
        .then(() => asyncGetValue())
        .then((v) => setter(v as any))
    }),
  )
  return accessor as any
}
