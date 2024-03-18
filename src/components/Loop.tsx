import { MayFn, shrinkFn } from "@edsolater/fnkit"
import { For, JSXElement, createMemo } from "solid-js"
import { KitProps, useKitProps } from "../createKit"
import { createRef } from "../hooks/createRef"
import { AddProps, PivChild, parsePivChildren } from "../piv"

export interface LoopController {}

type ComponentStructure = (...anys: any[]) => JSXElement

export type LoopProps<T> = {
  wrapper?: ComponentStructure
  of?: MayFn<Iterable<T>>
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
  const Wrapper = kitProps.wrapper ?? AddProps //TODO: 🤔 maybe kitProps just export  Wrapper instead of shadowProps

  // [configs]
  const allItems = createMemo(() => Array.from(shrinkFn(props.of ?? []) as T[]))

  // [loop ref]
  const [loopRef, setRef] = createRef<HTMLElement>()

  const content = <For each={allItems()}>{(item, idx) => parsePivChildren(props.children(item, idx))}</For>
  return (
    <Wrapper domRef={setRef} shadowProps={shadowProps}>
      {content}
    </Wrapper>
  )
}
