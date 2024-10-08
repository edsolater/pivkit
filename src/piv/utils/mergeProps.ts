import { AnyFn, AnyObj, arrify, isNonEmptyObject, isString, mergeObjects, switchCase } from "@edsolater/fnkit"
import { arriablePivPropsNames } from "../Piv"
import { ValidProps } from "../typeTools"
import { getKeys } from "./getKeys"

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

/** for piv's props */
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
  const props = arrify(propsObjs).filter(isNonEmptyObject)
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
    },
  ) as any
}

/**
 * use in mergeProps, core if merge props
 */
export function getPivPropsValue(objs: AnyObj[], key: keyof any) {
  return switchCase(
    key,
    [
      [
        "children",
        () => {
          for (let i = 0; i < objs.length; i++) {
            const v = objs[i]?.[key]
            if (v != null) return v
          }
        },
      ],
      [
        "innerController", // innerController is a mergable object
        () => mergeObjects(...objs.map((obj) => obj[key])),
      ],
      [
        (s) => isString(s) && (arriablePivPropsNames.includes(s as any) || s.startsWith("on")), // basic pivprops all support may array value
        () =>
          objs.reduce((finalValue, objB) => {
            const valueB = objB[key]
            return valueB && finalValue ? [finalValue, valueB].flat() : valueB ?? finalValue
          }, undefined as unknown),
      ],
    ],
    () => {
      for (let i = objs.length - 1; i >= 0; i--) {
        const v = objs[i]?.[key]
        if (v !== null && v !== undefined) return v
      }
    },
  )
}
