import { createEffect } from "solid-js"
import { Portal } from "solid-js/web"
import { createRef } from ".."
import isClientSide from "../jFetch/utils/isSSR"
import { RawChild } from "../piv/typeTools"

/** with the same id, new top-element will be created only-once  */
export function PopPortal(props: { name: string; children?: RawChild }) {
  const element = createPopStackHTMLElement(props.name)
  const [ref, setRef] = createRef()
  createEffect(() => {
    ref()?.classList.add("self-pointer-events-none")
  })
  return (
    <Portal mount={element} ref={setRef}>
      {props.children}
    </Portal>
  )
}

function createPopStackHTMLElement(name: string) {
  if (!isClientSide()) return
  const el = document.querySelector(`#${name}`)
  if ("document" in globalThis && !el) {
    const div = document.createElement("div")
    div.id = name
    document.body.appendChild(div)
    div.style.position = "fixed"
    div.style.inset = "0"
    div.classList.add("self-pointer-events-none")
    insertCSSPointerEventNone()
    return div
  } else {
    return el ?? undefined
  }
}

let haveSetPointerStyle = false
function insertCSSPointerEventNone() {
  if (!isClientSide()) return
  if (haveSetPointerStyle) return
  haveSetPointerStyle = true
  const styleEl = document.createElement("style")

  // Append <style> element to <head>
  document.head.appendChild(styleEl)

  styleEl.sheet?.insertRule(`:where(.self-pointer-events-none) {pointer-events:none}`)
  styleEl.sheet?.insertRule(`:where(.self-pointer-events-none) * {pointer-events:initial}`) // :where() always has 0 specificity -- MDN
}
