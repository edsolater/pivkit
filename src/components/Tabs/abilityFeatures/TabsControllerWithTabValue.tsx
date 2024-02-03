import { Accessor, createMemo, createSignal } from 'solid-js'
import { TabProps } from '../Tabs'
import { isNumber } from '@edsolater/fnkit'

export type TabsPropsWithTabValue = {
  /** only works when target tab name can match */
  selectedValue?: string
  /** only works when target tab name can match */
  defaultSelectedValue?: string
}
export type TabsControllerWithTabValue = {
  /** all tab items */
  tabValues: Accessor<string[]>

  /** only works when target tab name can match */
  selectedValue: Accessor<string | undefined>

  /**
   * method
   * only works when target tab name can match
   */
  selectTabByValue(value: string): void

  /**
   * inner method
   * invoked by `Tab` component
   */
  _addTabValue(idx: number, value: string): void
}

/**
 * ability hook
 * tab can handle both value or index */
export function useAbilityFeature_TabValue_Tabs(opts: {
  props: TabProps
  currentIndex: Accessor<number>
  setIndex: (v: number) => void
}) {
  const [allTabValues, setAllTabValues] = createSignal<string[]>([])

  const addOneTabValue = (tabIndex: number, tabValue: string) => {
    setAllTabValues((prev) => {
      const next = [...prev]
      next[tabIndex] = tabValue
      return next
    })
  }

  const getTabIndexByValues = (value: string) => allTabValues().findIndex((v) => v === value)
  const getTabValueByIndex = (index: number) => allTabValues()[index]
  const input_defaultIndex = () =>
    opts.props.defaultSelectedValue ? getTabIndexByValues(opts.props.defaultSelectedValue) : undefined
  const input_index = () => (opts.props.selectedValue ? getTabIndexByValues(opts.props.selectedValue) : undefined)

  // an alertive of `activeTabIndex`
  const selectedValue = () => allTabValues().at(opts.currentIndex()) // TODO: lazy create memo

  // an alertive of `setActiveTabIndex`
  function selectTabByValue(value: string) {
    const idx = getTabIndexByValues(value)
    if (isNumber(idx)) opts.setIndex(idx)
  }

  const additionalController: TabsControllerWithTabValue = {
    tabValues: allTabValues,
    selectedValue,
    selectTabByValue,
    _addTabValue: addOneTabValue,
  }

  return {
    // states
    states: {
      allTabValues,
      selectedValue,
    },

    // methods
    methods: {
      addOneTabValue,
      selectTabByValue,
      getTabIndexByValues,
      getTabValueByIndex,
    },

    // used in phase
    calculateVariables: {
      defaultIndex: input_defaultIndex,
      index: input_index,
    },

    additionalController,
  }
}

/** createMemo will invoke the function when create, createLazyMemo will invoke when first access */
function createLazyMemo() {}
