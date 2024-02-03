import { Accessor, JSX, createEffect, createMemo, createSignal, splitProps, useContext } from 'solid-js'
import { useKitProps } from '../../createKit'
import useResizeObserver from '../../domkit/hooks/useResizeObserver'
import { createRef } from '../../hooks/createRef'
import { Piv, PivProps, omit } from '../../piv'
import { ListContext } from './List'
import { createDomRef } from '../../hooks'
import isClientSide from '../../jFetch/utils/isSSR'

export interface ListItemProps extends Omit<PivProps, 'children'> {
  children: () => JSX.Element
  // TODO: just forceVisiable is not enough, should have more control props
  forceVisiable?: boolean
}

export interface ListItemController {
  isIntersecting: Accessor<boolean>
}
/**
 * context acceptor for `<List>` \
 * only used in `<List>`
 */
export function ListItem(originalProps: ListItemProps) {
  const [childrenProps, rawProps] = splitProps(originalProps, ['children'])
  const children = childrenProps.children
  const { props, lazyLoadController } = useKitProps(rawProps, { name: 'ListItem' })

  const [itemDomRef, setItemDom] = createRef<HTMLElement>()

  //=== isIntersecting with parent `<List>`'s intersectionObserver
  const listContext = useContext(ListContext)
  const [isIntersecting, setIsIntersecting] = createSignal(Boolean(props.forceVisiable))
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
  const controller: ListItemController = { isIntersecting }
  lazyLoadController(controller)

  //=== render children
  const childContent = createMemo(() => children())

  return (
    <Piv
      class='ListItem'
      domRef={[setItemDom, setSizeDetectorTarget]} // FIXME: why ref not setted🤔?
      shadowProps={omit(props, 'children')} // FIXME: should not use tedius omit
      style={isIntersecting() ? undefined : { height: `${innerHeight()}px`, width: `${innerWidth()}px` }}
      icss={{ contentVisibility: isIntersecting() ? 'visible' : 'hidden', width: '100%' }}
    >
      {childContent}
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

    if (!('clientWidth' in el)) return
    console.log('el: ', el)
    // setInnerWidth(el.clientWidth) //FIXME: why set is will cause error?🤔

    if (!('clientHeight' in el)) return
    // setInnerHeight(el.clientHeight) //FIXME: why set is will cause error?🤔
  }
  return { setRef, innerWidth, innerHeight }
}
