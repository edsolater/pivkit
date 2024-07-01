import { Accessor, createEffect, onCleanup } from "solid-js"
import { EventCallback, listenDomEvent } from ".."
import { ElementRefs, getElementFromRefs } from "../../utils/getElementsFromRefs"
import { shrinkFn } from "@edsolater/fnkit"

type OnClickOutSideCallback = (
  payload: EventCallback<keyof HTMLElementEventMap, HTMLElement | Document | Window | undefined | null>,
) => void

export type UseClickOutsideOptions =
  | {
      enabled?: boolean | Accessor<boolean>
      disabled?: boolean | Accessor<boolean>
      onClickOutSide?: OnClickOutSideCallback
    }
  | OnClickOutSideCallback

/**
 * TODO: should click event be bubbled to root? current too many click event 
 * inner use (bubbled to root) click event's `event.composedPath()` to check if the click event is outside of the target elements
 * @param els can be a single element or an array of elements or even a function that returns an element or an array of elements
 * @param options
 */
export function useClickOutside(els: ElementRefs, options?: UseClickOutsideOptions) {
  const parasedOptions = typeof options === "function" ? { onClickOutSide: options } : options
  const getOption = () => parasedOptions
  createEffect(() => {
    const targetElements = getElementFromRefs(els)
    targetElements.forEach((el) => {
      const { cancel } = listenDomEvent(el, "click", (payload) => {
        const enabled = shrinkFn(getOption()?.enabled)
        const disabled = shrinkFn(getOption()?.disabled)
        const isEnabled = enabled != null ? enabled : !disabled
        if (!isEnabled) return

        const isTargetInPath = el.contains(payload.ev.target as Node)
        if (isTargetInPath) return
        parasedOptions?.onClickOutSide?.(payload)
      })
      onCleanup(cancel)
    })
  })
}
