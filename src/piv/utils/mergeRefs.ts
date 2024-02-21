import { CallbackRef } from '../Piv'

export function mergeRefs<T = any>(...refs: (CallbackRef<T> | null | undefined)[]): CallbackRef<T> {
  return ((el) => {
    refs.forEach((ref) => ref?.(el))
  }) as CallbackRef<T>
}
