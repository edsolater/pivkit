import { DeMayArray, DeMayFn, MayArray, MayFn, arrify, shakeFalsy, shrinkFn } from "@edsolater/fnkit"

export type ElementRefs<HTMLEl extends HTMLElement = HTMLElement> = MayFn<MayArray<MayFn<HTMLEl | null | undefined>>>
export type ElementRef<HTMLEl extends HTMLElement = HTMLElement> = MayFn<MayFn<HTMLEl | null | undefined>>

export type GetElementsFromElementRefs<T extends ElementRefs> = NonNullable<DeMayFn<DeMayArray<DeMayFn<T>>>>
export type GetElementsFromElementRef<T extends ElementRef> = NonNullable<DeMayFn<T>>

export function getElementFromRefs<R extends ElementRefs>(
  refs: R,
): (R extends ElementRefs<infer H> ? H : HTMLElement)[] {
  const deRef = <T>(n: T) => shrinkFn(n)
  // @ts-expect-error force
  return shakeFalsy(arrify(deRef(refs)).map(deRef))
}
export function getElementFromRef<R extends ElementRef>(ref: R): R extends ElementRef<infer H> ? H : HTMLElement|undefined {
  // @ts-expect-error force
  return shrinkFn(ref)
}
