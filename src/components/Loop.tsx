import { MayFn, shrinkFn } from "@edsolater/fnkit"
import { For, JSXElement, createMemo, type Accessor } from "solid-js"
import { KitProps, useKitProps } from "../createKit"
import { createRef } from "../hooks/createRef"
import { AddProps, Fragnment, PivChild, parsePivChildren } from "../piv"

export interface LoopController {}

type ComponentStructure = (...anys: any[]) => JSXElement

export type LoopProps<T> = {
  /** only for inner */
  $isList?: boolean

  /** `<List>` has default `<Box>` wrapper, but `<Loop>` has not*/
  renderWrapper?: ComponentStructure
  renderListItemWrapper?: ComponentStructure

  items?: MayFn<Iterable<T>>

  renderDivider?: MayFn<PivChild, [payload: { prevIndex: Accessor<number>; currentIndex: Accessor<number> }]>
  sortCompareFn?: (a: T, b: T) => number

  children(item: T, index: () => number): PivChild
}

export type LoopKitProps<T> = KitProps<LoopProps<T>, { controller: LoopController }>

/**
 * just a wrapper of <For>, very simple
 * if for layout , don't render important content in Box
 */
export function Loop<T>(kitProps: LoopKitProps<T>) {
  const { props, shadowProps } = useKitProps(kitProps, {
    name: kitProps.$isList ? "List" : "Loop",
    noNeedDeAccessifyChildren: true,
  })
  const BoxWrapper = kitProps.renderWrapper ?? AddProps
  const ItemWrapper = kitProps.renderListItemWrapper ?? Fragnment

  // [configs]
  const allItems = createMemo(() => {
    const sourceItems = Array.from(shrinkFn(props.items ?? []) as T[])
    const sorter = kitProps.sortCompareFn
    const sorted = sorter && sourceItems.length > 1 ? sourceItems.sort(sorter) : sourceItems
    return sorted
  })

  const itemLength = createMemo(() => allItems().length)

  // [loop ref]
  const [componentWrapperRef, setRef] = createRef<HTMLElement>()

  const content = (
    <For each={allItems()}>
      {(item, idx) => (
        <Fragnment>
          <ItemWrapper>{parsePivChildren(props.children(item, idx))}</ItemWrapper>
          {idx() < itemLength() - 1 &&
            "Divider" in kitProps &&
            parsePivChildren(shrinkFn(kitProps.renderDivider, [{ prevIndex: idx, currentIndex: () => idx() + 1 }]))}
        </Fragnment>
      )}
    </For>
  )
  return (
    <BoxWrapper domRef={setRef} shadowProps={shadowProps}>
      {content}
    </BoxWrapper>
  )
}
