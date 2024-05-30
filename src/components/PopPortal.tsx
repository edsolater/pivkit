import { createEffect, createSignal } from "solid-js"
import { Portal } from "solid-js/web" // this is why
import { Fragnment, createDomRef, createRef, useKitProps, type KitProps } from ".."
import isClientSide from "../jFetch/utils/isSSR"
import { RawChild } from "../piv/typeTools"
import { assert, runtimeObject } from "@edsolater/fnkit"
import { AddProps } from "@edsolater/pivkit"

/** with the same id, new top-element will be created only-once  */
/** @dreprecated prefer use native Popover API(https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) */
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

export type PopoverPanelController = {
  open: () => void
  close: () => void
  toggle: () => void
  isOpen: () => boolean
}

export type PopoverPanelProps = {
  defaultOpen?: boolean
  open?: boolean
  canBackdropClose?: boolean
}

export function PopoverPanel(kitProps: KitProps<PopoverPanelProps, { controller: PopoverPanelController }>) {
  const { props, lazyLoadController, shadowProps } = useKitProps(kitProps, { name: "Popover" })
  const { dom, setDom } = createDomRef()

  const [isOpen, setIsOpen] = createSignal(Boolean(props.defaultOpen))

  // sync props.open to state.open
  createEffect(() => {
    if (props.open !== undefined) {
      setIsOpen(Boolean(props.open))
    }
  })

  const controller = {
    open: () => {
      const el = dom()
      assert(el, "popover element is not ready")
      el.showPopover()
    },
    close: () => {
      const el = dom()
      assert(el, "popover element is not ready")
      el.hidePopover()
    },
    toggle: () => {
      const el = dom()
      assert(el, "popover element is not ready")
      el.togglePopover()
    },
    isOpen,
  }

  lazyLoadController(() => controller)

  // reflect open state to dom
  createEffect(() => {
    const el = dom()
    if (!el) return
    if (isOpen()) {
      controller.open()
    } else {
      controller.close()
    }
  })

  return (
    <div popover={props.canBackdropClose ? "auto" : "manual"} ref={setDom}>
      <AddProps shadowProps={shadowProps}>{props.children}</AddProps>
    </div>
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
