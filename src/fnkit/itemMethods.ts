import { isArray, isIterable, isMap, isNumber, isObject, isSet, isUndefined, omit, pick } from '@edsolater/fnkit'

export type ItemList<T> =
  | Map<any, T>
  | Set<T>
  | T[]
  | Record<keyof any, T>
  | IterableIterator<T>
  | Iterable<T>
  | undefined
/** accept all may iterable data type */
export function toArray<T>(i: ItemList<T>) {
  if (isUndefined(i)) return []
  if (isMap(i)) return Array.from(i.values())
  if (isIterable(i)) return Array.from(i)
  return Object.values(i)
}

export function toMap<T>(i: ItemList<T>, key?: (item: T) => any) {
  if (isUndefined(i)) return new Map()
  if (isMap(i)) return i
  if (isArray(i)) return new Map(i.map((item) => [key?.(item) ?? item, item]))
  if (isSet(i)) return new Map([...i.values()].map((item) => [key?.(item) ?? item, item]))
  if (isIterable(i)) {
    const newMap = new Map()
    for (const item of i) {
      newMap.set(key?.(item) ?? item, item)
    }
    return newMap
  }
  return new Map(Object.entries(i))
}

export function toRecord<T, K extends keyof any>(i: ItemList<T>, key: (item: T, key: unknown) => K): Record<K, T> {
  if (isUndefined(i)) return {} as Record<K, T>
  if (isMap(i)) {
    const result = {} as Record<keyof any, T>
    for (const [k, v] of i.entries()) {
      result[key(v, k)] = v
    }
    return result
  }
  if (isArray(i)) {
    const result = {} as Record<keyof any, T>
    for (const [k, v] of i.entries()) {
      result[key(v, k)] = v
    }
    return result
  }
  if (isSet(i)) {
    const result = {} as Record<keyof any, T>
    let index = 0
    for (const item of i.values()) {
      result[key(item, index++)] = item
    }
    return result
  }
  if (isIterable(i)) {
    const result = {} as Record<keyof any, T>
    let index = 0
    for (const item of i) {
      result[key(item, index++)] = item
    }
    return result
  }
  return i
}

export function count(i: ItemList<any>) {
  if (isUndefined(i)) return 0
  if (isMap(i) || isSet(i)) return i.size
  if (isArray(i)) return i.length
  if (isIterable(i)) {
    let count = 0
    for (const _ of i) {
      count++
    }
    return count
  }
  return Object.keys(i).length
}

/**
 * get value of Itemsable, regardless of order
 */
export function get<T>(i: ItemList<T>, key: keyof any | undefined): T | undefined {
  if (isUndefined(i)) return undefined
  if (isUndefined(key)) return undefined
  if (isMap(i)) return i.get(key)
  if (isArray(i) && isNumber(key)) return i[key]
  if (isSet(i) && isNumber(key)) return [...i.values()][key]
  if (isIterable(i) && isNumber(key)) {
    let index = 0
    for (const item of i) {
      if (index === key) return item
      index++
    }
  }
  return i[key]
}

/**
 * get first value of Itemsable
 */
export function getByIndex(i: ItemList<any>, order: number) {
  if (isUndefined(i)) return undefined
  const key = isUndefined(i) || isArray(i) || isSet(i) || isIterable(i) ? order : Object.keys(i)[order]
  return get(i, key)
}

/**
 * like set/map's has, but can use for all Itemsable
 *
 */
export function hasValue<T>(i: ItemList<T>, item: T) {
  if (isUndefined(i)) return false
  if (isMap(i)) return new Set(i.values()).has(item)
  if (isArray(i)) return i.includes(item)
  if (isSet(i)) return i.has(item)
  if (isIterable(i)) {
    for (const _item of i) {
      if (_item === item) return true
    }
    return false
  }
  if (isObject(i)) {
    for (const _item of Object.values(i)) {
      if (_item === item) return true
    }
    return false
  }
  return false
}

/**
 * {@link hasValue} is for value, this is for key
 */
export function has<T>(i: ItemList<T>, key: any) {
  if (isUndefined(i)) return false
  if (isMap(i)) return i.has(key)
  if (isArray(i) && isNumber(key)) return i[key] !== undefined
  if (isSet(i) && isNumber(key)) return i.size > key
  if (isIterable(i) && isNumber(key)) {
    let index = 0
    for (const _ of i) {
      if (index === key) return true
      index++
    }
    return false
  }
  return i[key] !== undefined
}

export function slice<T extends ItemList<any>>(i: T, count?: number): T
export function slice<T extends ItemList<any>>(i: T, range?: [start: number, end?: number]): T
export function slice<T extends ItemList<any>>(i: T, num?: [start: number, end?: number] | number): T {
  if (num == null) return i
  const range = isArray(num) ? num : [0, num]
  if (isUndefined(i)) return i
  if (isMap(i)) return new Map([...i.entries()].slice(...range)) as T
  if (isArray(i)) return i.slice(...range) as T
  if (isSet(i)) return new Set([...i.values()].slice(...range)) as T
  if (isIterable(i)) {
    const result = new Set<T>()
    let index = 0
    for (const item of i) {
      if (index >= range[0] && (isUndefined(range[1]) || index < range[1])) {
        result.add(item)
      }
      index++
    }
    return result.values() as T
  } else {
    const newKeys = Object.keys(i).slice(...range)
    return pick(i, newKeys) as T
  }
}
