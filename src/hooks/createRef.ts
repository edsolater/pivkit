import { Accessor, createSignal, untrack } from "solid-js"
import { ValidController } from "../piv"
import { isExist } from "@edsolater/fnkit"

export type CreateCallbackRefOptions<T> = {
  defaultValue?: T
  onAttach?: (current: T) => void
  onDetach?: () => void
  onChange?: (current: T, prev: Accessor<T | undefined>) => void
}

export type CreateCallbackRefOptions2<T> = {
  defaultValue: T
  onAttach?: (current: T) => void
  onDetach?: () => void
  onChange?: (current: T, prev: Accessor<T>) => void
}

/** for semantic API is like `createSignal()`  */
export function createRef<T extends HTMLOrSVGElement | ValidController = any>(
  options: CreateCallbackRefOptions2<T>,
): [ref: Accessor<T>, setRef: (el: T) => void]

export function createRef<T extends HTMLOrSVGElement | ValidController = any>(
  options?: CreateCallbackRefOptions<T>,
): [ref: Accessor<T | undefined>, setRef: (el: T) => void]

export function createRef<T extends HTMLOrSVGElement | ValidController = any>(
  options?: CreateCallbackRefOptions<T>,
): [ref: Accessor<T | undefined>, setRef: (el: T) => void] {
  const [ref, _setRef] = createSignal(options?.defaultValue)
  function setRef(value: T) {
    if (isExist(value)) {
      if (isExist(value)) options?.onAttach?.(value)
      if (!isExist(value)) options?.onDetach?.()
      options?.onChange?.(value, ref)
    } else {
      options?.onDetach?.()
    }
    _setRef(() => value as T)
  }
  return [ref, setRef]
}
