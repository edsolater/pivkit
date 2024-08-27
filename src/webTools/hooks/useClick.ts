import { Accessor, createEffect, onCleanup } from "solid-js"
import { EventCallback, listenDomEvent } from ".."
import { ElementRefs, getElementFromRefs } from "../../utils/getElementsFromRefs"
import { createEnableValidator } from "../../hooks"

type OnClickCallback = (
  payload: EventCallback<keyof HTMLElementEventMap, HTMLElement | Document | Window | undefined | null>,
) => void

export type UseClickOptions =
  | {
      enabled?: boolean | Accessor<boolean>
      disabled?: boolean | Accessor<boolean>
      onClick?: OnClickCallback
    }
  | OnClickCallback

/**
 * inner use (bubbled to root) click event's `event.composedPath()` to check if the click event is outside of the target elements
 * @param els can be a single element or an array of elements or even a function that returns an element or an array of elements
 * @param options
 */
export function useClick(els: ElementRefs, options?: UseClickOptions) {
  const parasedOptions = typeof options === "function" ? { onClick: options } : options
  const isEnabled = createEnableValidator(parasedOptions ?? {})
  createEffect(() => {
    const targetElements = getElementFromRefs(els)
    targetElements.forEach((el) => {
      const { cancel } = listenDomEvent(el, "click", (ev) => {
        if (!isEnabled()) return
        parasedOptions?.onClick?.(ev)
      })
      onCleanup(cancel)
    })
  })
}
