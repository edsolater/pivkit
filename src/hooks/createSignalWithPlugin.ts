import { shrinkFn } from "@edsolater/fnkit"
import { Accessor, Setter, createSignal } from "solid-js"

export type SignalPlugin<V> = () => {
  defaultSignalValue?: (getOriginalValue: () => V | Accessor<V>) => () => V | Accessor<V>
  set: (originalSet: Setter<V>) => Setter<V>
  get: (originalGet: Accessor<V>) => Accessor<V>
}

/**
 * basic util: plugin can get multi features
 */
// TODO: haven't test
export function createSignalWithPlugin<V>(defaultValue: V | (() => V), options?: { plugins?: SignalPlugin<V>[] }) {
  const defaultSignalValueWrappers: ((getOriginalValue: () => V | Accessor<V>) => () => V | Accessor<V>)[] = []
  const setWrappers: ((originalSet: Setter<V>) => Setter<V>)[] = []
  const getWrappers: ((originalGet: Accessor<V>) => Accessor<V>)[] = []
  if (options?.plugins) {
    for (const plugin of options?.plugins) {
      const { defaultSignalValue, set, get } = plugin()
      defaultSignalValue && defaultSignalValueWrappers.push(defaultSignalValue)
      set && setWrappers.push(set)
      get && getWrappers.push(get)
    }
  }
  const wrappedDefaultSignalValue = defaultSignalValueWrappers.reduce(
    (acc, wrapper) => wrapper(acc),
    () => defaultValue,
  )
  const [get, set] = createSignal<V>(shrinkFn(wrappedDefaultSignalValue()))
  const wrappedGet = getWrappers.reduce((acc, wrapper) => wrapper(acc), get)
  const wrappedSet = setWrappers.reduce((acc, wrapper) => wrapper(acc), set)
  return [wrappedGet, wrappedSet] as const
}
