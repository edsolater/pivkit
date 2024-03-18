/**
 *
 * type key array: (keyof any)[] into an string
 * @todo into a symbol
 * @todo should accept object also , not just string | number | symbol
 *
 * @example
 * parseShallowKeyFromArray([2, 3, 4]) === parseShallowKeyFromArray([2, 3, 4])
 * @see
 * https://github.dev/bloomberg/record-tuple-polyfill/blob/5f9cae34f0d331c4836efbc9cd618836c03e75f5/packages/record-tuple-polyfill/src/tuple.js
 */
export function parseShallowKeyFromKeyArray(shallowKey: (keyof any)[]) {
  return shallowKey.map((v) => String(v)).join(", ")
}
