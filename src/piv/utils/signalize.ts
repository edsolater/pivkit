import { isFunction } from "@edsolater/fnkit"
import { SignalizeProps } from "../typeTools"

/** convert volue to accessor */
export function signalize<T extends object | undefined>(props: T): SignalizeProps<NonNullable<T>> {
  return new Proxy(props ?? {}, {
    get:
      (target, p, receiver) =>
      (...args: any[]) => {
        const value = Reflect.get(target, p, receiver)
        if (isFunction(value)) return value(...args)
        return value
      },
  }) as any
}
