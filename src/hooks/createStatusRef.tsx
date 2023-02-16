import { createSignal } from 'solid-js'

export function createStatusRef<T extends HTMLElement = HTMLElement>(): [ref: () => T | undefined, setRef: (el) => void] {
  const [ref, setRef] = createSignal<T | undefined>(undefined)
  return [ref, setRef]
}
