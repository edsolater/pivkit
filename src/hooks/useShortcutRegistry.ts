import { createSubscribable, flap, isArray, shrinkFn, toList, type MayFn, type WeakerMap } from "@edsolater/fnkit"
import { createEffect, createMemo, onCleanup } from "solid-js"
import { addShortcutEventListener, type KeybordShortcutKeys } from "../domkit"
import { type ShortcutItem } from "../plugins/useKeyboardShortcut"
import { getElementFromRef, type ElementRef } from "../utils"
import { useSubscribable } from "./useSubscribable"

type ShortcutDiscription = string
type RegisteredShortcuts = Map<ShortcutDiscription, ShortcutItem>

export type ShortcutStore = WeakMap<HTMLElement, RegisteredShortcuts>

const shortcutCache: ShortcutStore = new WeakMap()
const shortcutCacheSubscribable = createSubscribable(shortcutCache)

export function registerShortcut(shortcutItem: ShortcutItem) {
  const el = shrinkFn(shortcutItem.targetElement)

  shortcutCacheSubscribable.set(
    (shortcutCache) => {
      const oldShortcutRuleRecord = shortcutCache.get(el)
      const newShortcutRuleRecord = new Map(oldShortcutRuleRecord)
      newShortcutRuleRecord.set(shortcutItem.description, shortcutItem)
      shortcutCache.set(el, newShortcutRuleRecord)
      return shortcutCache
    },
    { force: true },
  ) // force invoke subscribable

  const shortcutSetting = flap(shortcutItem.shortcut).reduce((acc, shortcutKey) => {
    if (isArray(shortcutKey)) {
      for (const key of shortcutKey) {
        acc[key] = shortcutItem.action
      }
    } else {
      acc[shortcutKey] = shortcutItem.action
    }
    return acc
  }, {})
  const shortcutSubscription = addShortcutEventListener(el, shortcutSetting)
  return {
    remove: () => {
      shortcutSubscription.cancel()
      shortcutCacheSubscribable.set(
        (shortcutCache) => {
          if (shortcutCache.has(el)) {
            const cacheMap = shortcutCache.get(el)
            if (cacheMap) {
              cacheMap.delete(shortcutItem.description)
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

//TODO: focus-within
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
        action() {
          if (isFeatureEnabled()) {
            return rule.action()
          }
        },
      })
      onCleanup(remove)
    }
  })

  function updateShortcut(description: string, item: Partial<Omit<ShortcutItem, "targetElement" | "description">>) {
    const el = getElementFromRef(ref)
    if (!el) return
    const oldShortcutItem = shortcutCacheSubscribable().get(el)?.get(description)
    if (!oldShortcutItem) return
    registerShortcut({ ...oldShortcutItem, ...item })
  }

  return { updateShortcut }
}

// watcher means info watcher
export function useShortcutsInfo(ref: ElementRef) {
  const el = getElementFromRef(ref)
  const shortcutCache = useSubscribable(shortcutCacheSubscribable)
  const settings = createMemo(() => shortcutCache()?.get(el))
  const shortcuts = () => toList(settings())
  return { shortcuts }
}
