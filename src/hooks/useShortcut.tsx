import { createSubscribable, flap, shrinkFn, toList, type AnyFn, type MayFn } from "@edsolater/fnkit"
import { createEffect, onCleanup } from "solid-js"
import { addShortcutEventListener, type KeybordShortcutKeys } from "../domkit"
import { type ShortcutItem } from "../plugins/useKeyboardShortcut"
import { useSubscribable } from "./useSubscribable"
import { getElementFromRef, type ElementRef } from "../utils"

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
      console.log("shortcutCache.get(el): ", shortcutCache.get(el))
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
) {
  const isFeatureEnabled = () => {
    const enabled = shrinkFn(otherOptions?.enabled)
    const disabled = shrinkFn(otherOptions?.disabled)
    const isEnabled = enabled != null ? enabled : !disabled
    return isEnabled
  }

  console.log(1)
  createEffect(() => {
    const el = getElementFromRef(ref)
    console.log("el: ", setting)
    if (!el) return
    for (const [desc, rule] of Object.entries(setting)) {
      // use for ? 🤔
      const { remove } = registerShortcut({
        targetElement: el,
        description: desc,
        shortcut: rule.shortcut,
        fn() {
          if (!isFeatureEnabled()) return
          rule.fn()
        },
      })
      onCleanup(remove)
    }
  })
}

// watcher means info watcher
export function useShortcutsInfo(ref: ElementRef) {
  const el = getElementFromRef(ref)
  const shortcutCache = useSubscribable(shortcutCacheSubscribable)

  const shortcuts = () => toList(shortcutCache()?.get(el))
  return { shortcuts }
}
