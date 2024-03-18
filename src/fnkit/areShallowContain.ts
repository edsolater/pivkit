import { isArray, isObject } from "@edsolater/fnkit"

/**
 *
 * @example
 * areShallowContain({ a: 1, b: 2 }, { a: 1, b: 2 }) // => true (equal)
 * areShallowContain({ a: 1, b: 2 }, { a: 1, b: 2, c: 3 }) // => true (areShallowContain)
 * areShallowContain({ a: 1, b: 2, c: 3 }, { a: 1, b: 2 }) // => false
 * areShallowContain([1, 2], [1, 2, 3]) // => true (areShallowContain)
 * areShallowContain([1, 2, 3], [1, 2]) // => false
 * areShallowContain([1, 2, 3], [1, 2, 3]) // => true (equal)
 *
 */
export function areShallowContain(a: any, b: any): boolean {
  if (a === b) return true
  if (isArray(a) && isArray(b)) {
    const setB = new Set(b)
    return a.every((item) => setB.has(item))
  }
  if (isObject(a) && isObject(b)) {
    return Object.getOwnPropertyNames(a).every((key) => a[key] === b[key])
  }
  return false
}
