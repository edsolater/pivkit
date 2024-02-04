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
} from '@edsolater/fnkit'
import { Accessor, createEffect, createMemo, createSignal, onCleanup } from 'solid-js'
import {
  KeyboardShortcutFn,
  KeyboardShortcutSettings,
  KeybordShortcutKeys,
  bindKeyboardShortcutEventListener,
} from '../domkit'
import { createSharedSignal } from '../hooks/createSharedSignal'
import { Accessify, ElementRefs, getElementFromRefs } from '../utils'
import useResizeObserver from '../domkit/hooks/useResizeObserver'

type Description = string

export type DetailKeyboardShortcutSetting = Record<
  Description,
  {
    fn: KeyboardShortcutFn
    keyboardShortcut: KeybordShortcutKeys | KeybordShortcutKeys[]
  }
>

// hook info store, store registered keyboard shortcuts
const [registeredKeyboardShortcut, registeredKeyboardShortcutSubscribable] = makeSubscriable(
  new WeakerMap<HTMLElement, DetailKeyboardShortcutSetting>()
)

function registerLocalKeyboardShortcut(el: HTMLElement, settings: DetailKeyboardShortcutSetting): { remove(): void } {
  registeredKeyboardShortcut.set(el, settings)
  return {
    remove() {
      registeredKeyboardShortcut.delete(el)
    },
  }
}

function registerGlobalKeyboardShortcut(settings: DetailKeyboardShortcutSetting): { remove(): void } {
  const el = globalThis.document.documentElement
  const originalObject = registeredKeyboardShortcut.get(el)
  registeredKeyboardShortcut.set(el, { ...originalObject, ...settings })
  return {
    remove() {
      if (!originalObject) return
      const removedKeys = Object.getOwnPropertyNames(settings) as KeybordShortcutKeys[]
      removedKeys.forEach((key) => {
        delete originalObject[key]
      })
      registeredKeyboardShortcut.set(el, originalObject)
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
  settings?: DetailKeyboardShortcutSetting,
  // TODO: imply this
  otherOptions?: {
    when?: MayFn<boolean>
    disabled?: MayFn<boolean>
    enabled?: Accessify<boolean>
  }
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
    addSettings(newSettings: DetailKeyboardShortcutSetting) {
      setCurrentSettings((prev) => mergeObjects(prev, newSettings))
    },
    setSettings(newSettings: DetailKeyboardShortcutSetting) {
      setCurrentSettings(newSettings)
    },
  }
}

/**
 * just a wrapper for {@link bindKeyboardShortcutEventListener}
 * if you want regist shortcut within a specific component, please use {@link useKeyboardShortcut}
 */
export function useKeyboardGlobalShortcut(settings?: DetailKeyboardShortcutSetting) {
  const [currentSettings, setCurrentSettings] = createSharedSignal(useKeyboardGlobalShortcut.name, settings ?? {})
  createEffect(() => {
    const shortcuts = parseShortcutConfigFromSettings(currentSettings())
    const el = globalThis.document.documentElement
    const { abort } = bindKeyboardShortcutEventListener(el, shortcuts)
    const { remove } = registerGlobalKeyboardShortcut(currentSettings())
    onCleanup(() => {
      abort()
      remove()
    })
  })
  return {
    setNewSettings(
      newSettings:
        | DetailKeyboardShortcutSetting
        | ((prev: DetailKeyboardShortcutSetting) => DetailKeyboardShortcutSetting)
    ) {
      setCurrentSettings(newSettings)
    },
    get registeredGlobalShortcuts() {
      return useAllRegisteredGlobalShortcuts()
    },
  }
}

function parseShortcutConfigFromSettings(settings: DetailKeyboardShortcutSetting) {
  const configLists = shakeFalsy(
    Object.entries(settings).flatMap(([name, { fn, keyboardShortcut }]) => {
      if (!keyboardShortcut) return []
      return isArray(keyboardShortcut)
        ? keyboardShortcut.map((key) => (key ? [key, fn] : undefined))
        : [[keyboardShortcut, fn]]
    })
  )
  return Object.fromEntries(configLists) as KeyboardShortcutSettings
}

// TODO: should move to /fnkit
function mapObjectEntry<T extends AnyObj, NK extends keyof any, NV>(
  o: T,
  fn: (value: T[keyof T], key: keyof T) => [NK, NV]
): Record<NK, NV> {
  return Object.fromEntries(Object.entries(o).map(([key, value]) => fn(value, key as keyof T))) as Record<NK, NV>
}

/**
 * to get registered keyboard shortcut
 * usually, this hook is for show infos
 */
export function useAllRegisteredKeyboardShortcuts() {
  const keyboardShortcutSettingsSignal = useSubscribable(registeredKeyboardShortcutSubscribable, new WeakerMap())
  return keyboardShortcutSettingsSignal
}

export function useAllRegisteredGlobalShortcuts() {
  const keyboardShortcutSettingsSignal = useSubscribable(registeredKeyboardShortcutSubscribable, new WeakerMap())
  return createMemo((prev) => {
    const keyboardShortcutSettings = keyboardShortcutSettingsSignal()
    const next = keyboardShortcutSettings.get(globalThis.document.documentElement)
    return next
  })
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
  originalObject: T
): [proxiedObject: T, subscribable: Subscribable<T>] {
  const mayCauseChangeKeys =
    originalObject instanceof Array
      ? ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']
      : originalObject instanceof Set || originalObject instanceof WeakSet || originalObject instanceof WeakerSet
        ? ['add', 'delete']
        : originalObject instanceof Map || originalObject instanceof WeakMap || originalObject instanceof WeakerMap
          ? ['set', 'delete']
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
