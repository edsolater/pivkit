import { AnyFn } from "@edsolater/fnkit"

let eventId = 1

export interface EventListenerController {
  eventId: number
  abort(): void
}

export interface EventListenerOptions extends AddEventListenerOptions {
  stopPropergation?: boolean
  onlyTargetIsSelf?: boolean
  /** in 60FPS screen, pointer move max run 60 times each seconds */
  restrict?: "rAF" // TODO: 'debounce 10' means max 10 times each seconds
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

export type EventCallback<
  K extends keyof HTMLElementEventMap,
  El extends HTMLElement | Document | Window | undefined | null,
> = {
  ev: HTMLElementEventMap[K]
  el: El
  eventListenerController: EventListenerController
  isSelf(): boolean
  isBubbled(): boolean
  stopPropagation(): void
  preventDefault(): void
  eventPath(): HTMLElement[]
}

// TODO: !!! move to domkit
export function addEventListener<
  El extends HTMLElement | Document | Window | undefined | null,
  K extends keyof HTMLElementEventMap,
>(
  el: El,
  eventName: K,
  fn: (payload: EventCallback<K, El>) => void,
  /** default is `{ passive: true }` */
  options?: EventListenerOptions,
): EventListenerController {
  const defaultedOptions = { passive: true, ...options }
  const targetEventId = eventId++
  const controller = {
    eventId: targetEventId,
    abort() {
      if (!el) return
      abortEvent(el, targetEventId, options)
    },
  } as EventListenerController
  const coreEventListener = (ev: Event) => {
    if (options?.stopPropergation) ev.stopPropagation()
    if (options?.onlyTargetIsSelf && el !== ev.target) return
    fn({
      el,
      ev: ev as HTMLElementEventMap[K],
      eventListenerController: controller,
      isSelf: () => el === ev.target,
      isBubbled: () => el !== ev.target,
      stopPropagation: () => ev.stopPropagation(),
      preventDefault: () => ev.preventDefault(),
      eventPath: () => ev.composedPath().filter((el) => el instanceof HTMLElement) as HTMLElement[],
    })
  }
  let requestAnimationFrameId: number | undefined = undefined
  const registedListener = (ev: Event) => {
    if (options?.restrict) {
      if (options.restrict === "rAF") {
        if (requestAnimationFrameId) cancelAnimationFrame(requestAnimationFrameId)
        requestAnimationFrameId = requestAnimationFrame(() => {
          requestAnimationFrameId = undefined
          coreEventListener(ev)
        })
      }
    } else {
      coreEventListener(ev)
    }
  }
  el?.addEventListener(eventName as unknown as string, registedListener, defaultedOptions)
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
