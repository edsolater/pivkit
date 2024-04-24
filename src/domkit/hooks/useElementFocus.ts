import { Accessor, createEffect, createSignal, onCleanup } from "solid-js"
import { listenDomEvent } from ".."

export function useElementFocus(dom: Accessor<HTMLInputElement | undefined>, defaultValue: boolean = false) {
  const [isFocused, setIsFocused] = createSignal(defaultValue)
  createEffect(() => {
    const el = dom()
    if (el) {
      const { cancel: abort1 } = listenDomEvent(el, "focus", () => setIsFocused(true))
      onCleanup(abort1)
      const { cancel: abort2 } = listenDomEvent(el, "blur", () => setIsFocused(false))
      onCleanup(abort2)
    }
  })
  return isFocused
}
