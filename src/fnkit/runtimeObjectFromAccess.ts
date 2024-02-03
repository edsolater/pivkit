/**
 * OnRunObject - a proxy object, which will only create the object when it's any property accessed
 * @param onAccess function to generate the object
 * @returns a proxy object, which will only create the object when it's property accessed
 */
export function runtimeObjectFromAccess<T extends object>(onAccess: () => T): T {
  let loadedTargetObject = undefined as T | undefined
  return new Proxy(
    {},
    {
      get(target, p, receiver) {
        if (!loadedTargetObject) {
          loadedTargetObject = onAccess()
        }
        return Reflect.get(loadedTargetObject!, p, receiver)
      },
      getOwnPropertyDescriptor(target, p) {
        if (!loadedTargetObject) {
          loadedTargetObject = onAccess()
        }
        return Reflect.getOwnPropertyDescriptor(loadedTargetObject!, p)
      },
      ownKeys(target) {
        if (!loadedTargetObject) {
          loadedTargetObject = onAccess()
        }
        return Reflect.ownKeys(loadedTargetObject!)
      },
      has(target, p) {
        if (!loadedTargetObject) {
          loadedTargetObject = onAccess()
        }
        return Reflect.has(loadedTargetObject!, p)
      },
      set(target, p, value, receiver) {
        if (!loadedTargetObject) {
          loadedTargetObject = onAccess()
        }
        return Reflect.set(loadedTargetObject!, p, value)
      },
    }
  ) as T
}
