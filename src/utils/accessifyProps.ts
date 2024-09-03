import {
  AnyFn,
  AnyObj,
  changeObjectValue,
  getPromiseDefault,
  isFunction,
  isObject,
  isPromise,
  isString,
  type MayPromise,
} from "@edsolater/fnkit"
import type { DePivkitCallback, PivkitCallback } from "../piv/propHandlers/mergifyProps"
import type { ValidController } from "../piv/typeTools"

export type Accessify<V, Controller extends ValidController | unknown = unknown> = V | ((controller: Controller) => V)
export type DeAccessify<V> = V extends AnyFn ? ReturnType<V> : V
// Accessify + Promisify
export type Kitify<V, Controller extends ValidController | unknown = unknown> = Accessify<MayPromise<V>, Controller>
// Accessify + Promisify
export type DeKitify<V> = Awaited<DeAccessify<V>>
/**
 * propertyName start with 'on' or end with 'Fn' will treate as origin
 */
export type KitifyProps<P extends AnyObj, Controller extends ValidController | unknown = unknown> = {
  [K in keyof P]: K extends `on${string}` // callback onXXX should no auto-accessified
    ? PivkitCallback<P[K]>
    : K extends
          | `define${string}` // renderXXX should no auto-accessified, if need pass subcomponent and have controller, just pass Captilazed prop name like Dot={}
          | `${string}:${string}` // any namespaced props should no auto-accessified
          | `domRef`
          | `ref`
          | `controllerRef`
          | "children"
      ? P[K]
      : P[K] extends AnyFn | undefined
        ? P[K]
        : Kitify<P[K], Controller>
}

export type DeKitifyProps<P> = {
  [K in keyof P]: K extends `on${string}` // callback onXXX should no auto-accessified
    ? DePivkitCallback<P[K]>
    : K extends
          | `define${string}` // renderXXX should no auto-accessified
          | `${string}:${string}` // any namespaced props should no auto-accessified
          | `domRef`
          | `ref`
          | `controllerRef`
          | "children"
      ? P[K]
      : DeKitify<P[K]> // <-- bug here, type error
}

// type C = KitProps<{ onCb: (util: { say: "hello" }) => void }>
// type D = DeKitProps<C>["onCb"]
// type E = C["onCb"]

/**
 * propertyName start with 'on' will treate as function
 *
 * core of {@link useKitPropParser} and {@link useKitProps}
 */
export function deKitifyProps<P extends AnyObj, Controller extends ValidController | unknown = unknown>(options: {
  props: P
  controller?: Controller
  needAccessifyProps?: string[]
  debug?: boolean
  onPromise?(params: { key: keyof any; defaultValue: any; onResolve: (cb: (v: any) => void) => void }): void
}): DeKitifyProps<P> {
  return changeObjectValue(options.props, ({ originalValue, key }) => {
    const isPreferOriginalValue =
      isString(key) &&
      ((options.needAccessifyProps ? !options.needAccessifyProps?.includes(key) : false) ||
        key.startsWith("on") ||
        key.startsWith("define") ||
        key.startsWith("merge:") ||
        key === "domRef" ||
        key === "ref" ||
        key === "controllerRef" ||
        key === "plugin" ||
        key === "shadowProps")
    const needAccessify = isFunction(originalValue) && !isPreferOriginalValue
    const mayPromiseValue = needAccessify ? originalValue(options.controller) : originalValue
    if (isPromise(mayPromiseValue)) {
      let resolveCallback: ((v: any) => void) | undefined = undefined
      const registResolveCallback = (cb: (v: any) => void) => {
        resolveCallback = cb
      }
      const invokeResolveCallback = (v: any) => {
        resolveCallback?.(v)
      }
      mayPromiseValue.then((resolvedValue) => {
        invokeResolveCallback(resolvedValue)
      })
      const promiseDefaultValue = getPromiseDefault(
        mayPromiseValue, // this value is a promise
      )
      options.onPromise?.({ key, defaultValue: promiseDefaultValue, onResolve: registResolveCallback })
      return promiseDefaultValue
    } else {
      return mayPromiseValue // this value is not a promise
    }
  }) as DeKitifyProps<P>
}

export function fixFunctionParams<F extends AnyFn, P extends any[] = Parameters<F>>(originalFn: F, preParams: P): F {
  // @ts-expect-error no need to check
  return {
    [originalFn.name]: (...args: unknown[]) => originalFn(...shallowMergeTwoArray(preParams, args)),
  }[originalFn.name]
}

export function deAccessify<V>(v: Accessify<V, any>, controller?: object): V {
  return isFunction(v) ? v(controller) : v
}

// TODO: move to fnkit
function shallowMergeTwoArray(old: any[], arr2: any[]) {
  return Array.from({ length: Math.max(old.length, arr2.length) }, (_, i) => {
    const va = old[i]
    const vb = arr2[i]
    if (isObject(va) && isObject(vb)) {
      return { ...va, ...vb }
    } else {
      return vb ?? va
    }
  })
}
