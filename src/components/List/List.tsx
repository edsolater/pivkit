import { MayFn, shrinkFn } from '@edsolater/fnkit'
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
} from 'solid-js'
import { KitProps, useKitProps } from '../../createKit'
import { ObserveFn, useIntersectionObserver } from '../../domkit/hooks/useIntersectionObserver'
import { useScrollDegreeDetector } from '../../domkit/hooks/useScrollDegreeDetector'
import { createAsyncMemo } from '../../hooks/createAsyncMemo'
import { createRef } from '../../hooks/createRef'
import { Piv } from '../../piv'
import { ListItem } from './ListItem'
import { toArray } from '../../fnkit/itemMethods'

export type ItemList<T> =
  | Map<any, T>
  | Set<T>
  | T[]
  | Record<keyof any, T>
  | IterableIterator<T>
  | Iterable<T>
  | undefined
export interface ListController {
  resetRenderCount(): void
}
export type ListProps<T> = {
  children(item: T, index: () => number): JSXElement
  items?: MayFn<ItemList<T>>

  /** lazy render for get init frame faster */
  lazy?: boolean
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
export type ListKitProps<T> = KitProps<ListProps<T>, { controller: ListController }>

export interface InnerListContext {
  observeFunction?: ObserveFn<HTMLElement>
  renderItemLength?: Accessor<number>
}

export const ListContext = createContext<InnerListContext>({} as InnerListContext, { name: 'ListController' })

/**
 * if for layout , don't render important content in Box
 */
export function List<T>(kitProps: ListKitProps<T>) {
  const { props, lazyLoadController } = useKitProps(kitProps, {
    name: 'List',
    noNeedDeAccessifyChildren: true,
    defaultProps: {
      reachBottomMargin: 50,
    },
  })

  // [configs]

  const _allItems = props.lazy
    ? createAsyncMemo(() => toArray(shrinkFn(props.items ?? [])), [] as T[])
    : createMemo(() => toArray(shrinkFn(props.items ?? [])))
  const allItems = createDeferred(_allItems) // ⚡ to smoother the render
  const increaseRenderCount = createMemo(
    () => props.increaseRenderCount ?? Math.min(Math.floor(allItems().length / 10), 30)
  )
  const initRenderCount = createMemo(() => props.initRenderCount ?? Math.min(allItems().length, 50))

  // [list ref]
  const [listRef, setRef] = createRef<HTMLElement>()

  // [add to context, this observer can make listItem can auto render or not]
  const { observe } = useIntersectionObserver({
    rootRef: listRef,
    options: { rootMargin: '100%' },
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
      }
    )
  )

  const resetRenderCount: ListController['resetRenderCount'] = () => {
    setRenderItemLength(initRenderCount())
  }

  const controller = { resetRenderCount } as ListController
  lazyLoadController(controller)

  const renderListItems = (item: T, idx: () => number) => {
    return (
      <Show when={checkNeedRenderByIndex(idx(), renderItemLength())}>
        <ListItem>{() => props.children(item, idx)}</ListItem>
      </Show>
    )
  }

  return (
    <ListContext.Provider value={{ observeFunction: observe, renderItemLength }}>
      <Piv domRef={setRef} shadowProps={props} icss={{ overflow: 'auto', contain: 'paint' }}>
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
