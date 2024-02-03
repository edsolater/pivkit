import { MayArray } from '@edsolater/fnkit'
import { OnFirstAccessCallback } from '../type'

/**
 * type utils function
 * not mind stright forward
 */
export function createOnFirstAccess<T extends Record<string, any>>(
  propertyName: MayArray<keyof T>,
  cb: OnFirstAccessCallback<T>
): { propertyName: MayArray<keyof T>; cb: OnFirstAccessCallback<T> } {
  return { propertyName, cb: cb as any /*  no need to check type here */ }
}
