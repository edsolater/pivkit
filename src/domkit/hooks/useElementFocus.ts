import { Accessor, createEffect, createSignal, onCleanup } from 'solid-js'
import { addEventListener } from '..'

export function useElementFocus(dom: Accessor<HTMLInputElement | undefined>, defaultValue: boolean = false) {
  const [isFocused, setIsFocused] = createSignal(defaultValue)
  createEffect(() => {
    const el = dom()
    if (el) {
      const { abort: abort1 } = addEventListener(el, 'focus', () => setIsFocused(true))
      onCleanup(abort1)
      const { abort: abort2 } = addEventListener(el, 'blur', () => setIsFocused(false))
      onCleanup(abort2)
    }
  })
  return isFocused
}
