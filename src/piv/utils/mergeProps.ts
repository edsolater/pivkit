import { AnyFn, AnyObj, flap, mergeFunction, shakeNil } from '@edsolater/fnkit'
import { ValidProps } from '../typeTools'
import { getKeys } from './getKeys'
import { mergeRefs } from './mergeRefs'

/**
 * invoke only once, return the cached result when invoke again
 */
//TODO: imply feature: same input have same output
// TEMP fnkit already have this function
function createCachedFunction<F extends AnyFn>(fn: F): F {
  let cachedResult: ReturnType<F> | undefined = undefined
  return function (...args: Parameters<F>) {
    if (cachedResult == null) {
      cachedResult = fn(...args)
    }
    return cachedResult
  } as F
}

export function mergeProps<P1 = ValidProps, P2 = ValidProps>(...propsObjs: [P1, P2]): Exclude<P1 & P2, undefined>
export function mergeProps<P1 = ValidProps, P2 = ValidProps, P3 = ValidProps>(
  ...propsObjs: [P1, P2, P3]
): Exclude<P1 & P2 & P3, undefined>
export function mergeProps<P1 = ValidProps, P2 = ValidProps, P3 = ValidProps, P4 = ValidProps>(
  ...propsObjs: [P1, P2, P3, P4]
): Exclude<P1 & P2 & P3 & P4, undefined>
export function mergeProps<P1 = ValidProps, P2 = ValidProps, P3 = ValidProps, P4 = ValidProps, P5 = ValidProps>(
  ...propsObjs: [P1, P2, P3, P4, P5]
): Exclude<P1 & P2 & P3 & P4 & P5, undefined>
export function mergeProps<P extends ValidProps | undefined>(...propsObjs: P[]): Exclude<P, undefined>
export function mergeProps<P extends ValidProps | undefined>(...propsObjs: P[]): Exclude<P, undefined> {
  // @ts-ignore
  if (propsObjs.length <= 1) return propsObjs[0] ?? {}
  // ready to parse
  const props = shakeNil(flap(propsObjs))
  // @ts-ignore
  if (props.length <= 1) return props[0] ?? {}

  const getOwnKeys = createCachedFunction(() => {
    const keysArray = getKeys(props)
    const keys = new Set(keysArray)
    return { set: keys, arr: keysArray }
  })

  return new Proxy(
    {},
    {
      get: (_target, key) => getPivPropsValue(props, key),
      has: (_target, key) => getOwnKeys().set.has(key as string),
      set: (_target, key, value) => Reflect.set(_target, key, value),
      ownKeys: () => getOwnKeys().arr,
      // for Object.keys to filter
      getOwnPropertyDescriptor: (_target, key) => ({
        enumerable: true,
        configurable: true,
        get() {
          return getPivPropsValue(props, key)
        },
      }),
    }
  ) as any
}

/**
 * use in mergeProps, core if merge props
 */
export function getPivPropsValue(objs: AnyObj[], key: keyof any) {
  switch (key) {
    // -------- specific --------
    // inside define's  children's priority is higher than outside define's
    case 'children':
      for (let i = 0; i < objs.length; i++) {
        const obj = objs[i]
        const v = obj?.[key]
        if (v != null) return v
      }

    // -------- pivprops --------
    case 'domRef':
      return objs.reduce((finalValue, objB) => {
        const valueB = objB[key]
        return valueB && finalValue ? mergeRefs(finalValue as any, valueB as any) : valueB ?? finalValue
      }, undefined as unknown)
    case 'class':
    case 'style':
    case 'icss':
    case 'htmlProps':
    case 'shadowProps':
    case 'plugin':
    case 'render:outWrapper':
      return objs.reduce((finalValue, objB) => {
        const valueB = objB[key]
        return valueB && finalValue ? [finalValue, valueB].flat() : valueB ?? finalValue
      }, undefined as unknown)
    // -------- normal props --------
    default: {
      // -------- 'merge:on' callback function --------
      if (key.toString().startsWith('merge:')) {
        return objs.reduce((finalValue, objB) => {
          const valueB = objB[key]
          return valueB && finalValue ? mergeFunction(finalValue, valueB) : valueB ?? finalValue
        }, undefined as unknown)
      } else {
        // -------- very normal props --------
        // outside define's props priority is higher than inside define's
        for (let i = objs.length - 1; i >= 0; i--) {
          const obj = objs[i]
          const v = obj?.[key]
          if (v != null) return v
        }
      }
    }
  }
}
