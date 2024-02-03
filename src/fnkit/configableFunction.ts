import { AnyFn, isObject, mergeObjects } from '@edsolater/fnkit'

export type ConfigableFunction<F extends AnyFn = AnyFn> = F & {
  /** inject params */
  config(): F
  config(arg1: Partial<Parameters<F>[0]>): F
  config(arg1: Partial<Parameters<F>[0]>, arg2: Partial<Parameters<F>[1]>): F
  config(arg1: Partial<Parameters<F>[0]>, arg2: Partial<Parameters<F>[1]>, arg3: Partial<Parameters<F>[2]>): F
  config(
    arg1: Partial<Parameters<F>[0]>,
    arg2: Partial<Parameters<F>[1]>,
    arg3: Partial<Parameters<F>[2]>,
    arg4: Partial<Parameters<F>[3]>
  ): F
  config(...args: Parameters<F>): F
}

/**
 * creator
 * can add parameter without invoke
 */
export function createConfigableFunction<F extends AnyFn>(
  coreFn: F,
  settings?: { defaultParams?: any[]; label?: symbol }
): ConfigableFunction<F> {
  /**
   * to without effect old params
   */
  function mergeParams(oldParams: any[], newParams: any[]) {
    const params = Array.from({ length: Math.max(oldParams.length, newParams.length) })
    for (let i = 0; i < params.length; i++) {
      params[i] =
        isObject(oldParams[i]) && isObject(newParams[i]) ? mergeObjects(oldParams[i], newParams[i]) : newParams[i]
    }
    return params
  }

  /**
   *
   * @param cachedParameters cached params
   * @returns proxied settings function
   */
  function createProxyWithCache(cachedParameters: any[]) {
    const settingsFunction = new Proxy(coreFn, {
      apply: (target, thisArg, argArray) => Reflect.apply(target, thisArg, mergeParams(cachedParameters, argArray)),
      get: (target, p, receiver) =>
        p === 'config'
          ? (...additionalParams: any[]) => createProxyWithCache(mergeParams(cachedParameters, additionalParams))
          : Reflect.get(target, p, receiver),
    }) as ConfigableFunction<F>

    if (settings?.label) Reflect.set(settingsFunction, settings.label, true)

    return settingsFunction
  }

  return createProxyWithCache(settings?.defaultParams?.slice() ?? [])
}

export function isSettingsFunction(v: any): v is ConfigableFunction {
  return Reflect.has(v, 'config')
}
