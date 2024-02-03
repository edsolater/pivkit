import { createContext, useContext } from 'solid-js'
import { useKitProps } from '../../createKit/useKitProps'
import { KitProps } from '../../createKit/KitProps'
import { AddProps, Fragnment } from '../../piv'
import { PopoverPluginOptions, buildPopover } from '../../plugins/buildPopover'
import { Box } from '../Boxes'

type PopoverProps = PopoverPluginOptions

const PopoverContext = createContext<{
  popoverButtonPlugin?: ReturnType<typeof buildPopover>['plugins']['trigger']
  popoverPanelPlugin?: ReturnType<typeof buildPopover>['plugins']['panel']
}>({})

/** will render nothing */
export function Popover(kitProps: KitProps<PopoverProps>) {
  const { props } = useKitProps(kitProps, { name: 'Popover' })
  const { plugins: popoverPlugins } = buildPopover({ placement: props.placement ?? 'top' })
  return (
    <PopoverContext.Provider
      value={{ popoverButtonPlugin: popoverPlugins.trigger, popoverPanelPlugin: popoverPlugins.panel }}
    >
      <Box>{props.children}</Box>
    </PopoverContext.Provider>
  )
}

/** will render nothing */
function PopoverTrigger(kitProps: KitProps) {
  const { shadowProps, props } = useKitProps(kitProps, { name: 'PopoverTrigger' })
  const { popoverButtonPlugin } = useContext(PopoverContext)
  return (
    <AddProps shadowProps={shadowProps} plugin={popoverButtonPlugin}>
      {props.children}
    </AddProps>
  )
}

/** will render nothing */
function PopoverContent(kitProps: KitProps) {
  const { shadowProps, props } = useKitProps(kitProps, { name: 'PopoverContent' })
  const { popoverPanelPlugin } = useContext(PopoverContext)
  return (
    <AddProps shadowProps={shadowProps} plugin={popoverPanelPlugin}>
      {props.children}
    </AddProps>
  )
}

Popover.Trigger = PopoverTrigger
Popover.Content = PopoverContent
