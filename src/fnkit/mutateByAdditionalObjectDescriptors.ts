import { map } from "@edsolater/fnkit"

/**
 * create an object by adding new descriptor getters and (optional) deleting properties.
 * this method will not access old object (by use `Object.getOwnPropertyDescriptors()` method)
 * @param obj - The old object.
 * @param descriptorSummery - An object containing the new getters and property names to be deleted.
 * @returns A new object with the mutated properties.
 */
export function mutateByAdditionalObjectDescriptors<T>(
  obj: T,
  descriptorSummery: {
    newGetters: {
      [K in keyof T]?: (obj: T) => any
    }
    deletePropertyNames?: (keyof T)[]
  },
): T {
  const newDescriptors: PropertyDescriptorMap = {
    ...Object.getOwnPropertyDescriptors(obj),
    ...map(descriptorSummery.newGetters, (getter, key) => {
      return {
        enumerable: true,
        configurable: true,
        get() {
          // @ts-ignore no need worry about it's type check
          const newValue = getter(obj)
          return newValue
        },
      }
    }),
  }
  if (descriptorSummery.deletePropertyNames) {
    for (const deletePropertyName of descriptorSummery.deletePropertyNames) {
      delete newDescriptors[deletePropertyName]
    }
  }

  const newProps = Object.defineProperties(newDescriptors, newDescriptors)
  return newProps as T
}
