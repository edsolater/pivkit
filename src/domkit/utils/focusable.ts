/** as long ass apply this on a elemment, press key `Enter` / `(Space)` equal to mouse click  */
export function makeFocusable(el: Element | undefined | null, options?: { tabIndex?: number }) {
  if (!el) return
  if (el.tagName !== "BUTTON" || options?.tabIndex !== 0) {
    el.setAttribute("tabindex", "0")
  }
}
/**
 * domkit
 * get the first focusable child element
 *
 * @param parentElement parent element
 * @returns the first focusable child element or undefined if not found
 */
export function getFirstFocusableChild(parentElement: Element | undefined) {
  if (!parentElement) return
  const firstFocusableElement = parentElement.querySelector<HTMLElement>(
    "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
  )
  return firstFocusableElement ?? undefined
}

export function focusFirstFocusableChild(parentElement: HTMLElement | undefined) {
  if (!parentElement) return
  const firstFocusableChild = getFirstFocusableChild(parentElement)
  window.requestAnimationFrame(() => {
    firstFocusableChild?.focus()
  })
}
