import { MayFn, shrinkFn } from "@edsolater/fnkit"
import { For, JSXElement, createMemo, type Accessor } from "solid-js"
import { KitProps, useKitProps } from "../createKit"
import { createRef } from "../hooks/createRef"
import { AddProps, Fragnment, PivChild, parsePivChildren } from "../piv"
import { Box } from "./Boxes"

export interface ListController {}

type ComponentStructure = (...anys: any[]) => JSXElement

export type ListProps<T> = {
  wrapper?: ComponentStructure
  items?: MayFn<Iterable<T>>

  Divider?: MayFn<PivChild, [payload: { prevIndex: Accessor<number>; currentIndex: Accessor<number> }]>
  sortCompareFn?: (a: T, b: T) => number

  children(item: T, index: () => number): PivChild
}

export type ListKitProps<T> = KitProps<ListProps<T>, { controller: ListController }>

/**
 * just a wrapper of <For>, very simple
 * if for layout , don't render important content in Box
 */
export function List<T>(kitProps: ListKitProps<T>) {
  const { props, shadowProps } = useKitProps(kitProps, {
    name: "List",
    noNeedDeAccessifyChildren: true,
  })
  const Wrapper = kitProps.wrapper ?? AddProps //TODO: 🤔 maybe kitProps just export  Wrapper instead of shadowProps

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
          <Box class="list-item">{parsePivChildren(props.children(item, idx))}</Box>
          {idx() < itemLength() - 1 &&
            "Divider" in kitProps &&
            parsePivChildren(shrinkFn(kitProps.Divider, [{ prevIndex: idx, currentIndex: () => idx() + 1 }]))}
        </Fragnment>
      )}
    </For>
  )
  return (
    <Wrapper domRef={setRef} shadowProps={shadowProps}>
      {content}
    </Wrapper>
  )
}
