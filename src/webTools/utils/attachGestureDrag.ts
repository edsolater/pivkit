import { OnMoveStart, OnMoving, OnMoveEnd, listenGestureMove } from "./attachPointerMove"

export type GestureDragOptions = {
  // by default, it is selfElement
  moveElement?: HTMLElement
  onMoveStart?: OnMoveStart
  onMoving?: OnMoving
  onMoveEnd?: OnMoveEnd
  // @default is true
  unsetMoveInEnd?: boolean
}
/** use translate by --x and --y */

export function attachGestureDrag(selfElement: HTMLElement, options?: GestureDragOptions): { cancel: () => void } {
  let oldDeltaX: number | undefined = undefined
  let oldDeltaY: number | undefined = undefined
  const { cancel } = listenGestureMove(selfElement, {
    onMoveStart: (iev) => {
      options?.onMoveStart?.(iev)
      const moveElement = options?.moveElement ?? iev.el
      if (!moveElement.style.getPropertyValue("transform")) {
        moveElement.style.transform = "translate(var(--x, 0), var(--y, 0))"
      }
      oldDeltaX = parseFloat(moveElement.style.getPropertyValue("--x")) || undefined
      oldDeltaY = parseFloat(moveElement.style.getPropertyValue("--y")) || undefined
    },
    onMoving: (iev) => {
      options?.onMoving?.(iev)
      const moveElement = options?.moveElement ?? iev.el
      const newDeltaX = oldDeltaX ? oldDeltaX + iev.totalDeltaInPx.dx : iev.totalDeltaInPx.dx
      const newDeltaY = oldDeltaY ? oldDeltaY + iev.totalDeltaInPx.dy : iev.totalDeltaInPx.dy
      moveElement.style.setProperty("--x", `${(newDeltaX).toFixed(3)}px`)
      moveElement.style.setProperty("--y", `${newDeltaY.toFixed(3)}px`)
    },
    onMoveEnd: (iev) => {
      options?.onMoveEnd?.(iev)
      const moveElement = options?.moveElement ?? iev.el
      if (options?.unsetMoveInEnd ?? true) {
        moveElement.style.removeProperty("--x")
        moveElement.style.removeProperty("--y")
      }
    },
  })
  return { cancel }
}
