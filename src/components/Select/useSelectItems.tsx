import { Accessor, createEffect, createMemo, createSignal } from "solid-js"
import { isNumber, isObject, isString, shrinkFn } from "@edsolater/fnkit"
import { useKitProps, type KitProps } from "../../createKit"

/**
 * used in {@link useSelectItems}
 */
function defaultGetItemValue(item: any): string | number {
  return isString(item) || isNumber(item)
    ? item
    : isObject(item)
      ? item["value"] ?? item["id"] ?? item["key"] ?? String(item)
      : String(item)
}

/**
 * provide some methods to manage items
 * - {@link selectedItem} current active item
 * - {@link itemList} all items
 * - {@link setItem} set current active item
 *
 * - {@link addItemToItemList} add one or multi items
 * - {@link removeItemOfItemList} remove one or multi items
 * - {@link updateItemList} update all candidates items
 *
 *
 * value should be unique, it is used as unique key
 */
export function useSelectItems<T>(
  kitOptions: KitProps<{
    items?: T[]

    //if both value and defaultValue are not specified, the first item will be used as default value
    value?: T
    defaultValue?: T
    /** value is used in onChange, value is also used as key */
    getItemValue?: (item: T) => string
    /** only invoked when options:value is not currentValue */
    onChange?(utils: { item: Accessor<T>; index: Accessor<number>; itemValue: Accessor<string> }): void
    onFocusChange?(utils: { item: Accessor<T>; index: Accessor<number>; itemValue: Accessor<string> }): void
    onClear?(): void
  }>,
) {
  //TODO: maybe sub-module of `useKitProps` --- `useAccessifyOptions` is better
  const { props: options, rawProps: rawOptions } = useKitProps(kitOptions, {
    name: "useSelectItems",
    noNeedDeAccessifyProps: ["getItemValue"],
  })
  //#region ------------------- item list -------------------
  const [itemList, setItemList] = createSignal(options?.items ?? [])
  createEffect(() => {
    setItemList(options?.items ?? [])
  })
  function updateItemList(newItems: T[]) {
    setItemList(newItems)
  }
  function addItemToItemList(...newItems: T[]) {
    updateItemList([...itemList(), ...newItems])
  }
  function removeItemOfItemList(...newItems: T[]) {
    updateItemList(itemList().filter((item) => !newItems.includes(item)))
  }
  //#endregion

  //#region ---------------- items utils ----------------
  function getItemValue(item: T | undefined): string {
    return String(item ? rawOptions?.getItemValue?.(item) ?? defaultGetItemValue(item) : defaultGetItemValue(item))
  }
  //#endregion

  //#region ------------------- select item -------------------
  const {
    item: selectedItem,
    index: selectedItemIndex,
    setItem,
    reset,
    undo,
    redo,
    selectPrevItem,
    selectNextItem,
  } = useItemManager({
    items: itemList,
    defaultValue: options?.defaultValue,
    value: options?.value,
    getItemValue,
    onChange: options?.onChange,
    onClear: options?.onClear,
  })
  createEffect(() => {
    const item = options?.value
    if (item) setItem(item)
  })
  //#endregion

  //#region ------------------- focus item -------------------
  const {
    item: focusItem,
    index: focusItemIndex,
    setItem: setFocusItem,
    reset: clearFocusItem,
    selectPrevItem: focusPrevItem,
    selectNextItem: focusNextItem,
    undo: undoFocusItem,
    redo: redoFocusItem,
  } = useItemManager({
    items: itemList,
    mutedItems: () => [selectedItem()],
    getItemValue,
    onChange: options?.onFocusChange,
  })
  /**
   * a helper function to select the focused item
   */
  function selectFromFocusedItem() {
    setItem(focusItem())
  }
  //#endregion

  return {
    updateItemList,
    addItemToItemList,
    removeItemOfItemList,

    items: itemList,

    selectedItem,
    selectedItemIndex,
    setItem,
    resetItem: reset,
    undo: undo,
    redo: redo,
    selectPrevItem, // really need?🤔
    selectNextItem, // really need?🤔

    /** the item that can select by fast focusItem */
    focusItem,
    focusItemIndex,
    setFocusItem,
    clearFocusItem,
    undoFocusItem,
    redoFocusItem,
    focusPrevItem,
    focusNextItem,
    selectFromFocusedItem,

    getItemValue,
  }
}

