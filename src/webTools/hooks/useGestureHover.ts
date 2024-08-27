//#region ------------------- hook: useHover() -------------------

import { Accessor, createEffect, onCleanup } from "solid-js"
import { createDisclosure } from "../../hooks/createDisclosure"
import { getElementFromRefs, type ElementRefs } from "../../utils"
import { listenDomEvent } from "../utils"
import { setTimeoutWithSecondes, type AnyFn } from "@edsolater/fnkit"

export interface GestureHoverOptions {
  startDelay?: number /* seconds */
  endDelay?: number /* seconds */
  disable?: boolean
  onHoverStart?: (info: { ev: PointerEvent }) => void
  onHoverEnd?: (info: { ev: PointerEvent }) => void
  onHover?: (info: { ev: PointerEvent; is: "start" | "end" }) => void
}
export interface GestureHoverStates {
  isHover: Accessor<boolean>
}

export function useGestureHover(el: ElementRefs, options: GestureHoverOptions): GestureHoverStates {
  const [isHover, { open: turnonHover, close: turnoffHover }] = createDisclosure()
  createEffect(() => {
    const cevManager = attachGestureHover(el, {
      ...options,
      onHover(info) {
        const isOn = info.is === "start"
        isOn ? turnonHover() : turnoffHover()
        options.onHover?.(info)
      },
    })
    onCleanup(cevManager.cancel)
  })
  return { isHover }
}

export function attachGestureHover(el: ElementRefs, options: GestureHoverOptions) {
  const cleanFns = [] as AnyFn[]

  if (options.disable) return { cancel: () => false }
  const els = getElementFromRefs(el)
  if (!els.length) return { cancel: () => false }
  let hoverDelayTimerId: number | undefined
  const hoverStartHandler = (ev: PointerEvent) => {
    if (options.disable) return
    clearTimeout(hoverDelayTimerId)
    if (options.startDelay) {
      hoverDelayTimerId = setTimeoutWithSecondes(() => {
        options.onHover?.({ is: "start", ev })
        options.onHoverStart?.({ ev })
      }, options.startDelay) as any
    } else {
      options.onHover?.({ is: "start", ev })
      options.onHoverStart?.({ ev })
    }
  }
  const hoverEndHandler = (ev: PointerEvent) => {
    if (options.disable) return
    clearTimeout(hoverDelayTimerId)
    if (options.endDelay) {
      hoverDelayTimerId = setTimeoutWithSecondes(() => {
        options.onHover?.({ is: "end", ev })
        options.onHoverEnd?.({ ev })
      }, options.endDelay) as any
    } else {
      options.onHover?.({ ev, is: "end" })
      options.onHoverEnd?.({ ev })
    }
  }
  els.forEach((el) => {
    const cev1 = listenDomEvent(el, "pointerenter", ({ ev }) => hoverStartHandler(ev))
    cleanFns.push(cev1.cancel)
    const cev2 = listenDomEvent(el, "pointerleave", ({ ev }) => hoverEndHandler(ev))
    cleanFns.push(cev2.cancel)
    const cev3 = listenDomEvent(el, "pointercancel", ({ ev }) => hoverEndHandler(ev))
    cleanFns.push(cev3.cancel)
  })
  return {
    cancel() {
      cleanFns.forEach((fn) => fn())
      return cleanFns.length > 0
    },
  }
}
