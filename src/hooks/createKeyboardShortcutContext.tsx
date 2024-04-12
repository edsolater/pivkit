import { createContext, onCleanup, onMount, useContext } from "solid-js"
import { createStore, produce } from "solid-js/store"
import type { KeybordShortcutKeys } from "../domkit"

type ShortcutItem = {
  description: string

  /** if not set, use documentElement */
  toElement?: HTMLElement

  shortcut: KeybordShortcutKeys | KeybordShortcutKeys[]
  
  fn: () => void | Promise<void>
}

type ShortcutMap = Record<ShortcutItem["description"], ShortcutItem>

export function createShortcutContext(defaultShortcuts: ShortcutMap) {
  const [storedShortcuts, setStoredShortcut] = createStore(defaultShortcuts)
  const context = createContext(defaultShortcuts)

  function registerShortcut(options: ShortcutItem): {
    remove: () => void
  } {
    setStoredShortcut(
      produce((shortcutMap) => {
        shortcutMap[options.description] = options
      }),
    )
    return {
      remove: () => {
        setStoredShortcut(
          produce((shortcutMap) => {
            delete shortcutMap[options.description]
          }),
        )
      },
    }
  }

  function useShortcuts() {
    const shortcuts = useContext(context)
    return { shortcuts, registerShortcut, useShortcutsRegister }
  }

  function useShortcutsRegister(map: ShortcutMap) {
    onMount(() => {
      Object.values(map).forEach((shortcut) => {
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
  }
}
