import { Accessor } from "solid-js"
import { deAccessify } from ".."
import { createLazyMemo } from "./createLazyMemo"

export function createLazyMemoFromObjectAccessor<T, U>(accessor: Accessor<T>, pick: (v: T) => U): () => U {
  return createLazyMemo(() => pick(deAccessify(accessor)))
}
