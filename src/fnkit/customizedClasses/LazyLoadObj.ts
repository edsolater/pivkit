import { AnyFn, isFunction } from "@edsolater/fnkit"

/**
 *
 * can pretend an object, but will only access it when it's property accessed
 * can pretend a function, but will only access it when it's called
 */
export class LazyLoadObj<T extends object | AnyFn> {
  loadedTargetObject = undefined as T | undefined
  constructor(initObject?: T) {
    if (initObject) this.loadedTargetObject = initObject
  }
  load(determinedObject: T) {
    this.loadedTargetObject = determinedObject
  }
  hasLoaded() {
    return this.loadedTargetObject !== undefined
  }
  spawn() {
    const getLoadedObject = () => this.loadedTargetObject
    return new Proxy(() => {}, {
      get(target, p, receiver) {
        const determinedObject = getLoadedObject()
        if (!determinedObject) {
          throw new Error(`Facker's inner object is not loaded yet`)
        }
        return Reflect.get(determinedObject, p, receiver)
      },
      apply(target, thisArg, argArray) {
        const determinedObject = getLoadedObject()
        if (!determinedObject) {
          throw new Error(`Facker's inner object is not loaded yet`)
        }
        return isFunction(determinedObject) ? Reflect.apply(determinedObject, undefined, argArray) : determinedObject
      },
    }) as T
  }
}
