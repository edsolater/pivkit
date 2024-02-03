import { isObject, isObjectLike } from '@edsolater/fnkit'

/**
 * only walk through string enumtable object key (not symbol)
 */
export function walkThroughObject(
  obj: object,
  each: (info: {
    currentKey: keyof any
    /* path include self */
    keyPaths: (keyof any)[]
    /* path execpt self */
    parentPath: (keyof any)[]
    value: any
    /** when value is object or array, it's canDeepWalk */
    canDeepWalk: boolean
    /** only useful when canDeepWalk is true */
    needDeepWalk(needTo: boolean): void
  }) => void
) {
  function walk(obj: object, keyPaths: (keyof any)[] = []) {
    Object.keys(obj).forEach((key) => {
      const value = Reflect.get(obj, key)
      const isObjectValue = isObject(value) // by default, only object can deep walk
      let needDeepWalk = isObjectValue
      each({
        keyPaths: keyPaths.concat(key),
        parentPath: keyPaths,
        value,
        currentKey: key,
        canDeepWalk: isObjectValue,
        needDeepWalk(needTo: boolean) {
          needDeepWalk = needTo
        }
      })
      if (needDeepWalk) {
        walk(value, keyPaths.concat(key)) // go deep
      }
    })
  }
  walk(obj)
}

/**
 *
 * return first non-objectlike value
 * @param obj must be a objectlike value
 * @param path ['a','b','c']
 * @returns obj?.a?.b?.c
 */
export function getByPath(obj: object, path: (keyof any)[]): any {
  let current = obj
  for (const pathItem of path) {
    current = Reflect.get(current, pathItem)
    if (!isObjectLike(current)) break
  }
  return current
}

/**
 * if  path is not reachable, this will create a new literal object. see example for detail
 * @param obj
 * @param path
 * @param value
 * @returns
 * @example
 * const obj = {a:{b:{c:1}}}
 * setByPath(obj,['a','b','c'],2) // obj.a.b.c === 2
 * setByPath(obj,['a','newKey','d'],2) // obj --> {a: {b: {c: 1}, newKey: {d: 2}}}
 */
export function setByPath(
  obj: object,
  path: (keyof any)[],
  value: any,
  mergeRule: (prev: any, input: any) => any = () => value
): boolean {
  if (path.length === 0) return false
  if (path.length === 1) {
    const key = path[0]
    if (!key) return false
    return Reflect.set(obj, key, value)
  } else {
    try {
      recursiveSet(obj, path, value, mergeRule)
      return true
    } catch {
      return false
    }
  }
}

/** even not reachable will be ok
 *  used in {@link setByPath}
 */
function recursiveSet(obj: object, path: (keyof any)[], value: any, mergeRule: (prev: any, input: any) => any): object {
  if (!isObjectLike(obj)) return obj
  if (path.length === 0) return obj
  if (path.length === 1) {
    const pathKey = path[0]!
    const prevValue = Reflect.get(obj, pathKey)
    const mergedValue = mergeRule(prevValue, value)
    Reflect.set(obj, pathKey, mergedValue)
    return obj
  }
  const [currentKey, ...restPath] = path
  if (currentKey! in obj) {
    return recursiveSet(Reflect.get(obj, currentKey!), restPath, value, mergeRule)
  } else {
    Reflect.set(obj, currentKey!, recursiveSet({}, restPath, value, mergeRule))
    return obj
  }
}

export function hasByPath(obj: object, path: (keyof any)[]): boolean {
  const lastKey = path.pop()
  if (!lastKey) return false
  const targetObj = getByPath(obj, path)
  if (!isObjectLike(targetObj)) return false
  return Reflect.has(targetObj, lastKey)
}
