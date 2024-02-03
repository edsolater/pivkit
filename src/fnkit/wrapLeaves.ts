import { cloneObject, isArray, isObject, isObjectLike, isObjectLiteral, switchCase } from '@edsolater/fnkit'

/**
 * array and objectLiteral will be wrapped to deeper
 *
 * when it'not leaf, and not objectLiteral or array, it will just returned directly
 * @param target must be objectLiteral
 * @param wrapFn
 * @returns
 * @todo move to fnkit . use proxy to fasten
 * @deprecated why not just use {@link createFakeTree}
 */
export function wrapLeaves<Result = any>(
  target: any,
  options: {
    /* leaf will not be array or objectLiteral */
    wrap: (leaf: any) => any
    /** @default  func `(node) => (!isArray(node) && !isObjectLiteral(node)) || isWrappedLeaf(node)` */
    targetIsLeaf?: (node: any) => boolean
    onWrapLeaf?: (value: any) => void
    onWrapperDeepObjectLiteral?: (key: keyof any) => void
  }
): Result {
  const cache = cloneObject(target)
  const targetIsLeaf = options.targetIsLeaf ?? ((node) => !isArray(node) && !isObjectLiteral(node))
  const setCache = (wrappedValue: any) => {
    Object.entries(wrappedValue).forEach(([key, value]) => {
      cache[key] = value
    })
  }
  return _wrapLeaves({
    target,
    wrapFn: options.wrap,
    targetIsLeaf,
    cacheFragnement: cache,
    cacheSetter: setCache,
    onWrapLeaf: options.onWrapLeaf,
    onWrapperDeepObjectLiteral: options.onWrapperDeepObjectLiteral,
  })
}

/** a data structure to store value */
type WrappedLeaf = {
  _isWrappedLeaf: true
  value: any
}
function isWrappedLeaf(v: any): v is WrappedLeaf {
  return isObject(v) && (v as any)._isWrappedLeaf
}
function makeWrappedLeaf(v: any): WrappedLeaf {
  return { _isWrappedLeaf: true, value: v }
}
function pickValueFromWrappedLeaf(v: any): any {
  return isWrappedLeaf(v) ? v.value : v
}

/**
 * only used in {@link wrapLeaves}
 * @param target any type
 * @param wrapFn
 * @returns
 * @todo move to fnkit . use proxy to fasten
 */
function _wrapLeaves<Result = any>({
  target,
  wrapFn,
  targetIsLeaf,
  cacheFragnement,
  cacheSetter,
  onWrapLeaf,
  onWrapperDeepObjectLiteral,
}: {
  target: any /* leaf will not be array or objectLiteral */
  wrapFn: (leaf: any) => any
  targetIsLeaf: (node: any) => boolean
  cacheFragnement: any
  cacheSetter: (wrappedValue: any) => void
  onWrapLeaf?: (value: any) => void
  onWrapperDeepObjectLiteral?: (key: keyof any) => void
}): Result {
  return switchCase(
    target,
    [
      [
        (t) => targetIsLeaf(t),
        (target: any) => {
          onWrapLeaf?.(target)
          return isWrappedLeaf(cacheFragnement)
            ? pickValueFromWrappedLeaf(cacheFragnement)
            : pipeline(wrapFn(target), makeWrappedLeaf, cacheSetter, pickValueFromWrappedLeaf)
        },
      ],
      [
        (t) => isObjectLike(t),
        (target) => {
          onWrapperDeepObjectLiteral?.(target)
          return new Proxy(target, {
            get: (target, key) => {
              // record
              if (key === Symbol.for('raw')) return target
              return _wrapLeaves({
                target: target[key],
                wrapFn,
                targetIsLeaf,
                cacheFragnement: cacheFragnement[key],
                cacheSetter: (propertyValue) => {
                  Reflect.set(cacheFragnement, key, propertyValue)
                },
              })
            },
          })
        },
      ],
    ],
    () => target
  )
}

/** get raw data before wrap Leaves */
export function unwrapWrappedLeaves<Result = any>(target: any): Result {
  return target[Symbol.for('raw')] ?? target
}
/**
 * FP utils : give opportunity to handle/change value in parallel
 *
 * always return v
 *
 * @param v input value
 * @param handlers opportunity to change value or just do something
 * @returns handled v / original v (depend on handlers)
 * @todo already have move to fnkit
 */
function pipeline<T>(v: T, ...handlers: ((v: T) => undefined | any)[]): any {
  return handlers.reduce((v, handler) => handler(v) ?? v, v)
}

/** travel all properties to get real object instead of proxy wrapper */
function deProxy<T>(proxy: T): T {
  if (isObject(proxy)) {
    // @ts-ignore any
    return Object.fromEntries(Object.entries(proxy).map(([key, value]) => [key, deProxy(value)]))
  } else {
    return proxy
  }
}
