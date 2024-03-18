import { mergeFunction } from "@edsolater/fnkit"
import { Accessor, Show, createEffect, createSignal } from "solid-js"
import { KitProps, useKitProps } from "../../createKit"
import { useClickOutside } from "../../domkit/hooks/useClickOutside"
import { useDOMEventListener } from "../../domkit/hooks/useDOMEventListener"
import { createComponentContext, useComponentContext } from "../../hooks/createComponentContext"
import { createDisclosure } from "../../hooks/createDisclosure"
import { createRef } from "../../hooks/createRef"
import { ICSS, Piv, PivProps, createPlugin } from "../../piv"
import { renderHTMLDOM } from "../../piv/propHandlers/renderHTMLDOM"
import { createController2 } from "../../utils/createController"
import { PopPortal } from "../PopPortal"
import { Text } from "../Text"
import { motivate } from "../../fnkit"

export interface ModalController {
  dialogDOM: Accessor<HTMLDialogElement | undefined>
  dialogContentDOM: Accessor<HTMLDivElement | undefined>
  isOpen: Accessor<boolean>
  /** modal title */
  title: Accessor<string>
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
 * for details,
 * @see https://chakra-ui.com/docs/components/modal
 * sub-component:
 * - {@link ModalTitle \<ModalTitle\>} - register mobal title. Actually is {@link Text \<Text\>}
 */
export function Modal(kitProps: ModalKitProps) {
  const modalController = createController2<ModalController>(() => ({
    dialogDOM,
    dialogContentDOM,
    title: () => props.title,
    /** is dialog open */
    isOpen: innerOpen,
    open: mergeFunction(open, openModal),
    close: mergeFunction(close, closeModal),
    toggle: toggle,
  }))

  const { props, shadowProps } = useKitProps(kitProps, {
    name: "Modal",
    controller: () => modalController,
  })
  const [dialogDOM, setDialogDOM] = createRef<HTMLDialogElement>()
  const [dialogContentDOM, setDialogContentDOM] = createRef<HTMLDivElement>()
  const openModal = () => dialogDOM()?.showModal()
  const closeModal = () => dialogDOM()?.close()
  const [innerOpen, { open, close, toggle }] = createDisclosure(() => Boolean(props.open), {
    onClose() {
      props.onClose?.()
    },
    onOpen() {
      props.onOpen?.()
    },
  })
  const { shouldRenderDOM } = useShouldRenderDOMDetector({ props, innerOpen })

  // sync dislog's  build-in close event with inner state
  useDOMEventListener(dialogDOM, "close", motivate(close))

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

  // click outside to close dialog
  useClickOutside(dialogContentDOM, {
    disabled: () => !innerOpen(),
    onClickOutSide: () => {
      close()
      closeModal()
    },
  })

  return (
    <ModalContext.Provider value={modalController}>
      <PopPortal name="dialog">
        <Show when={shouldRenderDOM()}>
          <Piv<"dialog">
            render:self={(selfProps) => renderHTMLDOM("dialog", selfProps)}
            domRef={setDialogDOM}
            shadowProps={shadowProps}
            htmlProps={{ role: "dialog" }}
            icss={{
              border: "none",
              padding: "0",
              background: "transparent",
              overflowY: "visible",
              maxHeight: "100dvh",
              maxWidth: "100dvw",
              "&::backdrop": props.backdropICSS,
            }}
          >
            <Piv domRef={setDialogContentDOM} icss={{ display: "contents" }}>
              {props.children}
            </Piv>
          </Piv>
        </Show>
      </PopPortal>
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
