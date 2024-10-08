import { createEffect, onCleanup } from "solid-js"
import { EventListenerController, listenDomEvent } from ".."
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
      const { cancel: cancel } = listenDomEvent(el, eventName, fn, options)
      onCleanup(cancel)
    })
  })
}

/**
 * register DOM Event Listener
 * use auto cleanup
 */
export function useDocumentEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  fn: (payload: { ev: DocumentEventMap[K]; el: Document; eventListenerController: EventListenerController }) => void,
  /** default is `{ passive: true }` */
  options?: EventListenerOptions,
) {
  createEffect(() => {
    // @ts-expect-error too complicated to check
    const { cancel: cancel } = listenDomEvent(globalThis.document, eventName, fn, options)
    onCleanup(cancel)
  })
}

/**
 * register DOM Event Listener
 * use auto cleanup
 */
export function useWindowEventListener<K extends keyof WindowEventHandlers>(
  eventName: K,
  fn: (payload: { ev: WindowEventHandlers[K]; el: Window; eventListenerController: EventListenerController }) => void,
  /** default is `{ passive: true }` */
  options?: EventListenerOptions,
) {
  createEffect(() => {
    // @ts-expect-error too complicated to check
    const { cancel: cancel } = listenDomEvent(window, eventName, fn, options)
    onCleanup(cancel)
  })
}
