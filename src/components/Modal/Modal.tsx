import { isPromise, mergeFunction, setTimeoutWithSecondes } from "@edsolater/fnkit"
import { Accessor, createEffect, createSignal, on } from "solid-js"
import { KitProps, useKitProps } from "../../createKit"
import { createLazySignal } from "../../hooks"
import { createComponentContext, useComponentContext } from "../../hooks/createComponentContext"
import { createDisclosure } from "../../hooks/createDisclosure"
import { createRef } from "../../hooks/createRef"
import { ICSS, Piv, PivProps, createPlugin } from "../../piv"
import { renderHTMLDOM } from "../../piv/propHandlers/renderHTMLDOM"
import { useClickOutside } from "../../webTools/hooks/useClickOutside"
import { useDOMEventListener } from "../../webTools/hooks/useDOMEventListener"
import { Text } from "../Text"
import { createDerivate, resolveInNextMacroTask } from "../../hooks/createDerivate"

export interface ModalController {
  dialogDOM: Accessor<HTMLDialogElement | undefined>
  dialogContentDOM: Accessor<HTMLDivElement | undefined>
  isOpen: Accessor<boolean>
  /** modal title */
  title: Accessor<string | undefined>
  open(): void
  close(): void
  toggle(): void
}

export interface ModalProps {
  open?: boolean
  /** modal title */
  title?: string

  onClose?(): void
  onOpen?(): void

  /** style of backdrop */
  backdropICSS?: ICSS

  /**
   * control when to render DOM
   * @default 'first-open'
   */
  domRenderWhen?:
    | "first-open" // not render DOM until open, but close will stay DOM [default]
    | "open" // render DOM every open
    | "always" // always stay DOM
}

export type ModalKitProps = KitProps<ModalProps, { controller: ModalController }>

export const ModalContext = createComponentContext<Partial<ModalController>>()

/**
 * headless component (just for wrapper)
 * 
 * sub-component:
 * - {@link ModalTitle \<ModalTitle\>} - register mobal title. Actually is {@link Text \<Text\>}
 */
export function Modal(kitProps: ModalKitProps) {
  const { props, shadowProps, loadController } = useKitProps(kitProps, { name: "Modal" })
  const [dialogDOM, setDialogDOM] = createRef<HTMLDialogElement>()
  const [dialogContentDOM, setDialogContentDOM] = createRef<HTMLDivElement>()
  const openModal = () => dialogDOM()?.showModal()
  const closeModal = () => dialogDOM()?.close()
  const [innerOpen, { open, close, toggle }] = createDisclosure(() => Boolean(props.open), {
    onClose() {
      closeModal()
      props.onClose?.()
    },
    onOpen() {
      openModal()
      props.onOpen?.()
    },
  })

  const { shouldRenderDOM } = useShouldRenderDOMDetector({ props, innerOpen })

  // sync dislog's  build-in close event with inner state
  useDOMEventListener(dialogDOM, "close", () => close())

  // initly load modal show
  createEffect(() => {
    if (props.open) {
      innerOpen()
    }
  })

  // not propagate original keydown event
  useDOMEventListener(dialogDOM, "keydown", ({ ev }) => {
    ev.stopPropagation()
    return ev.preventDefault()
  })

  const deferEnabled = createDerivate(innerOpen, resolveInNextMacroTask, false)

  createEffect(() => {})

  // click outside to close dialog
  useClickOutside(dialogContentDOM, {
    enabled: deferEnabled,
    onClickOutSide: () => {
      close()
    },
  })

  const modalController: ModalController = {
    dialogDOM,
    dialogContentDOM,
    title: () => props.title,
    /** is dialog open */
    isOpen: innerOpen,
    open: mergeFunction(open, openModal),
    close: mergeFunction(close, closeModal),
    toggle: toggle,
  }
  loadController(modalController)

  return (
    <ModalContext.Provider value={modalController}>
      <Piv<"dialog">
        defineSelf={(selfProps) => renderHTMLDOM("dialog", selfProps)}
        domRef={setDialogDOM}
        shadowProps={shadowProps}
        icss={{
          border: "none",
          padding: "0",
          background: "transparent",
          overflowY: "visible",
          maxHeight: "100dvh",
          maxWidth: "100dvw",
          "&::backdrop": props.backdropICSS as any,
        }}
      >
        <Piv domRef={setDialogContentDOM} icss={{ display: "contents" }}>
          {props.children}
        </Piv>
      </Piv>
    </ModalContext.Provider>
  )
}

/**
 * component plugin
 * regist modal title to {@link ModalContext}
 */
export const plugin_modalTitle = createPlugin(
  (pluginOptions?: { title?: string }) => (props) => {
    const [, setModalContext] = useComponentContext(ModalContext)
    createEffect(() => {
      const title = String(pluginOptions?.title ?? props.children)
      setModalContext({ title: () => String(title) })
    })
    return {
      icss: {
        fontSize: "1.5rem",
        fontWeight: "bold",
        marginBottom: ".5em",
      },
    } satisfies PivProps
  },
  { name: "modalTitle" },
)

/**
 * detect whether should render `<Modal>`'s content in DOM
 */
function useShouldRenderDOMDetector(utils: { props: ModalProps; innerOpen: Accessor<boolean> }) {
  const [haveFirstOpened, setHaveFirstOpened] = createSignal(utils.innerOpen())

  // reflect to innerOpen() change
  createEffect(() => {
    const isOpen = utils.innerOpen()
    setHaveFirstOpened((b) => b || isOpen)
  })

  const shouldRenderDOM = () => {
    switch (utils.props.domRenderWhen ?? "first-open") {
      case "open": {
        return utils.innerOpen()
      }
      case "always": {
        return true
      }
      case "first-open": {
        return haveFirstOpened()
      }
    }
  }

  return { shouldRenderDOM }
}
