import { MayFn, shrinkFn } from "@edsolater/fnkit"
import { For, JSXElement, createMemo, type Accessor } from "solid-js"
import { KitProps, useKitProps } from "../createKit"
import { createRef } from "../hooks/createRef"
import { AddProps, Fragnment, Piv, PivChild, parsePivChildren, type PivProps } from "../piv"

export interface LoopController {}

type ComponentStructure = (...anys: any[]) => JSXElement

export type LoopProps<T> = {
  renderWrapper?: ComponentStructure
  renderListItemWrapper?: ComponentStructure

  items?: MayFn<Iterable<T>>

  Divider?: MayFn<PivChild, [payload: { prevIndex: Accessor<number>; currentIndex: Accessor<number> }]>
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
    name: "Loop",
    noNeedDeAccessifyChildren: true,
  })
  const BoxWrapper = kitProps.renderWrapper ?? AddProps
  const ItemWrapper = kitProps.renderWrapper ?? Fragnment

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
            parsePivChildren(shrinkFn(kitProps.Divider, [{ prevIndex: idx, currentIndex: () => idx() + 1 }]))}
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


