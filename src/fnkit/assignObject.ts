import { isObjectLike } from '@edsolater/fnkit'

/** shortcut of multi Reflect.set
 * @example
 * const obj = {b: 1}
 * const patcher = {a: 2, c: 'hello'}
 * const c = assignObject(obj, patcher) //=> {b: 1, a: 2, c: 'hello'}
 */
export function assignObject<T extends object>(obj: T, propertyPairs: object): T {
  assignObjectWithConfigs(obj, propertyPairs)
  return obj
}

type AttachFn = (payloads: {
  key: keyof any
  /** this maybe not obj */
  obj: object
  originalValueDescriptor: PropertyDescriptor | undefined
  patchValueDescriptor: PropertyDescriptor | undefined
}) => void

const simpleObectAssign = ({
  obj,
  key,
  originalValueDescriptor,
  patchValueDescriptor,
}: {
  key: keyof any
  /** this maybe not obj */
  obj: object
  originalValueDescriptor: PropertyDescriptor | undefined
  patchValueDescriptor: PropertyDescriptor | undefined
}) => {
  if (patchValueDescriptor) {
    Object.defineProperty(obj, key, patchValueDescriptor)
  } else {
    Reflect.deleteProperty(obj, key)
  }
}

/**
 * @todo move to fnkit
 * will not change the original object
 * @param originalObject
 * @param patchObject
 * @param attachRule
 * @returns void
 */

export function assignObjectWithConfigs<T extends object>(
  originalObject: T,
  patchObject: object,
  attachRule: AttachFn = simpleObectAssign
): T {
  Reflect.ownKeys(patchObject).forEach((key) => {
    const originalValueDescriptor = Object.getOwnPropertyDescriptor(originalObject, key)
    const patchValueDescriptor = Object.getOwnPropertyDescriptor(patchObject, key)
    const needGoDeep = isObjectLikeDiscriptor(originalValueDescriptor) && isObjectLikeDiscriptor(patchValueDescriptor)
    if (needGoDeep) {
      assignObjectWithConfigs(originalValueDescriptor.value, patchValueDescriptor.value, attachRule)
    } else {
      attachRule({ key, obj: originalObject, originalValueDescriptor, patchValueDescriptor })
    }
  })
  return originalObject
}

function isObjectLikeDiscriptor(value: any): value is PropertyDescriptor {
  return isObjectLike(value) && isObjectLike(value['value'])
}
