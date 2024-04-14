import {
  AnyObj,
  MayFn,
  Subscribable,
  WeakerMap,
  WeakerSet,
  createSubscribable,
  isArray,
  isFunction,
  isString,
  mergeObjects,
  shakeFalsy,
  shrinkFn,
} from "@edsolater/fnkit"
import { Accessor, createEffect, createSignal, onCleanup } from "solid-js"
import {
  KeyboardShortcutFn,
  KeyboardShortcutSettings,
  KeybordShortcutKeys,
  bindKeyboardShortcutEventListener,
} from "../domkit"
import { Accessify, ElementRefs, getElementFromRefs } from "../utils"

type Description = string

export type ShortcutItem = {
  description: string
  /** if not set, use documentElement */
  targetElement?: HTMLElement
  fn: KeyboardShortcutFn
  shortcut: KeybordShortcutKeys | KeybordShortcutKeys[]
}

export type ShortcutRecord = Record<Description, ShortcutItem>

// hook info store, store registered keyboard shortcuts
const [registeredKeyboardShortcut, registeredKeyboardShortcutSubscribable] = makeSubscriable(
  new WeakerMap<HTMLElement, ShortcutRecord>(),
)

function registerLocalKeyboardShortcut(el: HTMLElement, settings: ShortcutRecord): { remove(): void } {
  registeredKeyboardShortcut.set(el, settings)
  return {
    remove() {
      registeredKeyboardShortcut.delete(el)
    },
  }
}

// TODO: should be plugin
/**
 * just a wrapper for {@link bindKeyboardShortcutEventListener}
 * if you want regist global shortcut, please use {@link useKeyboardGlobalShortcut}
 */
export function useKeyboardShortcut(
  ref: ElementRefs,
  settings?: ShortcutRecord,
  // TODO: imply this
  otherOptions?: {
    when?: MayFn<boolean>
    disabled?: MayFn<boolean>
    enabled?: Accessify<boolean>
  },
) {
  const [currentSettings, setCurrentSettings] = createSignal(settings ?? {})
  const isFeatureEnabled = () => {
    const enabled = shrinkFn(otherOptions?.enabled)
    const disabled = shrinkFn(otherOptions?.disabled)
    const isEnabled = enabled != null ? enabled : !disabled
    return isEnabled
  }
  // register keyboard shortcut
  createEffect(() => {
    const els = getElementFromRefs(ref)
    if (!els.length) return
    if (!isFeatureEnabled()) return
    const shortcuts = parseShortcutConfigFromSettings(currentSettings())
    els.forEach((el) => {
      const { abort } = bindKeyboardShortcutEventListener(el, shortcuts, { stopPropagation: true })
      const { remove } = registerLocalKeyboardShortcut(el, currentSettings())
      onCleanup(() => {
        abort()
        remove()
      })
    })
  })
  return {
    isFeatureEnabled,
    addSettings(newSettings: ShortcutRecord) {
      setCurrentSettings((prev) => mergeObjects(prev, newSettings))
    },
    setSettings(newSettings: ShortcutRecord) {
      setCurrentSettings(newSettings)
    },
  }
}

export function parseShortcutConfigFromSettings(settings: ShortcutRecord) {
  const configLists = shakeFalsy(
    Object.entries(settings).flatMap(([name, { fn, shortcut }]) => {
      if (!shortcut) return []
      return isArray(shortcut) ? shortcut.map((key) => (key ? [key, fn] : undefined)) : [[shortcut, fn]]
    }),
  )
  return Object.fromEntries(configLists) as KeyboardShortcutSettings
}

// TODO: move to pivkit
export function useSubscribable<T>(subscribable: Subscribable<T>): Accessor<T | undefined>
export function useSubscribable<T>(subscribable: Subscribable<T>, defaultValue: T): Accessor<T>
export function useSubscribable<T>(subscribable: Subscribable<T>, defaultValue?: T) {
  const [value, setValue] = createSignal(subscribable() ?? defaultValue, { equals: false })
  createEffect(() => {
    const { unsubscribe } = subscribable.subscribe(setValue)
    onCleanup(unsubscribe)
  })
  return value
}

// TODO: move to fnkit
/**
 * return a proxiedObject which will transmit the set change to originalObject and a subscribable which user can subscribe originalObject's value change
 * @param originalObject a pure version of object
 * @returns [proxiedObject, subscribable]
 */
export function makeSubscriable<T extends AnyObj>(
  originalObject: T,
): [proxiedObject: T, subscribable: Subscribable<T>] {
  const mayCauseChangeKeys =
    originalObject instanceof Array
      ? ["push", "pop", "shift", "unshift", "splice", "sort", "reverse"]
      : originalObject instanceof Set || originalObject instanceof WeakSet || originalObject instanceof WeakerSet
        ? ["add", "delete"]
        : originalObject instanceof Map || originalObject instanceof WeakMap || originalObject instanceof WeakerMap
          ? ["set", "delete"]
          : Object.getOwnPropertyNames(originalObject)
  const subscribable = createSubscribable<T>() as Subscribable<T>
  const proxiedValue = new Proxy(originalObject, {
    get(target, prop) {
      const v = Reflect.get(target, prop) as unknown
      // detect try to get inner change function
      if (isFunction(v) && isString(prop) && mayCauseChangeKeys.includes(prop)) {
        return ((...args: Parameters<typeof v>) => {
          const result = Reflect.apply(v, target, args)
          subscribable.set(target)
          return result
        }).bind(target)
      } else {
        return v
      }
    },
    set(target, prop, value) {
      Reflect.set(target, prop, value)
      subscribable.set(target)
      return true
    },
  })
  return [proxiedValue, subscribable]
}
