import { assert } from "@edsolater/fnkit"
import { createEffect, createSignal } from "solid-js"
import { Piv, createDomRef, useKitProps, type KitProps } from ".."

export type PopoverPanelController = {
  open: () => void
  close: () => void
  toggle: () => void
  isOpen: () => boolean
}

export type PopoverPanelProps = {
  defaultOpen?: boolean
  open?: boolean
  needBackDrop?: boolean
}

/**
 *
 * NOTE: inner children will always be rendered, if you want to lazy load children, you should use `<Show>` to wrap your child
 */
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
    <Piv shadowProps={shadowProps} htmlProps={{ popover: props.needBackDrop ? "auto" : "manual" }} domRef={setDom}>
      {props.children}
    </Piv>
  )
}
