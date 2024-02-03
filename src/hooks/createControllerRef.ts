import { createEffect, createSignal, on } from 'solid-js'
import { createSmartStore } from './createContextStore'

/**
 * faster for using controller
 * @returns a object with proxy
 */
export function createControllerRef<T extends Record<string, any> = Record<string, any>>(): [
  controller: Partial<T>,
  setController: (el: unknown) => void,
] {
  const { store: controller, setStore } = createSmartStore<Partial<T>>({})
  const [ref, setRef] = createSignal<T | undefined>(undefined)
  createEffect(
    on(ref, (controllerRef) => {
      if (controllerRef) {
        setStore(controllerRef)
      }
    })
  )
  return [controller, setRef]
}
