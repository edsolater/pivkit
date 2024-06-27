import { shakeFalsy, toLowerCase, unifyItem } from "@edsolater/fnkit"
import { listenDomEvent, EventListenerController } from "./addDomEventListener"
import { makeFocusable } from "./focusable"

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
 */
export type ContentKeyName = KeyNamesActionKey | KeyNamesNavigation | KeyNamesNormalContent
export type AuxiliaryKeyName =
  | "ctrl"
  | "shift"
  | "alt"
  | "ctrl + alt"
  | "ctrl + shift"
  | "shift + alt"
  | "ctrl + shift + alt"
type KeyNamesActionKey = `F${number}` | "Backspace" | "Enter" | "Escape" | "Delete" | "Insert" | " "
type KeyNamesNormalContent =
  | "`"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "0"
  | "-"
  | "="
  | "q"
  | "w"
  | "e"
  | "r"
  | "t"
  | "y"
  | "u"
  | "i"
  | "o"
  | "p"
  | "["
  | "]"
  | "\\"
  | "a"
  | "s"
  | "d"
  | "f"
  | "g"
  | "h"
  | "j"
  | "k"
  | "l"
  | ";"
  | "'"
  | "z"
  | "x"
  | "c"
  | "v"
  | "b"
  | "n"
  | "m"
  | ","
  | "."
  | "/"
type KeyNamesNavigation =
  | "Tab"
  | "Home"
  | "PageUp"
  | "PageDown"
  | "End"
  | "ArrowUp"
  | "ArrowLeft"
  | "ArrowRight"
  | "ArrowDown"
export type KeybordShortcutKeys = `${`${AuxiliaryKeyName} + ` | ""}${ContentKeyName}`
export type KeyboardShortcutFn = () => void

export type KeyboardShortcutSettings = {
  [key in KeybordShortcutKeys]?: KeyboardShortcutFn
}

//#region ---------------- data state ----------------
const settingCache = new WeakMap<HTMLElement, KeyboardShortcutSettings>()

let haveListenToDocument = false
function startListenShortcutEvent() {
  if (!haveListenToDocument) {
    listenDomEvent(globalThis.document.documentElement, "keydown", ({ ev }) => {
      const pressedKey = getShorcutStringFromKeyboardEvent(ev)
      for (const target of ev.composedPath()) {
        const settings = settingCache.get(target as any)
        if (!settings) continue
        const targetShortcutFn = Reflect.get(settings, pressedKey)
        targetShortcutFn?.()
      }
    })
    haveListenToDocument = true
  }
}
//#endregion

export function addShortcutEventListener(
  el: HTMLElement,
  keyboardShortcutSettings: KeyboardShortcutSettings,
): { cancel(): void } {
  startListenShortcutEvent()
  // TODO: really need this?
  // if (!settingCache.has(el)) {
  //   makeFocusable(el) // keydown must have fousable element
  // }

  settingCache.set(el, { ...settingCache.get(el), ...keyboardShortcutSettings })
  return {
    cancel() {
      const targetSetting = settingCache.get(el)
      if (!targetSetting) return
      for (const shortcut of Object.keys(keyboardShortcutSettings)) {
        Reflect.deleteProperty(targetSetting, shortcut)
      }
    },
  }
}

/** this still not prevent **all** brower shortcut (like build-in ctrl T ) */
export function preventDefaultKeyboardShortcut(pureEl: HTMLElement) {
  pureEl.addEventListener(
    "keydown",
    (ev) => {
      ev.stopPropagation()
      ev.preventDefault()
    },
    { capture: true },
  )
}

const shiftKeyMap = new Map([
  ["~", "`"],
  ["!", "1"],
  ["@", "2"],
  ["#", "3"],
  ["$", "4"],
  ["%", "5"],
  ["^", "6"],
  ["&", "7"],
  ["*", "8"],
  ["(", "9"],
  [")", "0"],
  ["_", "-"],
  ["+", "="],
  ["{", "["],
  ["}", "]"],
  ["|", "\\"],
  [":", ";"],
  ['"', "'"],
  ["<", ","],
  [">", "."],
  ["?", "/"],

  ["A", "a"],
  ["B", "b"],
  ["C", "c"],
  ["D", "d"],
  ["E", "e"],
  ["F", "f"],
  ["G", "g"],
  ["H", "h"],
  ["I", "i"],
  ["J", "j"],
  ["K", "k"],
  ["L", "l"],
  ["M", "m"],
  ["N", "n"],
  ["O", "o"],
  ["P", "p"],
  ["Q", "q"],
  ["R", "r"],
  ["S", "s"],
  ["T", "t"],
  ["U", "u"],
  ["V", "v"],
  ["W", "w"],
  ["X", "x"],
  ["Y", "y"],
  ["Z", "z"],
])
function handleShiftedKey(key: string) {
  if (shiftKeyMap.has(key)) {
    return shiftKeyMap.get(key)
  }
  return key
}
/**
 * parse from original KeyboardEvent to a string
 * @example
 * getShorcutStringFromKeyboardEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'a' })) // 'ctrl + a'
 */
export function getShorcutStringFromKeyboardEvent(ev: KeyboardEvent) {
  const rawKey = areCaseInsensitiveEqual(ev.key, "control") ? "ctrl" : ev.key // special
  const keyArray = [
    ev.ctrlKey ? "ctrl" : undefined,
    ev.shiftKey ? "shift" : undefined,
    ev.altKey ? "alt" : undefined,
    ev.metaKey ? "meta" : undefined,
    handleShiftedKey(rawKey.replace(/(ctrl|shift|alt|meta)/i, "")),
  ].map((s) => s?.trim())
  return unifyItem(shakeFalsy(keyArray)).join(" + ")
}

export function areCaseInsensitiveEqual(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase()
}

/**
 * @example
 * formatKeyboardSettingString('ctrl+SHIFT+alt+A') // 'alt + ctrl + shift + a'
 */
export function formatKeyboardSettingString(keyString: string) {
  const keyArray = keyString.split(/\s?\+\s?/)
  return unifyItem(shakeFalsy(keyArray).map(toLowerCase)).sort().join(" + ")
}
