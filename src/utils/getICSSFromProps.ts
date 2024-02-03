/**
 * @example
 * getICSSFromProps({ 'icss:gap': '3px', item: 'center' }) //=> { gap: '3px' }
 */
export function getICSSFromProps<O extends object>(props: O) {
  let keys: Set<string | symbol> | undefined = undefined
  let keysArray: (string | symbol)[] | undefined = undefined

  function getOwnKeys() {
    if (!keys || !keysArray) {
      keysArray = getICSSKeys(props)
      keys = new Set(keysArray)
    }
    return { set: keys, arr: keysArray }
  }

  return new Proxy(
    {},
    {
      get: (_, key) => props[`icss:${String(key)}`],
      set: (_target, key, value) => Reflect.set(props, `icss:${String(key)}`, value),
      has: (_target, key) => getOwnKeys().set.has(`icss:${String(key)}`),
      getPrototypeOf: () => Object.getPrototypeOf(props),
      ownKeys: () => getOwnKeys().arr,
      // for Object.keys to filter
      getOwnPropertyDescriptor: (_target, key) => Reflect.getOwnPropertyDescriptor(props, `icss:${String(key)}`),
    }
  ) as GetStartWithICSS<O>
}
function getICSSKeys(props: object): string[] {
  return Object.keys(props)
    .filter((key) => key.startsWith('icss:'))
    .map((key) => key.slice('icss:'.length))
}
type GetStartWithICSS<T extends object> = {
  [K in keyof T as K extends `icss:${infer R}` ? R : never]: T[K]
}
