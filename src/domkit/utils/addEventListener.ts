import { AnyFn } from '@edsolater/fnkit'

let eventId = 1

export interface EventListenerController {
  eventId: number
  abort(): void
}

export interface EventListenerOptions extends AddEventListenerOptions {
  stopPropergation?: boolean
  onlyTargetIsSelf?: boolean
}

//IDEA: maybe I should use weakMap here
// TODO: why not use native cancel controller
const eventIdMap = new Map<
  number,
  { el: HTMLElement | Document | Window | undefined | null; eventName: string; cb: AnyFn }
>()

export type EventCallback<
  K extends keyof HTMLElementEventMap,
  El extends HTMLElement | Document | Window | undefined | null,
> = {
  ev: HTMLElementEventMap[K]
  el: El
  eventListenerController: EventListenerController
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
  options?: EventListenerOptions
): EventListenerController {
  const defaultedOptions = { passive: true, ...options }
  const targetEventId = eventId++
  const controller = {
    eventId: targetEventId,
    abort() {
      abortEvent(targetEventId, options)
    },
  } as EventListenerController
  const newEventCallback = (ev: Event) => {
    if (options?.stopPropergation) ev.stopPropagation()
    if (options?.onlyTargetIsSelf && el !== ev.target) return
    fn({ el, ev: ev as HTMLElementEventMap[K], eventListenerController: controller })
  }
  el?.addEventListener(eventName as unknown as string, newEventCallback, defaultedOptions)
  eventIdMap.set(targetEventId, { el, eventName: eventName as unknown as string, cb: newEventCallback })
  return controller
}

function abortEvent(id: number | undefined | null, options?: EventListenerOptions) {
  if (!id || !eventIdMap.has(id)) return
  const { el, eventName, cb } = eventIdMap.get(id)!
  el?.removeEventListener(eventName, cb, { capture: Boolean(options?.capture) })
  eventIdMap.delete(id)
}
