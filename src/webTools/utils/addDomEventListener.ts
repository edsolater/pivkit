import { AnyFn, throttle } from "@edsolater/fnkit"
import { isHTMLElement } from "./isHTMLElement"

let eventId = 1

export interface EventListenerController {
  eventId: number
  cancel(): void
}

export interface EventListenerOptions extends AddEventListenerOptions {
  stopPropergation?: boolean
  preventDefault?: boolean

  /** sometimes event's is bubbled not user wanted */
  onlyTargetIsSelf?: boolean
  /** in 60FPS screen, pointer move max run 60 times each seconds */
  debounce?: "rAF" // TODO: 'debounce 10' means max 10 times each seconds
  /** js event delegation */
  eventDelegateOn?: HTMLElement // TODO: imply it!!
}

type EventIdMap = Map<
  number,
  {
    eventName: keyof HTMLElementEventMap
    cb: AnyFn
  }
>

//IDEA: maybe I should use weakMap here
// TODO: why not use native cancel controller
const listenerCacheMaps = new WeakMap<HTMLElement | Document | Window, EventIdMap>()

export type EventCallback<K extends keyof any, El extends HTMLElement | Document | Window | undefined | null> = {
  ev: K extends keyof DocumentEventMap
    ? DocumentEventMap[K]
    : K extends keyof WindowEventMap
      ? WindowEventMap[K]
      : K extends keyof HTMLElementEventMap
        ? HTMLElementEventMap[K]
        : Event
  el: El
  eventListenerController: EventListenerController
  isSelf(): boolean
  isBubbled(): boolean
  stopPropagation(): void
  preventDefault(): void
  eventPath(): HTMLElement[]
  /** abort() may invoked in an if */
  abortListener(): void
}

// TODO: !!! move to webTools
export function listenDomEvent<El extends HTMLElement | undefined | null, K extends keyof HTMLElementEventMap>(
  el: El,
  eventName: K,
  fn: (payload: EventCallback<K, El>) => void,
  /** default is `{ passive: true }` */
  options?: EventListenerOptions,
): EventListenerController
export function listenDomEvent<El extends Document | undefined | null, K extends keyof DocumentEventMap>(
  el: El,
  eventName: K,
  fn: (payload: EventCallback<K, El>) => void,
  /** default is `{ passive: true }` */
  options?: EventListenerOptions,
): EventListenerController
export function listenDomEvent<El extends Window | undefined | null, K extends keyof WindowEventMap>(
  el: El,
  eventName: K,
  fn: (payload: EventCallback<K, El>) => void,
  /** default is `{ passive: true }` */
  options?: EventListenerOptions,
): EventListenerController
export function listenDomEvent<
  El extends HTMLElement | Document | Window | undefined | null,
  K extends keyof HTMLElementEventMap,
>(
  el: El,
  eventName: string,
  fn: (payload: EventCallback<keyof HTMLElementEventMap, El>) => void,
  /** default is `{ passive: true }` */
  options?: EventListenerOptions,
): EventListenerController
export function listenDomEvent<
  El extends HTMLElement | Document | Window | undefined | null,
  K extends keyof HTMLElementEventMap,
>(
  el: El,
  eventName: K,
  fn: (payload: EventCallback<K, El>) => void,
  /** default is `{ passive: true }` */
  options?: EventListenerOptions,
): EventListenerController {
  const eventOptions = { passive: options?.preventDefault ? false : true, ...options }
  const targetEventId = eventId++
  const controller = {
    eventId: targetEventId,
    cancel() {
      if (!el) return
      abortEvent(el, targetEventId, options)
    },
  } as EventListenerController
  const coreEventListener = (ev: Event) => {
    if (options?.stopPropergation) ev.stopPropagation()
    if (options?.preventDefault) ev.preventDefault()
    if (options?.onlyTargetIsSelf && el !== ev.target) return
    fn({
      el,
      ev: ev as any,
      eventListenerController: controller,
      abortListener: controller.cancel,
      isSelf: () => el === ev.target,
      isBubbled: () => el !== ev.target,
      stopPropagation: () => ev.stopPropagation(),
      preventDefault: () => ev.preventDefault(),
      eventPath: () => ev.composedPath().filter(isHTMLElement),
    })
  }
  const shouldUseRAF = options && "restrict" in options ? options?.debounce === "rAF" : shouldUseRAFEventNames.has(eventName)

  const throttled = throttle(coreEventListener, { rAF: shouldUseRAF })
  const registedListener = (ev: Event) => {
    if (options?.debounce) {
      throttled(ev)
    } else {
      coreEventListener(ev)
    }
  }
  el?.addEventListener(eventName as unknown as string, registedListener, eventOptions)
  if (el) {
    const registedListeners = (() => {
      if (!listenerCacheMaps.has(el)) {
        const newListenersMap: EventIdMap = new Map()
        listenerCacheMaps.set(el, newListenersMap)
        return newListenersMap
      } else {
        return listenerCacheMaps.get(el)!
      }
    })()
    listenerCacheMaps.set(el, registedListeners.set(targetEventId, { eventName: eventName, cb: coreEventListener }))
  }
  return controller
}

function abortEvent(
  el: HTMLElement | Document | Window,
  id: number | undefined | null,
  options?: EventListenerOptions,
) {
  if (!id || !el || !listenerCacheMaps.has(el)) return
  const registedListeners = listenerCacheMaps.get(el)
  if (!registedListeners?.has(id)) return
  const { eventName, cb } = registedListeners.get(id)!
  el?.removeEventListener(eventName, cb, { capture: Boolean(options?.capture) })
  listenerCacheMaps.delete(el)
}

const shouldUseRAFEventNames = new Set(["pointermove", "mousemove", "pointermove", "scroll", "resize", "wheel"])
