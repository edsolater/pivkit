import { MayFn, MayPromise, shrinkFn } from '@edsolater/fnkit'
import { Accessor, createSignal } from 'solid-js'

export function createAsyncMemo<V>(asyncGetValue: () => MayPromise<V>): Accessor<V>
export function createAsyncMemo<V, F>(asyncGetValue: () => MayPromise<V>, fallbackValue: MayFn<F>): Accessor<V | F>
export function createAsyncMemo<V, F = undefined>(
  asyncGetValue: () => MayPromise<V>,
  fallbackValue?: MayFn<F>
): Accessor<undefined extends F ? V : V | F> {
  const [accessor, setter] = createSignal(shrinkFn(fallbackValue))
  Promise.resolve(asyncGetValue()).then((v) => setter(v as any))
  return accessor as any
}
