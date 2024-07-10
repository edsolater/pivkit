import { mergeObjects } from "@edsolater/fnkit"
import type { ValidController } from "../typeTools"

// TODO: move to fnkit
export function collapseObjectArray<T extends object>(array: (T | undefined)[]): T {
  if (array.length === 0) return {} as T
  if (array.length === 1) return array[0] || ({} as T)
  return array.slice(1).reduce((acc, item) => mergeObjects(acc, item), array[0]) as T
}

/** is inner controller can be an array now */
export const compressInnerController = (controllers: (ValidController | undefined)[]): object => {
  return collapseObjectArray(controllers)
}
