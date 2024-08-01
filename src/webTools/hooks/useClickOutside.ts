import { Accessor, createEffect, on, onCleanup } from "solid-js"
import { EventCallback, listenDomEvent } from ".."
import { ElementRefs, getElementFromRefs } from "../../utils/getElementsFromRefs"
import { isFunction, shrinkFn } from "@edsolater/fnkit"
import { createLazySignal } from "../../hooks"

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
 * inner use (bubbled to root) click event's `event.composedPath()` to check if the click event is outside of the target elements
 * @param els can be a single element or an array of elements or even a function that returns an element or an array of elements
 * @param options
 */
export function useClickOutside(els: ElementRefs, options?: UseClickOutsideOptions) {
  const parasedOptions = typeof options === "function" ? { onClickOutSide: options } : options
  const isEnabled = createValidator({ enabled: parasedOptions?.enabled, disabled: parasedOptions?.disabled })
  createEffect(() => {
    const targetElements = getElementFromRefs(els)
    targetElements.forEach((el) => {
      const { cancel } = listenDomEvent(document, "click", (payload) => {
        if (!isEnabled()) return
        const isTargetInPath = el.contains(payload.ev.target as Node)
        if (isTargetInPath) return
        parasedOptions?.onClickOutSide?.(payload)
      })
      onCleanup(cancel)
    })
  })
}

/**
 * a hook utils to enabled and disabled
 */
export function createValidator(options: {
  enabled?: boolean | Accessor<boolean>
  disabled?: boolean | Accessor<boolean>
}): Accessor<boolean> {
  const [enabled, setEnabled] = createLazySignal(() => getValid())

  function getValid() {
    const enabled = shrinkFn(options?.enabled)
    const disabled = shrinkFn(options?.disabled)
    const isEnabled = enabled != null ? enabled : !disabled
    return isEnabled
  }

  const totalAccessor = (() => {
    const bucket = [] as Accessor<any>[]
    if (isFunction(options.enabled)) bucket.push(options.enabled)
    if (isFunction(options.disabled)) bucket.push(options.disabled)
    return bucket
  })()

  createEffect(
    on(
      totalAccessor,
      () => {
        setEnabled(getValid())
      },
      { defer: true },
    ),
  )
  return enabled
}
