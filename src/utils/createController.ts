import { MayFn, isObject } from "@edsolater/fnkit"
import { runtimeObjectFromAccess } from "../fnkit"
import { ValidController } from "../piv"
import { RuntimeObjectOption, runtimeObject } from "../fnkit/runtimeObject"

/** even input () => Controller / Controller, it will always return Controller without invoke
 * just a wrapper of {@link runtimeObjectFromAccess}
 * @deprecated just use {@link createController} instead
 */
export function createController2<C extends ValidController>(creator: MayFn<C>): C {
  if (isObject(creator)) return creator as C
  return runtimeObjectFromAccess(creator) as C
}

export function createController<C extends ValidController>(
  creator: {
    [K in keyof C]?: C[K] | (() => C[K] | undefined)
  },
  options?: RuntimeObjectOption<C>,
): C {
  return runtimeObject(creator, options) as C
}
