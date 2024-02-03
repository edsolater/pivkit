import { Accessor, createSignal } from 'solid-js'

/** accept promise return a signal  */
export function useAsync<T, F>(promise: Promise<T>): Accessor<T | undefined>
export function useAsync<T, F>(promise: Promise<T>, fallbackValue: F): Accessor<T | F>
export function useAsync<T, F>(promise: Promise<T>, fallbackValue?: F): Accessor<unknown> {
  const [signal, setSignal] = createSignal(fallbackValue)
  promise.then(setSignal)
  return signal
}
