import { isFunction, isNullish, isObject, isPrimitive, type AnyObj } from "@edsolater/fnkit"
import { produce } from "solid-js/store"

/**
 * it pass returned function to  setStore
 * use solidjs {@link produce} to merge new store
 */
export function createStoreSetter<T extends Record<string, any>>(newStorePieces: Partial<T>) {
  return produce((draft: AnyObj) => {
    Object.entries(newStorePieces).forEach(([propertyName, newValue]) => {
      const oldValue = draft[propertyName]
      if (oldValue === newValue) return
      const mergedValue = assignNewValue(oldValue, newValue)
      draft[propertyName] = mergedValue
    })
  })
}
/**
 * use old object's reference
 * @param oldValue may be mutated
 * @param newValue provide new values
 */
function assignNewValue(oldValue: unknown, newValue: unknown): unknown {
  if (isNullish(oldValue) || isPrimitive(oldValue)) return newValue
  if (isFunction(oldValue) && isFunction(newValue)) return newValue
  if (isObject(oldValue) && isObject(newValue)) {
    const newMutatedObj = mutateTwoObj(oldValue, newValue, assignNewValue)
    return newMutatedObj
  }
  return newValue
}
function mutateTwoObj<T extends object>(
  oldObj: T,
  newObj: Partial<T>,
  mutateFn?: (oldItem: unknown, newItem: unknown) => unknown,
): T {
  const result = oldObj
  Object.entries(newObj).forEach(([key, newValue]) => {
    const oldValue = oldObj[key]
    const mutatedValue = mutateFn ? mutateFn(oldValue, newValue) : newValue
    result[key] = mutatedValue
  })
  return result
}
