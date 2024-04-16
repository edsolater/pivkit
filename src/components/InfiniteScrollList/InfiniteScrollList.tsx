import {
  MayFn,
  shrinkFn,
  toEntries,
  type Collection,
  type Entry,
  type GetCollectionKey,
  type GetCollectionValue,
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
import { InfiniteScrollListItem } from "./InfiniteScrollListItem"

export interface InfiniteScrollListController {
  resetRenderCount(): void
}
export type InfiniteScrollListProps<T extends Collection> = {
  /**
   * async render for get init frame faster
   */
  async?: boolean
  items?: MayFn<T>
  children(item: GetCollectionValue<T>, key: GetCollectionKey<T>, idx: () => number): JSXElement

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
export type InfiniteScrollListKitProps<T extends Collection> = KitProps<
  InfiniteScrollListProps<T>,
  { controller: InfiniteScrollListController }
>

export interface InnerInfiniteScrollListContext {
  observeFunction?: ObserveFn<HTMLElement>
  renderItemLength?: Accessor<number>
}

export const InfiniteScrollListContext = createContext<InnerInfiniteScrollListContext>(
  {} as InnerInfiniteScrollListContext,
  { name: "ListController" },
)

/**
 * if for layout , don't render important content in Box
 * as hidden item, there is two different list item: not rendered and solidjs rendered but dom hidden
 */
export function InfiniteScrollList<T extends Collection>(kitProps: InfiniteScrollListKitProps<T>) {
  const { props, lazyLoadController } = useKitProps(kitProps, {
    name: "InfiniteScrollList",
    noNeedDeAccessifyChildren: true,
    defaultProps: {
      reachBottomMargin: 50,
    },
  })

  // [configs]

  // entry map to ensure, same value will get same entry map
  let innerEntryMap: Map<any, Entry> = new Map()

  // entry map utils to ensure, same value will get same entry map
  function getEntriesFromItems(items: Collection): Entry[] {
    const entriesIterables = toEntries(items)
    const resultList = [] as Entry[]
    const traveledKeys = new Set()
    for (const entry of entriesIterables) {
      const canReuse = innerEntryMap.has(entry.key) && innerEntryMap.get(entry.key)!.value === entry.value
      if (canReuse) {
        resultList.push(innerEntryMap.get(entry.key)!)
      } else {
        innerEntryMap.set(entry.key, entry)
        resultList.push(entry)
      }
      traveledKeys.add(entry.key)
    }
    // release unnecessary cached entry
    for (const key of innerEntryMap.keys()) {
      if (!traveledKeys.has(key)) {
        innerEntryMap.delete(key)
      }
    }
    return resultList
  }

  const _allItems = (
    props.async
      ? createAsyncMemo(async () => {
          const items = await shrinkFn(props.items ?? [])
          return getEntriesFromItems(items)
        }, [])
      : createMemo(() => {
          const items = shrinkFn(props.items ?? [])
          return getEntriesFromItems(items)
        })
  ) as () => Entry<GetCollectionValue<T>, GetCollectionKey<T>>[]
  const allItems = createDeferred(_allItems) // ⚡ to smoother the render
  const increaseRenderCount = createMemo(
    () => props.increaseRenderCount ?? Math.min(Math.floor(allItems().length / 10), 30),
  )
  const initRenderCount = createMemo(() => props.initRenderCount ?? Math.min(allItems().length, 50))
  // [actually showed item count]
  const [renderItemLength, setRenderItemLength] = createSignal(initRenderCount())

  // [list ref]
  const [listRef, setRef] = createRef<HTMLElement>()

  // [add to context, this observer can make listItem can auto render or not]
  const { observe } = useIntersectionObserver({
    rootRef: listRef,
    options: { rootMargin: "100%" },
  })

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

  const resetRenderCount: InfiniteScrollListController["resetRenderCount"] = () => {
    setRenderItemLength(initRenderCount())
  }

  const controller = { resetRenderCount } as InfiniteScrollListController
  lazyLoadController(controller)

  const renderListItems = (entry: Entry, idx: () => number) => {
    const needRender = createMemo(() => checkNeedRenderByIndex(idx(), renderItemLength()))
    return (
      <Show when={needRender}>
        <InfiniteScrollListItem initVisiable={needRender}>{() => props.children(entry.value, entry.key, idx)}</InfiniteScrollListItem>
      </Show>
    )
  }

  return (
    <InfiniteScrollListContext.Provider value={{ observeFunction: observe, renderItemLength }}>
      <Piv domRef={setRef} shadowProps={props} icss={{ overflow: "auto", contain: "paint" }}>
        <For each={allItems()}>{renderListItems}</For>
      </Piv>
    </InfiniteScrollListContext.Provider>
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
