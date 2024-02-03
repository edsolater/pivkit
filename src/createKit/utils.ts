/** type C = OmitItems<'a' | 'b' | 'c', 'a' | 'b' | 'd'> // 'c' */
// TODO: move to fnkit

export type OmitItem<
  OriginString extends keyof any,
  OmitString extends keyof any | undefined = undefined,
> = OriginString extends infer T ? (T extends OmitString ? never : T) : never
/**
 * Returns a new array with all elements of the input array except for the specified items.
 * @param arr The input array to filter.
 * @param items The item(s) to omit from the array.
 * @returns A new array with all elements of the input array except for the specified items.
 * @todo
 */

export function omitItem<T>(arr: T[], items: T | T[]): T[] {
  const omitSet = new Set(Array.isArray(items) ? items : [items])
  return arr.filter((item) => !omitSet.has(item))
}
