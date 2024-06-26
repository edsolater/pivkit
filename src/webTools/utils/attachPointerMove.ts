import type { AnyFn } from "@edsolater/fnkit"
import { listenDomEvent } from "./addDomEventListener"
import { GestureDragOptions } from "./attachGestureDrag"

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

type MoveStartCustomizedEvent = {
  el: HTMLElement
  ev: PointerEvent
  evStart: PointerEvent
  evs: PointerEvent[]
}

export type OnMoveStart = (ev: MoveStartCustomizedEvent) => void

export type OnMoving = (ev: {
  el: HTMLElement
  ev: PointerEvent
  evStart: PointerEvent
  evs: PointerEvent[]
  currentDeltaInPx: Delta2dTranslate
  totalDeltaInPx: Delta2dTranslate
}) => void

export type OnMoveEnd = (ev: {
  el: HTMLElement
  ev: PointerEvent
  evStart: PointerEvent
  evs: PointerEvent[]
  currentDeltaInPx: Delta2dTranslate
  totalDeltaInPx: Delta2dTranslate
  currentSpeed: SpeedVector
}) => void

export type GestureMoveOptions = GestureDragOptions

/**
 * listen to element' pointermove（pointerDown + pointerMove + pointerUp）clean event automaticly
 * @param el targetElement
 * @param options !must registed, so user can do something when pointer move
 * @returns cancelable event id (it is not dom's event id, it is just a number to cancel event listener)
 */
export function listenGestureMove(el: HTMLElement | undefined | null, options: GestureMoveOptions) {
  if (!el) return { cancel: () => {} }
  const events: PointerEvent[] = []
  /**
   *
   * @param {Event} ev
   */
  function handlePointerDown(ev: PointerEvent) {
    const thisPointerId = ev.pointerId
    if (!events.length) {
      events.push(ev)
      options.onMoveStart?.({ el: el!, ev, evStart: ev, evs: events })

      const { cancel: cancel1 } = listenDomEvent(
        globalThis.document,
        "pointermove",
        ({ ev }) => {
          if (ev.pointerId === thisPointerId) {
            handlePointerMove(ev)
          }
        },
        { debounce: "rAF" },
      )

      const { cancel: cancel2 } = listenDomEvent(globalThis.document, "pointerup", ({ ev }) => {
        if (ev.pointerId === thisPointerId) {
          handlePointerUp(ev)
          cancel1()
        }
      })
      // el?.setPointerCapture(ev.pointerId)
      return () => {
        cancel1()
        cancel2()
      }
    }
  }
  function handlePointerMove(ev: PointerEvent) {
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
  function handlePointerUp(ev: PointerEvent) {
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
    }
  }
  const { cancel } = listenDomEvent(el, "pointerdown", ({ ev }) => handlePointerDown(ev))
  return { cancel }
}