/**
 * only used in {@link useSelectItems}
 */
function useItemManager<T>(options: {
  items: Accessor<T[]>
  /** will jump pass the muted items */
  mutedItems?: Accessor<(T | undefined)[]>
  defaultValue?: T
  value?: T
  getItemValue: (item: T | undefined) => string | number
  onChange?(utils: { item: Accessor<T>; index: Accessor<number>; itemValue: Accessor<string | number> }): void
  onClear?(): void
}) {
  const [activeItem, setInnerActiveItem] = createSignal<T | undefined>(options?.defaultValue ?? options?.value)
  const selectedItemsHistory = [activeItem()] as (T | undefined)[]
  const redoStack = [] as (T | undefined)[]
  const activeItemIndex = createMemo(() => {
    const item = activeItem()
    if (!item) return undefined
    const idx = options.items()?.indexOf(item)
    return idx >= 0 ? idx : undefined
  })

  function setItem(newItem: T | undefined | ((prev: T | undefined) => T | undefined)) {
    const newI = shrinkFn(newItem, [activeItem()]) as T | undefined
    if (newI == null) {
      reset() // is this right?🤔
    } else {
      const newItemIsInItems = options.items()?.includes(newI)
      if (newI !== activeItem() && newItemIsInItems) {
        setInnerActiveItem(() => newI)
        recordItemToHistory(newI)
        if (!redoStack.includes(newI)) {
          clearRedoStack()
        }
        options?.onChange?.({
          item: () => newI,
          index: () => activeItemIndex()!,
          itemValue: () => options.getItemValue(activeItem()),
        })
      }
    }
  }
  function clearRedoStack() {
    redoStack.length = 0
  }
  function recordItemToHistory(item: T | undefined) {
    selectedItemsHistory.push(item)
  }
  function reset() {
    // TODO: this can't redo all at once
    if (selectedItemsHistory.length <= 1) return // there is no item to undo
    const undoItems = selectedItemsHistory.slice(1)
    selectedItemsHistory.splice(1)
    const currentTopOfItemHistory = selectedItemsHistory.at(-1)
    setInnerActiveItem(() => currentTopOfItemHistory)
    redoStack.push(...undoItems)
    options?.onClear?.()
  }
  function undo() {
    if (selectedItemsHistory.length <= 1) return // there is no item to undo
    const undoItem = selectedItemsHistory.at(-1)
    selectedItemsHistory.pop()
    const currentTopOfItemHistory = selectedItemsHistory.at(-1)
    setInnerActiveItem(() => currentTopOfItemHistory)
    redoStack.push(undoItem)
  }
  function redo() {
    if (redoStack.length <= 0) return // there is no item to redo
    const redoItem = redoStack.at(-1)
    redoStack.pop()
    recordItemToHistory(redoItem)
    setInnerActiveItem(() => redoItem)
  }
  function selectPrevItem(step = 1) {
    const items = options.items()
    if (!items) return
    const idx = activeItemIndex() ?? 0
    const prevItem = items.at(idx - step)
    if (!prevItem) return
    // bypass the muted items
    if (options.mutedItems?.()?.includes(prevItem)) return selectPrevItem(step + 1)
    setItem(prevItem)
  }
  function selectNextItem(step = 1) {
    const items = options.items()
    if (!items) return
    const idx = activeItemIndex() ?? -1
    const nextItem = items.at((idx + step) % items.length)
    if (!nextItem) return
    // bypass the muted items
    if (options.mutedItems?.()?.includes(nextItem)) return selectNextItem(step + 1)
    setItem(nextItem)
  }

  return {
    item: activeItem,
    index: activeItemIndex,
    setItem,
    reset,
    undo,
    redo,
    selectPrevItem,
    selectNextItem,
  }
}
