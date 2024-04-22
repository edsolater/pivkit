import { createEffect, createSignal, on, onCleanup } from "solid-js"
import { createSubscribable } from "@edsolater/fnkit"
import { KeybordShortcutKeys, getShorcutStringFromKeyboardEvent, listenDomEvent } from "../../../domkit"
import { createControllerRef } from "../../../hooks/createControllerRef"
import { createRef } from "../../../hooks/createRef"
import { createPlugin } from "../../../piv"
import { InputController, InputKitProps } from "../Input"

// NOTE: plugin is a function accept props and return additional props
// TODO: apply `createConfigableFunction((options) => (props) => {...})`
export const keyboardShortcutObserverPlugin = (options: {
  onRecordShortcut?: (payload: { shortcut: KeybordShortcutKeys; el: HTMLElement }) => void
}) =>
  createPlugin<{}, InputKitProps>(() => (inputProps) => {
    const [elRef, setElRef] = createRef<HTMLDivElement>()

    const [intputController, setControllerRef] = createControllerRef<InputController>()
    const [recordedShortcut, setRecordedShortcut] = createSignal<string | undefined>(undefined)
    createEffect(() => {
      const el = elRef()
      if (!el) return
      const subscribable = subscribeKeyboardShortcut(el)
      const { unsubscribe } = subscribable.subscribe(handleKeydownKeyboardShortcut)
      onCleanup(unsubscribe)
    })

    // reflect recorded shortcut to input value
    createEffect(
      on(recordedShortcut, () => {
        intputController.setText?.(recordedShortcut())
      }),
    )

    const handleKeydownKeyboardShortcut = (text: string) => {
      setRecordedShortcut(text)
      intputController.setText?.(text)
      const el = elRef()
      if (!el) return // it is impossible
      options.onRecordShortcut?.({
        shortcut: text as KeybordShortcutKeys,
        el,
      })
    }

    return { domRef: setElRef, controllerRef: setControllerRef }
  })

function subscribeKeyboardShortcut(el: HTMLElement) {
  const subscribable = createSubscribable<string>()
  listenDomEvent(el, "keydown", ({ ev }) => {
    ev.stopPropagation()
    const shortcut = getShorcutStringFromKeyboardEvent(ev)
    if (isValidShortcut(ev)) subscribable.set(shortcut)
  })
  return subscribable
}

function isValidShortcut(ev: KeyboardEvent, options?: { banedKeywords?: string[] }): boolean {
  return ["control", "alt", "shift", "meta", "backspace", "enter", ...(options?.banedKeywords ?? [])].every(
    (key) => !ev.key.toLowerCase().includes(key.toLowerCase()),
  )
}
