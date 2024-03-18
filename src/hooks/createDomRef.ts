import { Accessor } from "solid-js"
import { CreateCallbackRefOptions, CreateCallbackRefOptions2, createRef } from "./createRef"

/** for semantic API is like `createSignal()`  */
export function createDomRef<T extends HTMLElement = HTMLElement>(
  options?: CreateCallbackRefOptions<T> | CreateCallbackRefOptions2<T>,
): {
  dom: Accessor<T | undefined>
  setDom: (el: T) => void
} {
  const [dom, setDom] = createRef<T>(options as any)
  return { dom, setDom }
}
