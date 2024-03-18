import { AnyObj, unifyItem } from "@edsolater/fnkit"

/**
 * will return a proxy to access only in runtime
 * @param original only accessed in runtime
 * @param shallowCopy only accessed in runtime
 * @returns a proxy
 */
export function objectMerge<T extends AnyObj>(...objects: [T]): T
export function objectMerge<T extends AnyObj, U extends AnyObj>(...objects: [T, U]): T & U
export function objectMerge<T extends AnyObj, U extends AnyObj, V extends AnyObj>(...objects: [T, U, V]): T & U & V
export function objectMerge<T extends AnyObj, U extends AnyObj, V extends AnyObj, W extends AnyObj>(
  ...objects: [T, U, V, W]
): T & U & V & W
export function objectMerge<T extends AnyObj, U extends AnyObj, V extends AnyObj, W extends AnyObj, X extends AnyObj>(
  ...objects: [T, U, V, W, X]
): T & U & V & W & X
export function objectMerge<
  T extends AnyObj,
  U extends AnyObj,
  V extends AnyObj,
  W extends AnyObj,
  X extends AnyObj,
  Y extends AnyObj,
>(...objects: [T, U, V, W, X, Y]): T & U & V & W & X & Y
export function objectMerge<
  T extends AnyObj,
  U extends AnyObj,
  V extends AnyObj,
  W extends AnyObj,
  X extends AnyObj,
  Y extends AnyObj,
  Z extends AnyObj,
>(...objects: [T, U, V, W, X, Y, Z]): T & U & V & W & X & Y & Z
export function objectMerge(...objects: AnyObj[]): AnyObj
export function objectMerge(...objects: AnyObj[]) {
  return new Proxy(createEmptyObjectWithSpecificKeys(getKeys(objects)), {
    get: (_target, key) => getValue(objects, key),
  }) as any
}

function createEmptyObjectWithSpecificKeys(keys: (keyof any)[]) {
  return Object.fromEntries(keys.map((key) => [key, undefined]))
}

function getKeys(objs: AnyObj[]) {
  return unifyItem(
    objs.flatMap((obj) => {
      const descriptors = Object.getOwnPropertyDescriptors(obj) // 🤔 necessary?
      return Reflect.ownKeys(descriptors)
    }),
  )
}

function getValue(objs: AnyObj[], key: keyof any) {
  for (const obj of objs) {
    if (key in obj) return obj[key]
    continue
  }
}

const a = objectMerge({ a: 1 }, { b: 2 }, { c: 3 })
