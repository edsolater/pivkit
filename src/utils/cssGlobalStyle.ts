export function addGlobalCSS(cssText: string) {
  const style = document.createElement("style")
  style.appendChild(document.createTextNode(cssText))
  // style.appendChild(document.createTextNode(cssText.replace(/\n/g, "").replace(/\s{2,}/g, " ")))
  document.head.appendChild(style)
}
