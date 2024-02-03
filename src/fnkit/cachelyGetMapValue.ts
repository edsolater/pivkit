// TODO: move to fnkit

export type GetMapKey<T extends Map<any, any>> = T extends Map<infer K, any> ? K : never
// TODO: move to fnkit
export type GetMapValue<T extends Map<any, any>> = T extends Map<any, infer V> ? V : never

/** basic util function
 * @todo move to fnkit
 *
 * @param cacheMap provide a cache map
 * @param key the key of the cache map
 * @param createIfNotInCacheMap create a new value if the key is not in the cache map
 */
export function cacheMapGet<T extends Map<any, any>>(
  cacheMap: T,
  key: GetMapKey<T>,
  createIfNotInCacheMap: () => GetMapValue<T>
): GetMapValue<T> {
  if (!cacheMap.has(key)) {
    const newValue = createIfNotInCacheMap()
    cacheMap.set(key, newValue)
  }
  return cacheMap.get(key)!
}
