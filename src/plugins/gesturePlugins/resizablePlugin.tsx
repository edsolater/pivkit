import { createEffect, onCleanup, onMount } from "solid-js"
import { listenGestureMove, useStateClass, type OnMoveEnd, type OnMoveStart, type OnMoving } from "../../domkit"
import { createDomRef } from "../../hooks"
import { Piv, createPlugin, type CSSObject, type Plugin } from "../../piv"
import { cssOpacity } from "../../styles"

export function isResizableElement(el: HTMLElement) {
  return el.classList.contains("_resizable")
}

export type ResizablePluginOptions = {
  resizableIcss?: CSSObject
  resizingIcss?: CSSObject

  /** default when 'onMoveX' is set  */
  canResizeX?: boolean
  /** default when 'onMoveY' is set  */
  canResizeY?: boolean

  onMoveXStart?: OnMoveStart
  onMoveX?: OnMoving
  onMoveXEnd?: OnMoveEnd

  onMoveYStart?: OnMoveStart
  onMoveY?: OnMoving
  onMoveYEnd?: OnMoveEnd
}

export type ResizablePlugin = Plugin<ResizablePluginOptions>

export const resizablePlugin: ResizablePlugin = createPlugin((options) => () => {
  const { dom, setDom } = createDomRef()
  const resizableStateClassManager = useStateClass("_resizable")
  const resizingStateClassManager = useStateClass("_resizing")
  onMount(() => {
    resizableStateClassManager.add()
    onCleanup(resizableStateClassManager.remove)
  })

  createEffect(() => {
    const el = dom()
    if (!el) return
  })
  const canResizeX = options.canResizeX ?? "onMoveX" in options
  const canResizeY = options.canResizeY ?? "onMoveY" in options
  return {
    icss: {
      "&._resizable": {
        position: "relative",
        "&._resizing": {
          userSelect: "none",
          pointerEvents: "none",
          ...options.resizingIcss,
        },
        ...options.resizableIcss,
      },
    } as const,
    domRef: [setDom, resizableStateClassManager.setDom, resizingStateClassManager.setDom],
    "render:firstChild": [
      canResizeX ? (
        <Piv // resize vertical handler
          icss={{
            position: "absolute",
            right: 0,
            top: 0,
            height: "100%",
            width: "8px",
            background: cssOpacity("dodgerblue", 0.3),
            borderRadius: "99px",
            zIndex: 2,
            transition: "300ms",
            "._resizing &": {
              width: "32px",
              background: "dodgerblue",
            },
          }}
          domRef={(el) => {
            listenGestureMove(el, {
              onMoving(cev) {
                options.onMoveX?.(cev)
              },
              onMoveStart(cev) {
                options.onMoveXStart?.(cev)
                resizingStateClassManager.add()
              },
              onMoveEnd(cev) {
                options.onMoveXEnd?.(cev)
                resizingStateClassManager.remove()
              },
            })
          }}
        />
      ) : null,
      canResizeY ? (
        <Piv // resize horizontal handler
          icss={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: "8px",
            width: "100%",
            background: cssOpacity("dodgerblue", 0.3),
            zIndex: 2,
            borderRadius: "99px",
            transition: "300ms",
            "._resizing &": {
              height: "32px",
              background: "dodgerblue",
            },
          }}
          domRef={(el) => {
            listenGestureMove(el, {
              onMoving(cev) {
                options.onMoveY?.(cev)
              },
              onMoveStart(cev) {
                options.onMoveYStart?.(cev)
                resizingStateClassManager.add()
              },
              onMoveEnd(cev) {
                options.onMoveYEnd?.(cev)
                resizingStateClassManager.remove()
              },
            })
          }}
        />
      ) : null,
    ],
  }
})
