import { createEffect } from "solid-js"
import { DrawerController } from "../components/Drawer"
import { addShortcutEventListener } from "../webTools"
import { createControllerRef } from "../hooks/createControllerRef"
import { createRef } from "../hooks/createRef"
import { createPlugin } from "../piv"

export const drawerKeyboardShortcut = createPlugin(() => (props) => {
  const [divRef, setDivRef] = createRef<HTMLDivElement>()
  const [drawerController, setControllerRef] = createControllerRef<DrawerController>()
  createEffect(() => {
    const el = divRef()
    if (!el) return
    keyboardFocusElement(el)
    const subscription = addShortcutEventListener(el, {
      Escape: () => drawerController.close?.(),
    })
    return subscription.cancel
  }, [])
  return { domRef: setDivRef, controllerRef: setControllerRef }
})

function keyboardFocusElement(el?: HTMLElement) {
  el?.focus()
}
