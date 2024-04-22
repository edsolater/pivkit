import type { AnyFn } from "@edsolater/fnkit"
import { listenDomEvent } from "./addDomEventListener"

/** used by gesture: pointer move */
export type Delta2dTranslate = {
  // distance in x (px)
  dx: number
  // distance in y (px)
  dy: number
}

export type Vector = {
  /** distance in x axis */
  x: number
  /** distance in y axis */
  y: number
}

export type SpeedVector = Vector

let eventId = 1
const eventIdMap = new Map<number, { el: Element; eventName: string; fn: AnyFn }>()

type OnMoveStart = (ev: { el: HTMLElement; ev: PointerEvent; evStart: PointerEvent; evs: PointerEvent[] }) => void

type OnMoving = (ev: {
  el: HTMLElement
  ev: PointerEvent
  evStart: PointerEvent
  evs: PointerEvent[]
  currentDeltaInPx: Delta2dTranslate
  totalDeltaInPx: Delta2dTranslate
}) => void

type OnMoveEnd = (ev: {
  el: HTMLElement
  ev: PointerEvent
  evStart: PointerEvent
  evs: PointerEvent[]
  currentDeltaInPx: Delta2dTranslate
  totalDeltaInPx: Delta2dTranslate
  currentSpeed: SpeedVector
}) => void

/**
 * listen to element' pointermove（pointerDown + pointerMove + pointerUp）clean event automaticly
 * @param el targetElement
 * @param options !must registed, so user can do something when pointer move
 * @returns cancelable event id (it is not dom's event id, it is just a number to cancel event listener)
 */
export function listenGestureDrag(
  el: HTMLElement | undefined | null,
  options: {
    onMoveStart?: OnMoveStart
    onMoving?: OnMoving
    onMoveEnd?: OnMoveEnd
  },
) {
  if (!el) return
  const events: PointerEvent[] = []
  /**
   *
   * @param {Event} ev
   */
  function pointerDown(ev: PointerEvent) {
    if (!events.length) {
      events.push(ev)
      options.onMoveStart?.({ el: el!, ev, evStart: ev, evs: events })
      listenDomEvent(el, "pointermove", ({ ev }) => pointerMove(ev), { passive: true, restrict: "rAF" })
      listenDomEvent(el, "pointerup", ({ ev }) => pointerUp(ev), { passive: true })
      el?.setPointerCapture(ev.pointerId)
      // ev.stopPropagation()
    }
  }
  function pointerMove(ev: PointerEvent) {
    if (events.length && events.length > 0 && ev.pointerId === events[events.length - 1]?.pointerId) {
      events.push(ev)
      const deltaX = ev.clientX - events[events.length - 1]!.clientX
      const deltaY = ev.clientY - events[events.length - 1]!.clientY
      const evStart = events[0]!
      const totalDeltaX = ev.clientX - evStart.clientX
      const totalDeltaY = ev.clientY - evStart.clientY
      options.onMoving?.({
        el: el!,
        ev,
        evStart,
        evs: events,
        currentDeltaInPx: { dx: deltaX, dy: deltaY },
        totalDeltaInPx: { dx: totalDeltaX, dy: totalDeltaY },
      })
    }
  }
  function pointerUp(ev: PointerEvent) {
    if (events.length && events.length > 0 && ev.pointerId === events[events.length - 1]?.pointerId) {
      events.push(ev)
      const eventNumber = 4
      const nearPoint = events[events.length - eventNumber] ?? events[0]
      const deltaX = ev.clientX - nearPoint!.clientX
      const deltaY = ev.clientY - nearPoint!.clientY
      const deltaTime = ev.timeStamp - nearPoint!.timeStamp
      const evStart = events[0]!
      const totalDeltaX = ev.clientX - evStart!.clientX
      const totalDeltaY = ev.clientY - events[0]!.clientY
      options.onMoveEnd?.({
        el: el!,
        ev,
        evStart,
        evs: events,
        currentDeltaInPx: { dx: deltaX, dy: deltaY },
        currentSpeed: {
          x: deltaX / deltaTime || 0,
          y: deltaY / deltaTime || 0,
        },
        totalDeltaInPx: { dx: totalDeltaX, dy: totalDeltaY },
      })
      events.splice(0, events.length)
      el?.removeEventListener("pointermove", pointerMove)
    }
  }
  el?.addEventListener("pointerdown", pointerDown)
  // record it to cancel by id
  eventIdMap.set(eventId++, { el, eventName: "pointerdown", fn: pointerDown })
  return eventId
}

export function cancelPointerMove(id: number | undefined) {
  if (!id || !eventIdMap.has(id)) return
  const { el, eventName, fn } = eventIdMap.get(id)!
  el.removeEventListener(eventName, fn)
  eventIdMap.delete(id)
}

/** use translate by --x and --y */
export function attachPointerGrag(
  el: HTMLElement,
  cbs?: {
    onMoveStart?: OnMoveStart
    onMoving?: OnMoving
    onMoveEnd?: OnMoveEnd
  },
): { remove: () => void } {
  const pointerId = listenGestureDrag(el, {
    onMoveStart: (iev) => {
      cbs?.onMoveStart?.(iev)
      iev.el.style.transform = "translate(var(--x, 0), var(--y, 0))"
    },
    onMoving: (iev) => {
      cbs?.onMoving?.(iev)
      iev.el.style.setProperty("--x", `${iev.totalDeltaInPx.dx}px`)
      iev.el.style.setProperty("--y", `${iev.totalDeltaInPx.dy}px`)
    },
    onMoveEnd: (iev) => {
      cbs?.onMoveEnd?.(iev)
      iev.el.style.removeProperty("--x")
      iev.el.style.removeProperty("--y")
    },
  })
  return { remove: () => cancelPointerMove(pointerId) }
}
