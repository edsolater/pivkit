import { isFunction } from "@edsolater/fnkit"

export function getLocalStorageValue<T = unknown>(key: string): T | undefined {
  const content = globalThis.localStorage.getItem(key)
  if (content) {
    return JSON.parse(content)
  }
  return undefined
}

export function setLocalStorageValue<T = unknown>(key: string, value: T | ((prev: T | undefined) => T)) {
  const prev = getLocalStorageValue<T>(key)
  const newValue = isFunction(value) ? value(prev) : value
  globalThis.localStorage.setItem(key, JSON.stringify(newValue))
}
