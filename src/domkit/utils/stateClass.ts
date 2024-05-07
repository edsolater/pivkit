import { createDomRef } from "../../hooks"

/** a util for easier manage state class */
export const createStateClass = (name: string) => (el: HTMLElement) => ({
  add: () => el.classList.add(name),
  remove: () => el.classList.remove(name),
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
