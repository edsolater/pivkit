import { CRef } from '../Piv'

export function mergeRefs<T = any>(...refs: (CRef<T> | null | undefined)[]): CRef<T> {
  return ((el) => {
    refs.forEach((ref) => ref?.(el))
  }) as CRef<T>
}
