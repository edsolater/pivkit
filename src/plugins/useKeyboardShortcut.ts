import {
  isArray,
  shakeFalsy
} from "@edsolater/fnkit"
import { KeyboardShortcutFn, KeyboardShortcutSettings, KeybordShortcutKeys } from "../webTools"

type Description = string

export type ShortcutItem = {
  description: string
  /** if not set, use documentElement */
  targetElement: HTMLElement
  action: KeyboardShortcutFn
  shortcut: KeybordShortcutKeys | KeybordShortcutKeys[]
}

export type ShortcutRecord = Record<Description, ShortcutItem>

export function parseShortcutConfigFromSettings(settings: ShortcutRecord) {
  const configLists = shakeFalsy(
    Object.entries(settings).flatMap(([, { action, shortcut }]) => {
      if (!shortcut) return []
      return isArray(shortcut) ? shortcut.map((key) => (key ? [key, action] : undefined)) : [[shortcut, action]]
    }),
  )
  return Object.fromEntries(configLists) as KeyboardShortcutSettings
}
