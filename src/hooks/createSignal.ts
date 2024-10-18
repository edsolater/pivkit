import { shrinkFn, wrapArr, type MayArray } from "@edsolater/fnkit"
import { Accessor, Setter, createSignal as createSolidjsSignal } from "solid-js"

type MayAccessor<V> = V | Accessor<V>

export type SignalPlugin<V> = () => {
  defaultValue?: (getOriginalValue: () => MayAccessor<V>) => () => MayAccessor<V>
  set?: (originalSet: Setter<V>) => Setter<V>
  get?: (originalGet: Accessor<V>) => Accessor<V>
}


/**
 * basic util: plugin can get multi features
 *
 * with plugin, options
 */
// TODO: haven't test
export function createSignal<V>(): [Accessor<V | undefined>, Setter<V | undefined>]
export function createSignal<V>(
  defaultValue: MayAccessor<V>,
  options?: { name?: string; plugins?: MayArray<SignalPlugin<V>> },
): [Accessor<V>, Setter<V>]
export function createSignal<V>(
  defaultValue?: MayAccessor<V | undefined>,
  options?: { name?: string; plugins?: MayArray<SignalPlugin<V | undefined>> },
): [Accessor<V | undefined>, Setter<V | undefined>] {
  //#region ---------------- plugin setting collector ----------------
  const defaultValueWrappers: Array<
    (getOriginalValue: () => MayAccessor<V | undefined>) => () => MayAccessor<V | undefined>
  > = []
  const setWrappers: Array<(originalSet: Setter<V | undefined>) => Setter<V | undefined>> = []
  const getWrappers: Array<(originalGet: Accessor<V | undefined>) => Accessor<V | undefined>> = []
  if (options?.plugins) {
    for (const plugin of wrapArr(options.plugins)) {
      const { defaultValue, set, get } = plugin()
      defaultValue && defaultValueWrappers.push(defaultValue)
      set && setWrappers.push(set)
      get && getWrappers.push(get)
    }
  }
  //#endregion

  //#region ---------------- accessor\setter collector ----------------
  const wrappedDefaultSignalValue = defaultValueWrappers.reduce(
    (acc, wrapper) => wrapper(acc),
    () => defaultValue,
  )
  const [get, set] = createSolidjsSignal(shrinkFn(wrappedDefaultSignalValue()))
  const wrappedGet = getWrappers.reduce((acc, wrapper) => wrapper(acc), get)
  const wrappedSet = setWrappers.reduce((acc, wrapper) => wrapper(acc), set)
  //#endregion

  return [wrappedGet, wrappedSet]
}
