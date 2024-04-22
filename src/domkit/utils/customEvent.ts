import { listenDomEvent } from "./addDomEventListener"

/**
 * should emit event by {@link emitCustomEvent}
 * @param el
 * @param eventName
 * @param listener
 * @returns
 */
// TODO move to pivkit's domkit
export function listenCustomEvent<DetailInfo = any>(
  el: HTMLElement,
  eventName: `customed-${string}`,
  listener: (detail: DetailInfo) => void,
) {
  //@ts-expect-error don't worry about type unequal
  return listenDomEvent(el, eventName, ({ ev: { detail } }: { ev: CustomEvent<DetailInfo> }) => listener(detail))
}
/**
 * should listen by {@link listenCustomEvent}
 * @param el target element
 * @param eventName
 * @param detail
 * @param options
 * @returns
 */
// TODO move to pivkit's domkit
export function emitCustomEvent<DetailInfo = any>(
  el: HTMLElement,
  eventName: `customed-${string}`,
  detail: DetailInfo,
  options?: {
    /** when setted, event will fire in next frame by setTimeout*/
    async?: boolean
  },
) {
  if (options?.async) {
    setTimeout(() => {
      el.dispatchEvent(new CustomEvent(eventName, { detail }))
    }, 0)
    return
  } else {
    el.dispatchEvent(new CustomEvent(eventName, { detail }))
  }
}
