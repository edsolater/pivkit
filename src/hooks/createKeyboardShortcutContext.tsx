import { flap } from "@edsolater/fnkit"
import { createContext, onCleanup, onMount, useContext } from "solid-js"
import { createStore, produce } from "solid-js/store"
import { bindKeyboardShortcutEventListener } from "../domkit"
import type { ShortcutItem, ShortcutRecord } from "../plugins/useKeyboardShortcut"


export function createShortcutContext(defaultShortcuts: ShortcutRecord = {}) {
  const [storedShortcuts, setStoredShortcut] = createStore(defaultShortcuts)
  const context = createContext(defaultShortcuts)

  function registerShortcut(shortcutItem: ShortcutItem) {
    setStoredShortcut(
      produce((shortcutMap) => {
        shortcutMap[shortcutItem.description] = shortcutItem
      }),
    )
    const shortcutSetting = flap(shortcutItem.shortcut).reduce((acc, shortcutKey) => {
      acc[shortcutKey] = shortcutItem.fn
      return acc
    }, {})
    const shortcutSubscription = bindKeyboardShortcutEventListener(
      shortcutItem.targetElement ?? document.documentElement,
      shortcutSetting,
    )
    return {
      remove: () => {
        shortcutSubscription.abort()
        setStoredShortcut(
          produce((shortcutMap) => {
            delete shortcutMap[shortcutItem.description]
          }),
        )
      },
    }
  }

  function useShortcuts() {
    const shortcuts = useContext(context)
    return { shortcuts, registerShortcut, useShortcutsRegister }
  }

  function useShortcutsRegister(...items: ShortcutItem[]) {
    onMount(() => {
      items.forEach((shortcut) => {
        const registerManager = registerShortcut(shortcut)
        onCleanup(() => {
          registerManager.remove()
        })
      })
    })
  }

  function ContextProvider(props: { children?: any }) {
    return <context.Provider value={storedShortcuts}>{props.children}</context.Provider>
  }

  return {
    ContextProvider,
    useShortcuts,
    registerShortcut,
    useShortcutsRegister,
  }
}
