import { isFunction, isString, shrinkFn } from "@edsolater/fnkit"

const clearMap = (resultMap: Map<any, any>) => resultMap.clear()
// register clean up function
const mapClearRegistry = new FinalizationRegistry(clearMap)

export type RuntimeObjectOption<T extends object> = {
  /**
   * if you want to cache some value, you should use this option to avoid running the rule again\
   * cached value will not calc twice
   * @deprecated not strightforward
   */
  cachableKeys?: (keyof T)[]
  /**
   * if you want to use a function as value, you should use this option to avoid the function be shrinked
   */
  originMethods?: (keyof T | ((skey: keyof any) => boolean))[]
}

/**
 * only run when value is accessed
 *
 * should want define a lazy property A, should use a function return the value A \
 * by default , this method doesn't accept function as value, but you can use this method's option:originMethods to avoid
 * @example
 * const obj = runtimeObj({
 *   a: 1,
 *   b: () => {
 *     console.log('hello')
 *     return 2
 *   },
 *   c: () => {
 *     console.log('hi')
 *     return 3
 *   },
 * })
 *
 * obj.b.then(console.log) // 'hello', 2
 */
export function runtimeObject<T extends object>(
  objWithRule: {
    [K in keyof T]?: T[K] | (() => T[K] | undefined)
  },
  options?: RuntimeObjectOption<T>,
): T {
  let cache: undefined | Map<any, any> = undefined
  const needCache = (p: keyof any) => options?.cachableKeys?.includes(p as any)
  const hasCached = (p: keyof any) => cache && cache.has(p)
  const getCached = (p: keyof any) => cache?.get(p)
  const setCached = (weakKey: WeakKey, p: keyof any, value: any) => {
    if (!cache) {
      cache = new Map()
      // clear if the object is garbage collected
      mapClearRegistry.register(weakKey, cache)
    }
    cache.set(p, value)
  }
  const clearCache = () => cache?.clear()

  const justUseOriginValue = (p: keyof any) =>
    options?.originMethods?.some((rule) => (isFunction(rule) ? rule(p) : Object.is(rule, p)))

  const parsedObj = new Proxy(objWithRule, {
    get(target, p, receiver) {
      if (p === Symbol.dispose) return clearCache
      if (needCache(p) && hasCached(p)) return getCached(p)
      const mayRuledValue = Reflect.get(target, p, receiver)
      const originalReturnValue = justUseOriginValue(p) ? mayRuledValue : shrinkFn(mayRuledValue)
      if (needCache(p)) setCached(parsedObj, p, originalReturnValue) // cache value
      return originalReturnValue
    },
    set(target, p, newValue, receiver) {
      if (needCache(p)) setCached(parsedObj, p, newValue)
      return Reflect.set(target, p, newValue, receiver)
    },
  }) as T
  return parsedObj
}
