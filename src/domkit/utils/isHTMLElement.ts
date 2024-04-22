export function isHTMLElement(el: any): el is HTMLElement {
  try {
    return el instanceof HTMLElement
  } catch (e) {
    return false
  }
}
