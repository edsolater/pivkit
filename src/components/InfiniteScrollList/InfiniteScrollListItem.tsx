import { Accessor, JSX, Show, createEffect, createMemo, createSignal, splitProps, useContext } from "solid-js"
import { useKitProps, type KitProps } from "../../createKit"
import useResizeObserver from "../../webTools/hooks/useResizeObserver"
import { createDomRef } from "../../hooks"
import { createRef } from "../../hooks/createRef"
import { Piv, omitProps } from "../../piv"
import { InfiniteScrollListContext } from "./InfiniteScrollList"
import { isClientSide } from "../../webTools/jFetch"

export type InfiniteScrollListItemRawProps = {
  children: () => JSX.Element
  // TODO: just forcevisible is not enough, should have more control props
  /** default is false */
  initvisible?: boolean
}

export interface InfiniteScrollListItemController {
  isIntersecting: Accessor<boolean>
}

export type InfiniteScrollListItemProps = KitProps<
  InfiniteScrollListItemRawProps,
  { controller: InfiniteScrollListItemController }
>
/**
 * context acceptor for `<List>` \
 * only used in `<List>`
 */
export function InfiniteScrollListItem(originalProps: InfiniteScrollListItemProps) {
  const [childrenProps, rawProps] = splitProps(originalProps, ["children"])
  const children = childrenProps.children
  const { props, lazyLoadController } = useKitProps(rawProps, { name: "ListItem" })

  const [itemDomRef, setItemDom] = createRef<HTMLElement>()

  //=== isIntersecting with parent `<List>`'s intersectionObserver
  const listContext = useContext(InfiniteScrollListContext)
  const [isIntersecting, setIsIntersecting] = createSignal(Boolean(props.initvisible))
  createEffect(() => {
    const el = itemDomRef()
    if (!el) return
    listContext.observeFunction?.(el, ({ entry }) => {
      setIsIntersecting(entry.isIntersecting)
    })
  })

  //=== size observer
  const { setRef: setSizeDetectorTarget, innerHeight, innerWidth } = useElementSizeDetector()

  //=== Controller
  const controller: InfiniteScrollListItemController = { isIntersecting }
  lazyLoadController(controller)

  //=== render children
  const childContent = createMemo(() => children())

  createEffect(() => {
    const el = itemDomRef()
    if (!el) return
    el.setAttribute("_intersecting", isIntersecting() ? "true" : "false")
  })

  return (
    <Piv
      class="InfiniteScrollListItem"
      domRef={[setItemDom, setSizeDetectorTarget]} // FIXME: why ref not setted🤔?
      shadowProps={omitProps(props, "children")} // FIXME: should not use tedius omit
      style={isIntersecting() ? undefined : { height: `${innerHeight()}px`, width: `${innerWidth()}px` }}
    >
      <Show when={isIntersecting()}>{childContent()}</Show>
    </Piv>
  )
}

/** use by listItem's canRender */
function useElementSizeDetector() {
  const [innerWidth, setInnerWidth] = createSignal<number>()
  const [innerHeight, setInnerHeight] = createSignal<number>()

  const { dom: ref, setDom: setRef } = createDomRef<HTMLElement>()

  const { destory } = useResizeObserver(ref, ({ el }) => {
    detectSize(el)
  })

  function detectSize(el: HTMLElement) {
    if (!el) return
    if (!isClientSide()) return

    if (!("clientWidth" in el)) return
    setInnerWidth(el.clientWidth)

    if (!("clientHeight" in el)) return
    setInnerHeight(el.clientHeight)
  }
  return { setRef, innerWidth, innerHeight }
}
