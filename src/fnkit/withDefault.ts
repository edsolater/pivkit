import { MayFn, shrinkFn } from '@edsolater/fnkit'

/**
 * just like js:`??` operator
 * but use this may have to use `;`, which is very urgly
 * @param value
 * @param defaultValue
 */
export function withDefault<T>(value: MayFn<T | undefined>, defaultValue: MayFn<T>): NonNullable<T> {
  return (shrinkFn(value) ?? shrinkFn(defaultValue)) as NonNullable<T>
}
