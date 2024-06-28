import {
  getEntryKey,
  getEntryValue,
  shrinkFn,
  toEntries,
  type Collection,
  type Entry,
  type GetCollectionKey,
  type GetCollectionValue,
  type MayFn,
} from "@edsolater/fnkit"
import {
  For,
  Show,
  createContext,
  createDeferred,
  createEffect,
  createMemo,
  createSignal,
  on,
  type Accessor,
  type JSXElement,
} from "solid-js"
import { useKitProps, type KitProps } from "../../createKit"
import { useIntersectionObserver, type ObserveFn } from "../../webTools/hooks/useIntersectionObserver"
import { useScrollDegreeDetector } from "../../webTools/hooks/useScrollDegreeDetector"
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
   * @default auto =clamp(5, itemCount / 10, 20)
   */
  increaseRenderCount?: number
  /**
   * @default 20
   * can accept Infinity
   */
  initRenderCount?: number
  /**
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
  { name: "InfiniteScrollListController" },
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
      const key = getEntryKey(entry)
      const value = getEntryValue(entry)
      const canReuse = innerEntryMap.has(key) && getEntryValue(innerEntryMap.get(key)!) === value
      if (canReuse) {
        resultList.push(innerEntryMap.get(key)!)
      } else {
        innerEntryMap.set(key, entry)
        resultList.push(entry)
      }
      traveledKeys.add(key)
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
    () => props.increaseRenderCount ?? Math.min(Math.max(Math.floor(allItems().length / 10), 5), 20),
  )
  const initRenderCount = createMemo(() => props.initRenderCount ?? Math.min(allItems().length, 20))
  // [actually showed item count]
  const [renderItemLength, setRenderItemLength] = createSignal(initRenderCount())

  const allRenderableItems = createMemo(() => allItems().slice(0, renderItemLength() + initRenderCount()))

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
    const needRenderDom = createMemo(() => checkNeedRenderByIndex(idx(), renderItemLength()))
    return (
      <Show when={needRenderDom()}>
        <InfiniteScrollListItem>
          {() => props.children(getEntryValue(entry), getEntryKey(entry), idx)}
        </InfiniteScrollListItem>
      </Show>
    )
  }

  return (
    <InfiniteScrollListContext.Provider value={{ observeFunction: observe, renderItemLength }}>
      <Piv domRef={setRef} shadowProps={props} icss={{ overflow: "auto", contain: "paint" }}>
        <For each={allRenderableItems()}>{renderListItems}</For>
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
