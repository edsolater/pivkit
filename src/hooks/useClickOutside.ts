import { Accessor, createEffect, onCleanup } from 'solid-js'
import { EventCallback, addEventListener } from '../domkit'
import { ElementRefs, getElementFromRefs } from '../utils/getElementsFromRefs'
import { shrinkFn } from '@edsolater/fnkit'

type OnClickOutSideCallback = (
  payload: EventCallback<keyof HTMLElementEventMap, HTMLElement | Document | Window | undefined | null>
) => void

export type UseClickOutsideOptions =
  | {
      disable?: boolean | Accessor<boolean>
      onClickOutSide?: OnClickOutSideCallback
    }
  | OnClickOutSideCallback

export function useClickOutside(els: ElementRefs, options?: UseClickOutsideOptions) {
  const parasedOptions = typeof options === 'function' ? { onClickOutSide: options } : options
  const getOption = () => parasedOptions
  createEffect(() => {
    const targetElements = getElementFromRefs(els)
    const { abort: cancel } = addEventListener(
      globalThis.document,
      'click',
      (payload) => {
        const isDisabled = shrinkFn(getOption()?.disable)
        if (isDisabled) return
        if (!targetElements.length) return
        const path = payload.ev.composedPath()
        const isTargetInPath = targetElements.some((el) => el && path.includes(el))
        if (isTargetInPath) return
        parasedOptions?.onClickOutSide?.(payload)
      },
      { capture: true }
    )
    onCleanup(cancel)
  })
}
