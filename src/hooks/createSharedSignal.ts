import { Signal, SignalOptions, createSignal } from "solid-js"

const innerSharedSignalStore = new Map<string | number | symbol, Signal<any>>()
/** can share accross different component */
export function createSharedSignal<T>(key: string | number | symbol): Signal<T | undefined>
export function createSharedSignal<T>(key: string | number | symbol, value: T, options?: SignalOptions<T>): Signal<T>
export function createSharedSignal<T>(key: string | number | symbol, value?: T, options?: SignalOptions<T>) {
  if (innerSharedSignalStore.has(key)) {
    return innerSharedSignalStore.get(key)
  } else {
    const newSignal = (value ? createSignal(value, options) : createSignal()) as Signal<unknown>
    // record to store
    innerSharedSignalStore.set(key, newSignal)
    return newSignal
  }
}
