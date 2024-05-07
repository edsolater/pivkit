import { createEffect } from "solid-js"
import { createStateClass, listenGestureMove, type GestureMoveOptions } from "../../domkit"
import { createDomRef } from "../../hooks"
import { createPlugin, type CSSObject, type Plugin } from "../../piv"

export function isMovableElement(el: HTMLElement) {
  return el.classList.contains("_movable")
}

export type MovablePluginOptions = GestureMoveOptions

export type MovablePlugin = Plugin<{ movableIcss?: CSSObject; movingIcss?: CSSObject } & GestureMoveOptions>

export const movablePlugin: MovablePlugin = createPlugin((options) => () => {
  const { dom, setDom } = createDomRef()
  createEffect(() => {
    const el = dom()
    if (!el) return
    const { add: addMovingStateClass, remove: removeMovingStateClass } = createStateClass("_moving")(el)
    listenGestureMove(el, options)
  })
  return {
    icss: {
      "&._movable": {
        cursor: "grab",
        "&._moving": {
          cursor: "grabbing",
          userSelect: "none",
          pointerEvents: "none",
          ...options.movingIcss,
        },
        ...options.movableIcss,
      },
    } as const,
    domRef: setDom,
  }
})
