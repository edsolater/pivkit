import { createEffect } from "solid-js"
import { ModalController, ModalProps } from "../components/Modal"
import { addShortcutEventListener } from "../webTools"
import { createPlugin } from "../piv"
import { createControllerRef } from "../hooks/createControllerRef"
import { createRef } from "../hooks/createRef"

export const modalKeyboardShortcut = createPlugin<ModalProps>(() => () => {
  const [divRef, setDivRef] = createRef<HTMLDivElement>()
  const [modalController, setControllerRef] = createControllerRef<ModalController>()
  createEffect(() => {
    const el = divRef()
    if (!el) return
    keyboardFocusElement(el)
    const subscription = addShortcutEventListener(el, {
      Escape: () => modalController.close?.(),
    })
    return subscription.cancel
  }, [])
  return { domRef: setDivRef, controllerRef: setControllerRef }
})

function keyboardFocusElement(el?: HTMLElement) {
  el?.focus()
}
