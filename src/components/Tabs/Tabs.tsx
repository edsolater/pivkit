import { mergeObjects } from '@edsolater/fnkit'
import { Accessor, createContext } from 'solid-js'
import { callbackManager } from '../../fnkit/callbackManager'
import { useKitProps } from '../../createKit/useKitProps'
import { KitProps } from '../../createKit/KitProps'
import { createSyncSignal } from '../../hooks/createSyncSignal'
import { Piv } from '../../piv/Piv'
import { ValidController } from '../../piv/typeTools'
import { Tab } from './Tab'
import { TabList } from './TabList'
import {
  TabsControllerWithTabValue,
  TabsPropsWithTabValue,
  useAbilityFeature_TabValue_Tabs,
} from './abilityFeatures/TabsControllerWithTabValue'

type OnChangeCallback = (controller: TabsController) => void

export type TabsController = {
  /** tabs group name */
  groupName: Accessor<string | undefined>
  selectedIndex: Accessor<number>
  /**
   * method
   */
  selectTabByIndex(index: number): void

  /**
   * inner method
   * invoked by `Tab` component
   * register method
   */
  _onChange(cb: OnChangeCallback): { unregister(): void }
} & TabsControllerWithTabValue

export type TabProps = {
  /** recommand to set, so can flat ui state to pure js object  */
  groupName?: string
  selectedIndex?: number
  defaultSelectedIndex?: number
  onChange?(controller: TabsController): void
} & TabsPropsWithTabValue

export type TabsKitProps<Controller extends ValidController = TabsController> = KitProps<
  TabProps,
  { controller: Controller }
>

const TabsControllerContextDefaultValue: TabsController = {
  groupName: () => undefined,
  selectedIndex: () => 0,
  tabValues: () => [],
  selectedValue: () => undefined,
  selectTabByIndex: () => {},
  selectTabByValue: () => {},
  _addTabValue: () => {},
  _onChange: () => ({ unregister: () => {} }),
}
export const TabsControllerContext = createContext<TabsController>(TabsControllerContextDefaultValue)

/**
 * abilities:
 * - select tab 2️⃣ will auto unselect tab 1️⃣
 *
 * @example
 * <Tabs>
 *   <Tab.List>
 *     <Tab>Tab 1</Tab>
 *     <Tab>Tab 2</Tab>
 *     <Tab>Tab 3</Tab>
 *   </Tab.List>
 *   <Tab.Panels>
 *     <Tab.Panel>Content 1</Tab.Panel>
 *     <Tab.Panel>Content 2</Tab.Panel>
 *     <Tab.Panel>Content 3</Tab.Panel>
 *   </Tab.Panels>
 * </Tabs>
 */
export function Tabs(rawProps: TabsKitProps) {
  const { registerCallback, invokeCallbacks } = callbackManager<OnChangeCallback>()

  const { props, shadowProps, lazyLoadController } = useKitProps(rawProps, { name: 'Tabs' })

  const {
    calculateVariables: { defaultIndex: getDefaultIndexByValue, index: getIndexByValue },
    additionalController,
  } = useAbilityFeature_TabValue_Tabs({
    props,
    currentIndex: () => selectedIndex(),
    setIndex: (...args) => selectTabByIndex(...args),
  })

  const getDefaultIndex = () =>
    'defaultSelectedIndex' in props && props.defaultSelectedIndex != null ? props.defaultSelectedIndex : undefined
  const getIndex = () => ('selectedIndex' in props ? props.selectedIndex : undefined)

  const [selectedIndex, selectTabByIndex] = createSyncSignal({
    defaultValue: () => getDefaultIndex() ?? getDefaultIndexByValue() ?? 0 /* defaultly focus on first one */,
    getValueFromOutside: () => getIndex() ?? getIndexByValue() ?? undefined /* defaultly focus on first one */,
    onInvokeSetter(value) {
      invokeCallbacks(tabsController)
      props.onChange?.(tabsController)
    },
  })

  const tabsController: TabsController = mergeObjects(additionalController, {
    groupName: () => props.groupName,
    selectedIndex,
    selectTabByIndex,
    _onChange: registerCallback,
  })

  lazyLoadController(tabsController)
  return (
    <TabsControllerContext.Provider value={tabsController}>
      <Piv class='Tabs' shadowProps={shadowProps}>
        {props.children}
      </Piv>
    </TabsControllerContext.Provider>
  )
}

Tabs.List = TabList
Tabs.Tab = Tab
