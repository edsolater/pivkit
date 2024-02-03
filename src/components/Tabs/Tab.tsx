import { isNumber } from '@edsolater/fnkit'
import { Accessor, createEffect, createMemo, createSignal, useContext } from 'solid-js'
import { useKitProps } from '../../createKit/useKitProps'
import { KitProps } from '../../createKit/KitProps'
import { createDomRef } from '../../hooks'
import { Piv } from '../../piv/Piv'
import { ValidController } from '../../piv/typeTools'
import { TabsControllerContext } from './Tabs'

export interface TabController {
  value: Accessor<string | undefined>

  selected: Accessor<boolean>

  /** method:select this tab */
  select(): void
}

export type TabProps = {
  value?: string
  onSelect?(controller: TabController): void
  onUnselect?(controller: TabController): void
}

export type TabKitProps<Controller extends ValidController = TabController> = KitProps<
  TabProps,
  { controller: Controller }
>

/**
 * contain `Tab` components
 */
export function Tab(rawProps: TabKitProps) {
  const [currentIndex, setCurrentIndex] = createSignal<number>()
  const { dom, setDom } = createDomRef()
  const { props, shadowProps, lazyLoadController } = useKitProps(rawProps, { name: 'Tab' })
  const tabsController = useContext(TabsControllerContext)
  const selected = createMemo(() => tabsController.selectedIndex() === currentIndex())

  // add tab value to `Tabs` controller
  createEffect(() => {
    if (props.value) {
      const idx = currentIndex()
      if (isNumber(idx)) tabsController._addTabValue(idx, props.value)
    }
  })

  // get element index in parent node
  createEffect(() => {
    const el = dom()
    if (!el) return
    el.setAttribute('aria-selected', String(selected()))
    const siblings = el.parentElement?.children
    if (!siblings) return
    const currentIndexOfParentNode = Array.from(siblings).indexOf(el)
    if (currentIndexOfParentNode === -1) return
    setCurrentIndex(currentIndexOfParentNode)
  })

  const selectThisTab = () => {
    const idx = currentIndex()
    if (isNumber(idx)) tabsController.selectTabByIndex(idx)
  }

  // invoke onSelect and onUnselect
  createEffect(() => {
    if (selected()) {
      props.onSelect?.(tabController)
    } else {
      props.onUnselect?.(tabController)
    }
  })

  const tabController: TabController = { value: () => props.value, selected, select: selectThisTab }
  lazyLoadController(tabController)
  return (
    <Piv
      class='Tabs-Tab'
      shadowProps={shadowProps}
      onClick={selectThisTab}
      icss={{ cursor: 'pointer' }}
      domRef={setDom}
    >
      {props.children}
    </Piv>
  )
}
