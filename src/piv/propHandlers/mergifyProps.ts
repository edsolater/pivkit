import { isArray, isString, shrinkFn, type AnyFn, type DeMayArray, type MayArray } from "@edsolater/fnkit"

export type PivkitCallback<F extends AnyFn | undefined> = MayArray<F>
export type DePivkitCallback<F> = DeMayArray<F>

export function invokePivkitCallback(
  callbacks: PivkitCallback<AnyFn | undefined> | undefined,
  params?: any[] | (() => any[]),
) {
  if (!callbacks) return
  if (isArray(callbacks)) {
    callbacks.forEach((cb) => (params ? cb?.(...shrinkFn(params)) : cb?.()))
  } else {
    if (params) {
      callbacks(params ? shrinkFn(params) : [])
    } else {
      callbacks()
    }
  }
}

export function turnPivkitCallbackToNormalCallback<F extends AnyFn>(callbacks: PivkitCallback<F>) {
  if (!callbacks) return undefined
  return (...params: Parameters<F>) => invokePivkitCallback(callbacks, params)
}

/** used in useKitProps */
export function handlePivkitCallbackProps(props: any) {
  return new Proxy(props, {
    get: (target, key) =>
      isString(key) && key.startsWith("on") ? turnPivkitCallbackToNormalCallback(target[key]) : target[key],
  }) as any
}

