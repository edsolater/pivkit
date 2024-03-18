import { AnyFn, MayArray, MayPromise, flap, shakeUndefinedItem } from "@edsolater/fnkit"
import { delayDo } from "./invokeInMicroTaskLoop"

interface CallbackStore<Callback extends AnyFn> {
  invoke(...params: Parameters<Callback>): void
  addListener(cb: Callback): {
    remove(): void
  }
  releaseStored(): void
  /** or you can just use property:{@link addListener}'s returned remove method, same */
  removeListener(cb: Callback): void
}

/**
 * util for handle Callbacks faster\
 *  will attach onCleanUp in first param of callback, if it is object or undefined
 * */
export function createCallbacksStore<Callback extends (...params: any[]) => void | (() => void)>(options?: {
  initCallbacks?: MayArray<Callback | undefined>
}): CallbackStore<Callback> {
  const registeredCallbacks = options?.initCallbacks
    ? new Set<Callback>(shakeUndefinedItem(flap(options.initCallbacks)))
    : new Set<Callback>()
  const registeredCleanFn = new WeakMap<Callback, MayPromise<(() => void) | void>>()
  /** don't need to worry about callback registed multi times, will invoke in micro  */
  function invoke(...params: Parameters<Callback>) {
    registeredCallbacks.forEach((cb) => {
      const prevCleanFn = registeredCleanFn.get(cb)
      Promise.resolve(prevCleanFn).then((cleanFn) => cleanFn?.())
      const cleanFn = delayDo(() => cb(...params), { taskKey: cb })
      if (cleanFn) {
        registeredCleanFn.set(cb, cleanFn)
      }
    })
  }
  function addListener(cb: Callback) {
    registeredCallbacks.add(cb)
    return {
      remove() {
        removeListener(cb)
      },
    }
  }
  function releaseStored() {
    registeredCallbacks.clear()
  }
  /** or you can just use {@link addListener}'s returned remove method, same */
  function removeListener(cb: Callback) {
    registeredCallbacks.delete(cb)
  }
  return { invoke, addListener, releaseStored, removeListener }
}

/**
 * like {@link createCallbacksStore}, but have key(currently must be string)
 */
export function createCallbacksStoreWithKeys<Key extends keyof any, Callback extends AnyFn>(options?: {
  initCallbacks?: {
    [K in Key]?: MayArray<Callback | undefined>
  }
}) {
  const registeredCallbacks = (
    options?.initCallbacks
      ? new Map(
          Object.entries(options.initCallbacks).map(([k, mcb]) => [
            k as Key,
            createCallbacksStore({ initCallbacks: mcb as MayArray<Callback | undefined> }),
          ]),
        )
      : new Map()
  ) as Map<Key, CallbackStore<Callback>>

  function invoke(propertyName: Key) {
    return (...params: Parameters<Callback>) => {
      const callbackStore = registeredCallbacks.get(propertyName)
      callbackStore?.invoke(...params)
    }
  }

  function addListener(propertyName: Key) {
    return (cb: Callback) => {
      if (!registeredCallbacks.has(propertyName)) {
        registeredCallbacks.set(propertyName, createCallbacksStore<Callback>())
      }
      const cbs = registeredCallbacks.get(propertyName)!
      return cbs.addListener(cb)
    }
  }

  function releaseStored() {
    registeredCallbacks.clear()
  }

  /** or you can just use {@link addListener}'s returned remove method, same */
  function removeListener(propertyName: Key) {
    return (cb: Callback) => {
      registeredCallbacks.get(propertyName)?.removeListener(cb)
    }
  }

  return { invoke, addListener, releaseStored, removeListener }
}
