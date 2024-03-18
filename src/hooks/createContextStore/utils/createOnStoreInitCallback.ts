import { OnStoreInitCallback, Store } from "../type"

export function createOnStoreInitCallback<T extends Record<string, any>>(
  cb: (store: Store<T>) => void,
): { cb: OnStoreInitCallback<T> } {
  return { cb }
}
