import { shrinkFn, type MayFn } from "@edsolater/fnkit"
import { createEffect, on, type Accessor } from "solid-js"
import { createDomRef } from "../../hooks"

/** a util for easier manage state class */
export const createStateClass = (name: string) => (el: MayFn<HTMLElement | undefined>) => ({
  add: () => shrinkFn(el)?.classList.add(name),
  remove: () => shrinkFn(el)?.classList.remove(name),
})

export const useStateClass = (name: string) => {
  const { dom, setDom } = createDomRef()

  function add() {
    dom()?.classList.add(name)
    return { remove }
  }
  function remove() {
    dom()?.classList.remove(name)
  }
  function has() {
    return dom()?.classList.contains(name)
  }
  return {
    setDom,
    add,
    remove,
    has,
  }
}


export function useClassRef(config: Record<string, Accessor<boolean>>) {
  const { dom, setDom } = createDomRef()

  for (const [name, stateSignal] of Object.entries(config)) {
    const manager = createStateClass(name)(dom)
    createEffect(on(stateSignal, (state) => (state ? manager.add() : manager.remove())))
  }

  return {
    setClassRef: setDom,
  }
}
