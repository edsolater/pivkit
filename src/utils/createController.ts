import { MayFn, createObjectWhenAccess, isObject } from "@edsolater/fnkit"
import { RuntimeObjectOption, runtimeObject } from "../fnkit/runtimeObject"
import { ValidController } from "../piv"

/** even input () => Controller / Controller, it will always return Controller without invoke
 * just a wrapper of {@link createObjectWhenAccess}
 * @deprecated just use {@link createController} instead
 */
export function createController2<C extends ValidController>(creator: MayFn<C>): C {
  if (isObject(creator)) return creator as C
  return createObjectWhenAccess(creator) as C
}

export function createController<C extends ValidController>(
  creator: {
    [K in keyof C]?: C[K] | (() => C[K] | undefined)
  },
  options?: RuntimeObjectOption<C>,
): C {
  return runtimeObject(creator, options) as C
}
