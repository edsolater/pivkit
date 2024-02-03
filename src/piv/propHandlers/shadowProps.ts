import { AnyFn, MayArray, isArray, isObject, shakeNil } from '@edsolater/fnkit'
import { PivProps } from '../Piv'
import { omit } from '../utils'
import { getPivPropsValue } from '../utils/mergeProps'

export type PivShadowProps<OriginalProps> = MayArray<Partial<Omit<OriginalProps, 'as' | 'children'>>>

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

/** as will only calculate props when access, so, return verbose big object is ok */
export function handleShadowProps<P extends Partial<PivProps<any>>>(
  props: P,
  /** @deprecated no need,  */
  additionalShadowPropNames?: string[]
): Omit<P, 'shadowProps'> {
  if (!('shadowProps' in props)) return props

  const candidates = () => shakeNil([props].concat(props.shadowProps)) // 🚧 use cache will breake the solidjs's getter logic
  const getOwnKeys = createCachedFunction(() => {
    const keysArray = getNeedToMergeKeys(props)

    const keys = new Set(keysArray)
    const uniqueKeys = Array.from(keys)
    return { set: keys, arr: uniqueKeys }
  })

  return new Proxy(
    {},
    {
      get: (_target, key) => getPivPropsValue(candidates(), key),
      has: (_target, key) => getOwnKeys().set.has(key as string),
      set: (_target, key, value) => Reflect.set(_target, key, value),
      ownKeys: () => getOwnKeys().arr,
      // for Object.keys to filter
      getOwnPropertyDescriptor: (_target, key) => ({
        enumerable: true,
        configurable: true,
        get: () => getPivPropsValue(candidates(), key),
      }),
    }
  ) as any
}

function getNeedToMergeKeys(props: Partial<PivProps<any>>) {
  function getShadowPropKeys(props: Partial<PivProps<any>>): string[] {
    return isArray(props.shadowProps)
      ? props.shadowProps.flatMap((p) => (isObject(p) ? Object.getOwnPropertyNames(p) : []))
      : isObject(props.shadowProps)
        ? Object.getOwnPropertyNames(props.shadowProps)
        : []
  }
  const shadowKeys = getShadowPropKeys(props)
  const selfProps = Object.getOwnPropertyNames(omit(props, ['shadowProps']))
  return selfProps.concat(shadowKeys)
}
