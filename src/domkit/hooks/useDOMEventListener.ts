import { createEffect, onCleanup } from "solid-js"
import { EventListenerController, addEventListener } from ".."
import { ElementRefs, GetElementsFromElementRefs, getElementFromRefs } from "../../utils/getElementsFromRefs"

/**
 * register DOM Event Listener
 * use auto cleanup
 */
export function useDOMEventListener<El extends ElementRefs, K extends keyof HTMLElementEventMap>(
  el: El,
  eventName: K,
  fn: (payload: {
    ev: HTMLElementEventMap[K]
    el: GetElementsFromElementRefs<El>
    eventListenerController: EventListenerController
  }) => void,
  /** default is `{ passive: true }` */
  options?: EventListenerOptions,
) {
  createEffect(() => {
    const els = getElementFromRefs(el)
    els.forEach((el) => {
      // @ts-expect-error no need to check
      const { abort: cancel } = addEventListener(el, eventName, fn, options)
      onCleanup(cancel)
    })
  })
}

/**
 * register DOM Event Listener
 * use auto cleanup
 */
export function useDocumentEventListener<K extends keyof HTMLElementEventMap>(
  eventName: K,
  fn: (payload: { ev: HTMLElementEventMap[K]; el: Document; eventListenerController: EventListenerController }) => void,
  /** default is `{ passive: true }` */
  options?: EventListenerOptions,
) {
  createEffect(() => {
    const { abort: cancel } = addEventListener(globalThis.document, eventName, fn, options)
    onCleanup(cancel)
  })
}

/**
 * register DOM Event Listener
 * use auto cleanup
 */
export function useWindowEventListener<K extends keyof HTMLElementEventMap>(
  eventName: K,
  fn: (payload: { ev: HTMLElementEventMap[K]; el: Window; eventListenerController: EventListenerController }) => void,
  /** default is `{ passive: true }` */
  options?: EventListenerOptions,
) {
  createEffect(() => {
    const { abort: cancel } = addEventListener(globalThis.window, eventName, fn, options)
    onCleanup(cancel)
  })
}
