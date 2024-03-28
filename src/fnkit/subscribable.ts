import { createEventCenter } from "@edsolater/fnkit"

type Subscribable<T> = {
  /**
   * get current state
   * can also just access property:value. `state.value`
   */
  (): T
  /**
   * get current state
   * can also just invoke this state. `state()`
   */
  value: T

  /** used by consumer */
  subscribe(cb: (newValue: T) => void): { unsubscribe(): void }

  clear(): void

  /** used by provider */
  emitValue(newValue: T | ((prev: T) => T)): void

  [Symbol.toPrimitive](hint: "number" | "string" | "default"): T | null
}

/**
 * hold value, so can subscribe it's change
 */
export function subscribable<T>(): Subscribable<T | undefined>
export function subscribable<T>(defaultValue: T): Subscribable<T>
export function subscribable<T>(defaultValue?: T): Subscribable<any> {
  let innerValue = defaultValue
  const eventCenter = createEventCenter<{
    value: [v: T]
  }>()
  const state = Object.assign(() => innerValue, {
    subscribe(cb: (newValue: T) => void) {
      return eventCenter.on("value", cb)
    },
    clear() {
      eventCenter.clear("value")
    },
    emitValue(newValue: T | ((prev: T) => T)) {
      if (typeof newValue === "function") {
        innerValue = (newValue as (prev: T) => T)(innerValue as T)
      } else {
        innerValue = newValue
      }
      eventCenter.emit("value", [innerValue])
    },
    get value() {
      return innerValue
    },

    [Symbol.toPrimitive]() {
      return innerValue
    },
  })
  return state
}
