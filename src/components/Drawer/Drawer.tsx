import { createSignal, Show } from 'solid-js'
import { KitProps, useKitProps } from '../../createKit'
import { createRef } from '../../hooks/createRef'
import { useClickOutside } from '../../domkit/hooks/useClickOutside'
import { Piv } from '../../piv'
import { drawerKeyboardShortcut } from '../../plugins/drawerKeyboardShortcut'
import { PopPortal } from '../PopPortal'

export interface DrawerController {
  isOpen: boolean
  placement: NonNullable<DrawerKitProps['placement']>
  open(): void
  close(): void
  toggle(): void
}
export type DrawerProps = {
  open?: boolean
  placement?: 'from-left' | 'from-bottom' | 'from-top' | 'from-right'
}
export type DrawerKitProps = KitProps<DrawerProps, { controller: DrawerController }>
const drawerDefaultProps = { placement: 'from-right' } satisfies DrawerKitProps
export type DrawerDefaultProps = typeof drawerDefaultProps

export function Drawer(kitProps: DrawerKitProps) {
  const { props } = useKitProps(kitProps, {
    name: 'Drawer',
    plugin: drawerKeyboardShortcut,
    controller: (mergedProps) => ({
      get isOpen() {
        return Boolean(isOpen())
      },
      placement: mergedProps.placement ?? drawerDefaultProps.placement,
      open() {
        open()
        drawerRef()?.focus()
      },
      close,
      toggle() {
        if (isOpen()) {
          close()
        } else {
          open()
          drawerRef()?.focus()
        }
      },
    }),
    defaultProps: drawerDefaultProps,
  })
  const [drawerRef, setDrawerRef] = createRef<HTMLDivElement>()
  const [isOpen, setIsOpen] = createSignal(props.open)
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  useClickOutside(drawerRef, {
    onClickOutSide: () => {
      if (isOpen()) {
        close()
      }
    },
  })
  return (
    <PopPortal name='pop-stack'>
      <Show when={isOpen()}>
        <Piv
          domRef={setDrawerRef}
          shadowProps={props}
          icss={[
            {
              width: '300px',
              height: '100dvh',
              background: 'dodgerblue',
              '@starting-style': {
                '&':
                  props.placement === 'from-left'
                    ? { translate: '-100% 0' }
                    : props.placement === 'from-right'
                      ? { translate: '100% 0' }
                      : props.placement === 'from-top'
                        ? { translate: '0 -100%' }
                        : { translate: '0 100%' },
              },
              transition: '300ms',
            },
            {
              position: 'absolute',
              top: props.placement === 'from-top' ? '0' : undefined,
              left: props.placement === 'from-left' ? '0' : undefined,
              right: props.placement === 'from-right' ? '0' : undefined,
              bottom: props.placement === 'from-bottom' ? '0' : undefined,
            },
          ]}
        />
      </Show>
    </PopPortal>
  )
}
