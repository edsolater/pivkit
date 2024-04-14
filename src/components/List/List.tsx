import {
  MayFn,
  shrinkFn,
  toEntries,
  toList,
  type Collection,
  type Entry,
  type GetCollectionKey,
  type GetCollectionValue,
  type Items,
} from "@edsolater/fnkit"
import {
  Accessor,
  For,
  JSXElement,
  Show,
  createContext,
  createDeferred,
  createEffect,
  createMemo,
  createSignal,
  on,
} from "solid-js"
import { KitProps, useKitProps } from "../../createKit"
import { ObserveFn, useIntersectionObserver } from "../../domkit/hooks/useIntersectionObserver"
import { useScrollDegreeDetector } from "../../domkit/hooks/useScrollDegreeDetector"
import { createAsyncMemo } from "../../hooks/createAsyncMemo"
import { createRef } from "../../hooks/createRef"
import { Piv } from "../../piv"
import { ListItem } from "./ListItem"

export interface ListController {
  resetRenderCount(): void
}
export type ListProps<T extends Collection> = {
  items?: MayFn<T>
  children(item: GetCollectionValue<T>, key: GetCollectionKey<T>, idx: () => number): JSXElement

  /** lazy render for get init frame faster */
  async?: boolean
  /**
   * only meaningfull when turnOnScrollObserver is true
   * @default 30
   */
  increaseRenderCount?: number
  /**
   * only meaningfull when turnOnScrollObserver is true
   * @default 30
   * can accept Infinity
   */
  initRenderCount?: number
  /**
   * only meaningfull when turnOnScrollObserver is true
   * @default 50(px)
   */
  reachBottomMargin?: number
}
export type ListKitProps<T extends Collection> = KitProps<ListProps<T>, { controller: ListController }>

export interface InnerListContext {
  observeFunction?: ObserveFn<HTMLElement>
  renderItemLength?: Accessor<number>
}

export const ListContext = createContext<InnerListContext>({} as InnerListContext, { name: "ListController" })

/**
 * if for layout , don't render important content in Box
 */
export function List<T extends Collection>(kitProps: ListKitProps<T>) {
  const { props, lazyLoadController } = useKitProps(kitProps, {
    name: "List",
    noNeedDeAccessifyChildren: true,
    defaultProps: {
      reachBottomMargin: 50,
    },
  })

  // [configs]

  const _allItems = (
    props.async
      ? createAsyncMemo(() => [...toEntries(shrinkFn(props.items ?? []))], [])
      : createMemo(() => [...toEntries(shrinkFn(props.items ?? []))])
  ) as () => Entry<GetCollectionValue<T>, GetCollectionKey<T>>[]
  const allItems = createDeferred(_allItems) // ⚡ to smoother the render
  const increaseRenderCount = createMemo(
    () => props.increaseRenderCount ?? Math.min(Math.floor(allItems().length / 10), 30),
  )
  const initRenderCount = createMemo(() => props.initRenderCount ?? Math.min(allItems().length, 50))

  // [list ref]
  const [listRef, setRef] = createRef<HTMLElement>()

  // [add to context, this observer can make listItem can auto render or not]
  const { observe } = useIntersectionObserver({
    rootRef: listRef,
    options: { rootMargin: "100%" },
  })

  // [actually showed item count]
  const [renderItemLength, setRenderItemLength] = createSignal(initRenderCount())

  // [scroll handler]
  const { forceCalculate } = useScrollDegreeDetector(listRef, {
    onReachBottom: () => {
      setRenderItemLength((n) => n + increaseRenderCount())
    },
    reachBottomMargin: props.reachBottomMargin,
  })

  // reset when items.length changed
  createEffect(
    on(
      () => allItems().length,
      () => {
        setRenderItemLength(initRenderCount())
        forceCalculate()
      },
    ),
  )

  const resetRenderCount: ListController["resetRenderCount"] = () => {
    setRenderItemLength(initRenderCount())
  }

  const controller = { resetRenderCount } as ListController
  lazyLoadController(controller)

  const renderListItems = (entry: Entry, idx: () => number) => {
    return (
      <Show when={checkNeedRenderByIndex(idx(), renderItemLength())}>
        <ListItem>{() => props.children(entry.value, entry.key, idx)}</ListItem>
      </Show>
    )
  }

  return (
    <ListContext.Provider value={{ observeFunction: observe, renderItemLength }}>
      <Piv domRef={setRef} shadowProps={props} icss={{ overflow: "auto", contain: "paint" }}>
        <For each={allItems()}>{renderListItems}</For>
      </Piv>
    </ListContext.Provider>
  )
}

/**
 * render may be not visiable
 */
function checkNeedRenderByIndex(idx: number | undefined, renderItemLength: number | undefined) {
  if (idx == null) return false
  if (renderItemLength == null) return false
  return idx <= renderItemLength
}
