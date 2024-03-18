import { AnyFn } from "@edsolater/fnkit"

/**
 *
 * can pretend an object, but will only access it when it's property accessed
 * can pretend a function, but will only access it when it's called
 */
export class Faker<T extends object | AnyFn> {
  loadedObject = {} as T
  constructor(initObject?: T) {
    if (initObject) this.loadedObject = initObject
  }
  load(determinedObject: T) {
    this.loadedObject = determinedObject
  }
  spawn() {
    const getLoadedObject = () => this.loadedObject
    return new Proxy(() => {}, {
      get(target, p, receiver) {
        const determinedObject = getLoadedObject()
        if (!determinedObject) {
          throw new Error(`can't access unloaded object`)
        }
        return Reflect.get(determinedObject, p, receiver)
      },
      apply(target, thisArg, argArray) {
        const determinedObject = getLoadedObject()
        if (!determinedObject) {
          throw new Error(`can't access unloaded object`)
        }
        return Reflect.apply(determinedObject as any, undefined, argArray)
      },
    }) as T
  }
}
