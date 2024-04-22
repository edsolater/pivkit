/** a util for easier manage state class */
export const createStateClass = (name: string) => (el: HTMLElement) => ({
  add: () => el.classList.add(name),
  remove: () => el.classList.remove(name),
})
