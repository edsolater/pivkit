import { shrinkFn } from "@edsolater/fnkit"
import { Accessor, Setter, createSignal as createSolidjsSignal } from "solid-js"

export type SignalPlugin<V> = () => {
  defaultSignalValue?: (getOriginalValue: () => V | Accessor<V>) => () => V | Accessor<V>
  set: (originalSet: Setter<V>) => Setter<V>
  get: (originalGet: Accessor<V>) => Accessor<V>
}

/**
 * basic util: plugin can get multi features
 *
 * with plugin, options
 */
// TODO: haven't test
export function createSignal<V>(
  defaultValue: V | (() => V),
  options?: { name?: string; plugins?: SignalPlugin<V>[] },
): [Accessor<V>, Setter<V>] {
  //#region ---------------- plugin setting collector ----------------
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
  //#endregion

  //#region ---------------- accessor\setter collector ----------------
  const wrappedDefaultSignalValue = defaultSignalValueWrappers.reduce(
    (acc, wrapper) => wrapper(acc),
    () => defaultValue,
  )
  const [get, set] = createSolidjsSignal<V>(shrinkFn(wrappedDefaultSignalValue()))
  const wrappedGet = getWrappers.reduce((acc, wrapper) => wrapper(acc), get)
  const wrappedSet = setWrappers.reduce((acc, wrapper) => wrapper(acc), set)
  //#endregion

  return [wrappedGet, wrappedSet]
}
