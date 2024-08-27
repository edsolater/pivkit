import { assert, omit, setTimeoutWithSecondes } from "@edsolater/fnkit"
import { Show, children, createEffect, createSignal, on, onCleanup, onMount, untrack, type JSXElement } from "solid-js"
import { AddProps, Piv, createDomRef, createStaticICSS, listenDomEvent, useKitProps, type KitProps } from ".."

export type PopoverPanelController = {
  open: () => void
  close: () => void
  toggle: () => void
  isOpen: () => boolean
}

export type PopoverPanelProps = {
  $debug?: boolean
  defaultOpen?: boolean
  open?: boolean
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/popover
   *
   * - auto : The popover is shown when the user interacts with the element, and hidden when the user interacts with a different element.
   * - manual : The popover is shown when the user interacts with the element, and remains visible until the user dismisses it.
   */
  popoverMode?: "auto" /* default */ | "manual"
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

    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/toggle_event
    const { cancel } = listenDomEvent(el, "toggle", ({ ev }) => {
      // @ts-expect-error force
      if (ev.newState === "closed" && ev.oldState === "open" && untrack(isOpen)) {
        setIsOpen(false)
        props.onClose?.()
      }
    })

    onCleanup(() => cancel())
  })

  createEffect(
    on(isOpen, (open) => {
      if (!shouldRender()) {
        setShouldRender(open)
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
          htmlProps={{ popover: props.popoverMode ?? "auto" }}
          domRef={setDom}
          icss={icssPopoverStyle}
        >
          {props.children}
        </AddProps>
      ) : (
        <Piv
          shadowProps={shadowProps}
          htmlProps={{ popover: props.popoverMode ?? "auto" }}
          domRef={setDom}
          icss={icssPopoverStyle}
        >
          {props.children}
        </Piv>
      )}
    </Show>
  )
}
