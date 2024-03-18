import { isArray, isFunction, isObject, isPrimitive, shrinkFn } from "@edsolater/fnkit"

type ObserveRule<T> =
  | {
      [K in keyof T]?: ObserveRule<T[K]>
    }
  | ((originalValue: T) => any)
  | T

/**
 * by Proxy \
 * observe user action towards the object|function \
 * it's a shortcut to create deepp proxyed object|function
 * 
 * when property is accessed, input rule will be invoked
 * TODO: this method should be tested 
 *
 * @param target the be observed
 * - if it's target is object, it will not replaced by rule, but recursively observe user operation
 * - if it's target is function, it will be replaced by rule, and recursively observe user operation
 *
 * @param options observe handler. handler's value can be any value or void
 * - else if it's void or function return void, it will not replace original result
 * - else if it's a value or function return value, it will replace original result
 *
 * @example
 * export const pd = observe( // tested
  {
    a: 1,
    b() {
      return 3
    },
    c: {
      d: 1,
      e: {
        f: 1,
      },
    },
    g() {
      return { h: 4 }
    },
  },
  {
    a: 2,
    b() {
      return (originalValue) => {
        console.log(`invoke b, originalValue is ${originalValue}`)
      }
    },
    c: {
      d: 3,
      e: {
        f: 4,
      },
    },
    g() {
      return {
        h: () => {
          console.log('invoke h')
          return 5
        },
      }
    },
  },
)

 */
export function observe<T>(target: T, rule?: ObserveRule<T>): T {
  if (!rule) return target

  if (isPrimitive(target)) {
    return shrinkFn(rule, [target]) ?? target
  } else if (isFunction(target)) {
    return new Proxy(target, {
      apply(target, thisArg, argArray) {
        if (isFunction(rule)) {
          const originalValue = Reflect.apply(target, thisArg, argArray)
          return observe(originalValue, rule(originalValue))
        } else {
          return rule ?? Reflect.apply(target, thisArg, argArray)
        }
      },
    })
  } else if (isObject(target) || isArray(target)) {
    return new Proxy(target, {
      get: (target, p, receiver) => observe(Reflect.get(target, p, receiver), rule?.[p]),
    })
  }
  return target
}
