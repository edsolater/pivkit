import { useKitProps } from '../../createKit/useKitProps'
import { KitProps } from '../../createKit/KitProps'
import { Piv } from '../../piv/Piv'
import { ValidController } from '../../piv/typeTools'

export interface TabListController {}
export interface TabListProps {}
export type TabListKitProps<Controller extends ValidController = TabListController> = KitProps<
  TabListProps,
  { controller: Controller }
>

/**
 * contain `Tab` components
 */
export function TabList(rawProps: TabListKitProps) {
  const { props, shadowProps, lazyLoadController } = useKitProps(rawProps, { name: 'TabList' })
  const tabListController: TabListController = {}
  lazyLoadController(tabListController)
  return (
    <Piv icss={{ display: 'flex' }} shadowProps={shadowProps}>
      {props.children}
    </Piv>
  )
}
