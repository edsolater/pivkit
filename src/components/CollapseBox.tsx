import { createContext, createEffect, useContext } from 'solid-js'
import { KitProps, useKitProps } from '../createKit'
import { createDomRef, useClickOutside } from '../hooks'
import { createDisclosure } from '../hooks/createDisclosure'
import { Piv, PivChild, PivProps } from '../piv'
import { renderHTMLDOM } from '../piv/propHandlers/renderHTMLDOM'
import { createCSSCollapsePlugin } from '../plugins/useCSSTransition'
import { createController } from '../utils/createController'
import { Box } from './Boxes'
import { motivate } from '../fnkit'

export interface CollapseBoxRowProps {
  /** TODO: open still can't auto lock the trigger not controled component now */
  open?: boolean
  defaultOpen?: boolean
  collapseDirection?: 'down' | 'up'
  canCloseByOutsideClick?: boolean
  onOpen?(): void
  onClose?(): void
  onToggle?(): void

  'renderFace'?: PivChild
  'renderContent'?: PivChild
  //TODO
  // 'renderMapLayout'?:
}
export type CollapseBoxProps = KitProps<CollapseBoxRowProps, { controller: CollapseBoxController }>

export interface CollapseBoxController {
  readonly isOpen: boolean
  isOpenAccessor: () => boolean
  open(): void
  close(): void
  toggle(): void
  set(toOpen: boolean): void
}

const CollapseContext = createContext<CollapseBoxController>({} as CollapseBoxController, {
  name: 'CollapseController',
})

/**
 * @example
 * <Collapse renderFace={'Hello'} renderContent={<Box></Box>} configRenderLayout={({WrapperBox, Face, Content}) => (<WraperBox>
 *				<Face />
 *				<Content />
 *			</WrapperBox>)} />
 */
export function CollapseBox(kitProps: CollapseBoxProps) {
  const { dom: boxDom, setDom: setBoxDom } = createDomRef()
  const { props, shadowProps } = useKitProps(kitProps, { name: 'Collapse', controller: () => controller })

  const [innerOpen, { toggle, open, close, set }] = createDisclosure(() => props.open ?? props.defaultOpen ?? false, {
    onClose: props.onClose,
    onOpen: props.onOpen,
    onToggle: props.onToggle,
  })

  const controller = createController<CollapseBoxController>({
    isOpen: () => innerOpen(),
    isOpenAccessor: () => innerOpen,
    open: () => open,
    close: () => close,
    toggle: () => toggle,
    set: () => set,
  })

  const {
    controller: { open: openCollapse, close: closeCollapse, toggle: toggleCollapse, opened: isCollapseOpened },
    plugin,
  } = createCSSCollapsePlugin()

  //sync with innerOpen
  createEffect(() => (innerOpen() ? openCollapse() : closeCollapse()))

  /** {@link CollapseBox} can click outside to close */
  useClickOutside(boxDom, { disabled: !props.canCloseByOutsideClick })

  return (
    <Box shadowProps={shadowProps} domRef={setBoxDom}>
      {/* Face */}
      {props['renderFace'] && (
        <Box class='Face' onClick={motivate(toggle)}>
          {props['renderFace']}
        </Box>
      )}

      {/* Content */}
      {props['renderContent'] && (
        <Piv class='Content' plugin={plugin} icss={{ overflow: 'hidden' }}>
          {props['renderContent']}
        </Piv>
      )}
    </Box>
  )
}

interface CollapseFaceProps {}

export function CollapseFace(
  rawProps: KitProps<
    CollapseFaceProps,
    {
      controller: CollapseBoxController
      htmlPropsTagName: 'summary'
    }
  >
) {
  const controller = useContext(CollapseContext)
  const { props } = useKitProps(rawProps, { name: 'CollapseFase', controller: () => controller })
  return (
    <Piv<'summary', CollapseBoxController>
      render:self={(selfProps) => renderHTMLDOM('summary', selfProps)}
      shadowProps={props}
      icss={{ listStyle: 'none' }}
      innerController={controller}
    >
      {props.children}
    </Piv>
  )
}

interface CollapseContentProps extends PivProps {}

export function CollapseContent(rawProps: CollapseContentProps) {
  const controller = useContext(CollapseContext)
  const { props } = useKitProps(rawProps, { name: 'CollapseContent', controller: () => controller })
  return <Piv shadowProps={props} innerController={controller} />
}

CollapseBox.Face = CollapseFace
CollapseBox.Content = CollapseContent
