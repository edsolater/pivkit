// FakeEmptyObject:
// can deep get it's property, it will always return another FakeEmptyObject

// TODO: should return a proxy to fake proxy

const fakeEmptyObjectBadge = Symbol('fakeEmptyObject')

export const injectToFakeEmptyObject = (fakeEmptyObject: object, realObject) => {}

const fakeSelfObject = new Proxy(
  { [fakeEmptyObjectBadge]: true },
  {
    get(target, p, receiver) {
      return fakeSelfObject
    },
    apply(target, thisArg, argArray) {
      return fakeSelfObject
    },
  }
)

export function isFakeEmptyObject(obj: any): boolean {
  return obj[fakeEmptyObjectBadge] === true
}

type FakeEmptyObject<T> = T extends object
  ? { [fakeEmptyObjectBadge]: true } & { [K in keyof T]: FakeEmptyObject<T[K]> }
  : { [fakeEmptyObjectBadge]: true }

/**!! not elegant */
export function createFakeEmptyObject<T extends object>(getRealObject?: () => T): FakeEmptyObject<T> {
  return new Proxy(
    {},
    {
      get(target, p, receiver) {
        const realObject = getRealObject?.()
        if (realObject && p in realObject) {
          return realObject[p]
        } else if (p === fakeEmptyObjectBadge) {
          return true
        } else {
          return createFakeEmptyObject(() => getRealObject?.()[p] ?? {})
        }
      },
    }
  ) as FakeEmptyObject<T>
}
