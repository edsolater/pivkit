import { AnyFn, createObjectFromGetters } from "@edsolater/fnkit"

export type DeAccessorObject<O extends Record<string, AnyFn>> = {
  [K in keyof O]: O[K] extends undefined ? undefined : ReturnType<NonNullable<O[K]>>
}

export function deAccessorObject<O extends Record<string, AnyFn>>(accessorObject: O): DeAccessorObject<O> {
  return createObjectFromGetters(accessorObject) as DeAccessorObject<O>
}
