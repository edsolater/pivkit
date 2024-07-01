import { assert } from "@edsolater/fnkit"
import { Show, createEffect, createSignal, on } from "solid-js"
import { AddProps, Piv, createDomRef, createStaticICSS, listenDomEvent, useKitProps, type KitProps } from ".."

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
  isWrapperAddProps?: boolean
  onClose?: () => void
  onBeforeClose?: () => void
}

const icssPopoverStyle = createStaticICSS("PopoverPanel", () => ({
  "@layer reset": {
    padding: "unset",
    border: "unset",
    background: "unset",
    margin: "unset",
  },
}))
/**
 *
 * NOTE: inner children will always be rendered, if you want to lazy load children, you should use `<Show>` to wrap your child
 */
export function PopoverPanel(kitProps: KitProps<PopoverPanelProps, { controller: PopoverPanelController }>) {
  const { props, loadController, shadowProps } = useKitProps(kitProps, { name: "Popover" })
  const { dom, setDom } = createDomRef()

  const [isOpen, setIsOpen] = createSignal(Boolean(props.defaultOpen))

  const [shouldRender, setShouldRender] = createSignal(isOpen())

  // ---------------- handle close event ----------------
  createEffect(() => {
    const el = dom()
    if (!el) return
    listenDomEvent(el, "toggle", ({ ev }) => {
      // @ts-expect-error force
      const isClosed = ev.newState === "closed"
      if (isClosed) {
        setIsOpen(false)
        props.onClose?.()
      }
    })
  })

  createEffect(
    on(isOpen, (open) => {
      if (shouldRender()) {
        return
      } else {
        return setShouldRender(open)
      }
    }),
  )

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

  loadController(controller)

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
    <Show when={shouldRender()}>
      {props.isWrapperAddProps ? (
        <AddProps
          shadowProps={shadowProps}
          htmlProps={{ popover: props.canBackdropClose ? "auto" : "manual" }}
          domRef={setDom}
          icss={icssPopoverStyle}
        >
          {props.children}
        </AddProps>
      ) : (
        <Piv
          shadowProps={shadowProps}
          htmlProps={{ popover: props.canBackdropClose ? "auto" : "manual" }}
          domRef={setDom}
          icss={icssPopoverStyle}
        >
          {props.children}
        </Piv>
      )}
    </Show>
  )
}
