import { createSubscribable, flap, shrinkFn, toList, type MayFn, type WeakerMap } from "@edsolater/fnkit"
import { createEffect, createMemo, onCleanup } from "solid-js"
import { addShortcutEventListener, type KeybordShortcutKeys } from "../domkit"
import { type ShortcutItem } from "../plugins/useKeyboardShortcut"
import { getElementFromRef, type ElementRef } from "../utils"
import { useSubscribable } from "./useSubscribable"

type ShortcutRuleRecord = Record<KeybordShortcutKeys, ShortcutItem>

export type ShortcutMap = WeakMap<HTMLElement, ShortcutRuleRecord>

const shortcutCache: ShortcutMap = new WeakMap()
const shortcutCacheSubscribable = createSubscribable(shortcutCache)

function toShortcutRuleMap(shortcutItem: ShortcutItem) {
  return flap(shrinkFn(shortcutItem.shortcut)).reduce((acc, key) => {
    acc[key] = shortcutItem
    return acc
  }, {} as ShortcutRuleRecord)
}

export function registerShortcut(shortcutItem: ShortcutItem) {
  const el = shrinkFn(shortcutItem.targetElement)

  shortcutCacheSubscribable.set(
    (shortcutCache) => {
      shortcutCache.set(
        el,
        shortcutCache.has(el)
          ? { ...shortcutCache.get(el), ...toShortcutRuleMap(shortcutItem) }
          : toShortcutRuleMap(shortcutItem),
      )

      return shortcutCache
    },
    { force: true },
  ) // force invoke subscribable

  const shortcutSetting = flap(shortcutItem.shortcut).reduce((acc, shortcutKey) => {
    acc[shortcutKey] = shortcutItem.fn
    return acc
  }, {})
  const shortcutSubscription = addShortcutEventListener(el, shortcutSetting)
  return {
    remove: () => {
      shortcutSubscription.abort()
      shortcutCacheSubscribable.set(
        (shortcutCache) => {
          if (shortcutCache.has(el)) {
            const shortcutRuleMap = toShortcutRuleMap(shortcutItem)
            const cacheMap = shortcutCache.get(el)
            if (cacheMap) {
              for (const rule of Object.keys(shortcutRuleMap)) {
                delete cacheMap[rule]
              }
            }
            if (cacheMap && Object.keys(cacheMap).length === 0) {
              shortcutCache.delete(el)
            }
          }
          return shortcutCache
        },
        { force: true },
      ) // force invoke subscribable
    },
  }
}

/**
 * HOOK
 * a convenient fast util for {@link registerShortcut}
 */
export function useShortcutsRegister(
  ref: ElementRef,
  setting: { [key: string]: Omit<ShortcutItem, "targetElement" | "description"> },
  otherOptions?: {
    when?: MayFn<boolean>
    disabled?: MayFn<boolean>
    enabled?: MayFn<boolean>
  },
): {
  updateShortcut: (description: string, item: Partial<Omit<ShortcutItem, "targetElement" | "description">>) => void
} {
  const isFeatureEnabled = () => {
    const enabled = shrinkFn(otherOptions?.enabled)
    const disabled = shrinkFn(otherOptions?.disabled)
    const isEnabled = enabled != null ? enabled : !disabled
    return isEnabled
  }

  createEffect(() => {
    const el = getElementFromRef(ref)
    if (!el) return
    for (const [desc, rule] of Object.entries(setting)) {
      // use for ? 🤔
      const { remove } = registerShortcut({
        targetElement: el,
        description: desc,
        shortcut: rule.shortcut,
        fn() {
          if (isFeatureEnabled()) {
            return rule.fn()
          }
        },
      })
      onCleanup(remove)
    }
  })

  function updateShortcut(description: string, item: Partial<Omit<ShortcutItem, "targetElement" | "description">>) {
    const el = getElementFromRef(ref)
    if (!el) return
    const oldShortcutItems = getShortcutItemsFromDescription(el, description)
    if (!oldShortcutItems || oldShortcutItems.length === 0) return
    deleteShortcutItemsFromDescription(el, description)
    registerShortcut({ ...oldShortcutItems[0]!, ...item })
  }

  return { updateShortcut }
}

function getShortcutItemsFromDescription(el: HTMLElement, description: string): ShortcutItem[] | undefined {
  const cacheMap = shortcutCacheSubscribable().get(el)
  if (!cacheMap) return
  const shortcutItems = Object.values(cacheMap).filter(({ description: desc }) => desc === description)
  return shortcutItems
}

function deleteShortcutItemsFromDescription(el: HTMLElement, description: string) {
  const cacheMap = shortcutCacheSubscribable().get(el)
  if (!cacheMap) return
  for (const [key, item] of Object.entries(cacheMap)) {
    if (item.description === description) {
      delete cacheMap[key]
    }
  }
}
// watcher means info watcher
export function useShortcutsInfo(ref: ElementRef) {
  const el = getElementFromRef(ref)
  const shortcutCache = useSubscribable(shortcutCacheSubscribable)
  const settings = createMemo(() => shortcutCache()?.get(el))
  const shortcuts = () => toList(settings())
  return { shortcuts }
}
