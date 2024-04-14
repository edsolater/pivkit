import {
  AnyObj,
  WeakerMap,
  WeakerSet,
  createSubscribable,
  isArray,
  isFunction,
  isString,
  shakeFalsy,
} from "@edsolater/fnkit"
import { KeyboardShortcutFn, KeyboardShortcutSettings, KeybordShortcutKeys } from "../domkit"

type Description = string

export type ShortcutItem = {
  description: string
  /** if not set, use documentElement */
  targetElement: HTMLElement
  fn: KeyboardShortcutFn
  shortcut: KeybordShortcutKeys | KeybordShortcutKeys[]
}

export type ShortcutRecord = Record<Description, ShortcutItem>

export function parseShortcutConfigFromSettings(settings: ShortcutRecord) {
  const configLists = shakeFalsy(
    Object.entries(settings).flatMap(([, { fn, shortcut }]) => {
      if (!shortcut) return []
      return isArray(shortcut) ? shortcut.map((key) => (key ? [key, fn] : undefined)) : [[shortcut, fn]]
    }),
  )
  return Object.fromEntries(configLists) as KeyboardShortcutSettings
}
