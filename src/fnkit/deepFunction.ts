import { AnyFn, AnyObj, createEmptyObjectByOlds, isObject, mergeObjects } from '@edsolater/fnkit'

type DeepFunctionFunctionPart<F extends AnyFn = AnyFn> = {
  (): DeepFunctionFunctionPart<F>
  (...args: [Partial<Parameters<F>[0]>]): DeepFunctionFunctionPart<F>
  (...args: [Partial<Parameters<F>[0]>, Partial<Parameters<F>[1]>]): DeepFunctionFunctionPart<F>
  (
    ...args: [Partial<Parameters<F>[0]>, Partial<Parameters<F>[1]>, Partial<Parameters<F>[2]>]
  ): DeepFunctionFunctionPart<F>
  (
    ...args: [Partial<Parameters<F>[0]>, Partial<Parameters<F>[1]>, Partial<Parameters<F>[2]>, ...any[]]
  ): DeepFunctionFunctionPart<F>
  (...args: any[]): DeepFunctionFunctionPart<F>
  [execSymbol]: F
}

export type DeepFunction<F extends AnyFn = AnyFn, P extends object | undefined = undefined> = P extends undefined
  ? DeepFunctionFunctionPart<F>
  : DeepFunctionFunctionPart<F> & P

export type MayDeepFunction<F extends AnyFn = AnyFn, P extends object | undefined = undefined> = DeepFunction<F, P> | F

// use symbol so user can assign any symbol he like
const execSymbol = Symbol('exec')

/**
 * creator
 * will auto-merge parameters according to their index
 */
export function deepFunction<F extends AnyFn, P extends object | undefined>(
  coreFn: F,
  obj?: P
): P extends undefined ? DeepFunction<F> : DeepFunction<F> & P {
  let innerParameters = [] as unknown as Parameters<F>
  const fnWithObj = obj ? Object.assign(coreFn, createEmptyObjectByOlds(obj)) : coreFn
  const deepFunction = new Proxy(fnWithObj, {
    apply(target, thisArg, argArray) {
      const additionalArgs = argArray
      additionalArgs.forEach((arg, index) => {
        if (arg === undefined) return
        const oldParam = innerParameters[index]
        if ((isObject(oldParam) || oldParam === undefined) && isObject(arg)) {
          innerParameters[index] = mergeObjects(oldParam, arg)
        } else {
          innerParameters[index] = arg
        }
      })
      return deepFunction
    },
    get(target, p, receiver) {
      if (p === execSymbol) return () => coreFn.apply(coreFn, innerParameters)
      return obj ? Reflect.get(obj, p, receiver) : Reflect.get(target, p, receiver)
    },
  }) as any
  return deepFunction
}

export function isDeepFunction(v: any): v is DeepFunction {
  return Reflect.has(v, execSymbol)
}

/**
 * consumer
 */
export function invokeDeepFunction<F extends AnyFn>(
  coreFn: DeepFunction<F>,
  parameters?: Parameters<F>
): ReturnType<F> {
  return parameters ? Reflect.get(coreFn, execSymbol)(...parameters) : Reflect.get(coreFn, execSymbol)()
}

/**
 * accept both **DeepFunction** and **NormalFunction**
 */
export function invoke<T extends DeepFunction | AnyFn>(
  fn: T,
  parameters?: Parameters<T>
): T extends DeepFunction ? ReturnType<T[typeof execSymbol]> : ReturnType<T> {
  return isDeepFunction(fn) ? invokeDeepFunction(fn, parameters) : parameters ? fn(...parameters) : fn()
}
