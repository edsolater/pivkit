import { DeMayArray, DeMayFn, MayArray, MayFn, flap, shakeFalsy, shrinkFn } from "@edsolater/fnkit"

export type ElementRefs<HTMLEl extends HTMLElement = HTMLElement> = MayFn<MayArray<MayFn<HTMLEl | null | undefined>>>
export type GetElementsFromElementRefs<T extends ElementRefs> = NonNullable<DeMayFn<DeMayArray<DeMayFn<T>>>>

export function getElementFromRefs<R extends ElementRefs>(
  refs: R,
): (R extends ElementRefs<infer H> ? H : HTMLElement)[] {
  const deRef = <T>(n: T) => shrinkFn(n)
  // @ts-expect-error force
  return shakeFalsy(flap(deRef(refs)).map(deRef))
}
