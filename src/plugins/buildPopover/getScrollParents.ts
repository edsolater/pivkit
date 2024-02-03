const scrollableElementWeakMap = new WeakMap<HTMLElement, boolean>()

export function getScrollParents(targetElement: HTMLElement) {
  return getParents(targetElement).filter(isScrollableElement)
}

function getParents(el: HTMLElement): HTMLElement[] {
  let currentElement = el
  if (!currentElement) return []
  const parents = [] as HTMLElement[]
  while (currentElement.parentElement && currentElement.parentElement !== globalThis.document.body.parentElement) {
    parents.push(currentElement.parentElement)
    currentElement = currentElement.parentElement
  }
  return parents
}

function isScrollableElement(element: HTMLElement): boolean {
  if (scrollableElementWeakMap.has(element)) {
    return scrollableElementWeakMap.get(element)!
  } else {
    const isScrollable = isCurrentScrollable(element) || hasScrollableStyle(element)
    scrollableElementWeakMap.set(element, isScrollable)
    return isScrollable
  }
}

function isCurrentScrollable(el: HTMLElement) {
  return el.clientHeight < el.scrollHeight
}

function hasScrollableStyle(el: HTMLElement) {
  const { overflow, overflowX, overflowY } = globalThis?.getComputedStyle?.(el) ?? {}
  return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX)
}
