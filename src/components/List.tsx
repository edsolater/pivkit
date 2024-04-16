import { MayFn, shrinkFn } from "@edsolater/fnkit"
import { For, JSXElement, createMemo } from "solid-js"
import { KitProps, useKitProps } from "../createKit"
import { createRef } from "../hooks/createRef"
import { AddProps, PivChild, parsePivChildren } from "../piv"

export interface ListController {}

type ComponentStructure = (...anys: any[]) => JSXElement

export type ListProps<T> = {
  wrapper?: ComponentStructure
  items?: MayFn<Iterable<T>>
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
  const allItems = createMemo(() => Array.from(shrinkFn(props.items ?? []) as T[]))

  // [loop ref]
  const [componentWrapperRef, setRef] = createRef<HTMLElement>()

  const content = <For each={allItems()}>{(item, idx) => parsePivChildren(props.children(item, idx))}</For>
  return (
    <Wrapper domRef={setRef} shadowProps={shadowProps}>
      {content}
    </Wrapper>
  )
}
