import { WeakerSet, toFixedDecimal } from "@edsolater/fnkit"
import { createEffect, createSignal, on, onCleanup, onMount, type Accessor, type Setter } from "solid-js"
import {
  listenDomEvent,
  listenGestureMove,
  useStateClass,
  type Delta2dTranslate,
  type OnMoveEnd,
  type OnMoveStart,
  type OnMoving,
} from "../../webTools"
import { createDomRef } from "../../hooks"
import { Piv, createPlugin, type CSSObject, type Plugin } from "../../piv"

export function isResizableElement(el: HTMLElement) {
  return el.classList.contains("_resizable")
}

export type ResizablePluginOptions = {
  resizableIcss?: CSSObject
  resizingIcss?: CSSObject

  /** for localStorage */
  localStorageKey?: string
  /** @default true */
  valueStoreInLocalStorage?: boolean

  /** @default true  */
  canResizeX?: boolean
  /** @default false  */
  canResizeY?: boolean

  onSizeChange?: (payloads: { dir: "x"; currentVal: number } | { dir: "y"; currentVal: number }) => void
  onResizing?: (payloads: { dir: "x"; currentVal: number } | { dir: "y"; currentVal: number }) => void
  onMoveXStart?: OnMoveStart
  onMoveX?: OnMoving
  onMoveXEnd?: OnMoveEnd

  onMoveYStart?: OnMoveStart
  onMoveY?: OnMoving
  onMoveYEnd?: OnMoveEnd
}

export type ResizableState = {
  /** @deprecated prefer styleMaskRef instead */
  styleMask: { turnOn(el: HTMLElement | undefined): void; turnOff(el: HTMLElement | undefined): void }

  resizingHiddenTransactionMask: (el: HTMLElement) => void
}

export type ResizablePlugin = Plugin<ResizablePluginOptions, ResizableState>

export const resizablePlugin: ResizablePlugin = createPlugin((options) => {
  //#region ---------------- resize style mask ----------------
  const styleMaskEls = new WeakerSet<HTMLElement>()
  const [isResizingX, setIsResizingX] = createSignal(false)
  const [isResizingY, setIsResizingY] = createSignal(false)

  createEffect(() => {
    if (isResizingX()) {
      document.body.style.setProperty("cursor", "ew-resize")
      document.body.style.setProperty("user-select", "none")
      styleMaskEls.forEach((el) => {
        el.style.setProperty("transition", "none")
      })
    } else {
      document.body.style.removeProperty("cursor")
      document.body.style.removeProperty("user-select")
      styleMaskEls.forEach((el) => {
        el.style.removeProperty("transition")
      })
    }
  })
  createEffect(() => {
    if (isResizingY()) {
      document.body.style.setProperty("cursor", "ew-resize")
      document.body.style.setProperty("user-select", "none")
      styleMaskEls.forEach((el) => {
        el.style.setProperty("transition", "none")
      })
    } else {
      document.body.style.removeProperty("cursor")
      document.body.style.removeProperty("user-select")
      styleMaskEls.forEach((el) => {
        el.style.removeProperty("transition")
      })
    }
  })
  //#endregion

  const plugin = () => {
    const { dom, setDom } = createDomRef()
    const resizableStateClassManager = useStateClass("_resizable")
    const resizingStateClassManager = useStateClass("_resizing")

    let elementRecordWidthPx = 0
    let elementRecordHeightPx = 0

    function tempResizeTo(size: { x?: number; y?: number }) {
      if (size.x) dom()?.style.setProperty("width", toFixedDecimal(size.x, 3) + "px")
      if (size.y) dom()?.style.setProperty("height", toFixedDecimal(size.y, 3) + "px")
    }

    function clearTempResize() {
      dom()?.style.removeProperty("width")
      dom()?.style.removeProperty("height")
    }

    function recordElementSize(el: HTMLElement) {
      const { width, height } = el.getBoundingClientRect()
      elementRecordWidthPx = width
      elementRecordHeightPx = height
    }

    function reportSizeChange(dir: "x" | "y", totalDelta: Delta2dTranslate) {
      if (dir === "x") {
        options.onSizeChange?.({
          dir: "x",
          get currentVal() {
            return (elementRecordWidthPx ?? 0) + totalDelta.dx
          },
        })
      } else {
        options.onSizeChange?.({
          dir: "y",
          get currentVal() {
            return (elementRecordHeightPx ?? 0) + totalDelta.dy
          },
        })
      }
    }

    function reportResizing(dir: "x" | "y", totalDelta: Delta2dTranslate) {
      if (dir === "x") {
        options.onResizing?.({
          dir: "x",
          get currentVal() {
            return (elementRecordWidthPx ?? 0) + totalDelta.dx
          },
        })
      } else {
        options.onResizing?.({
          dir: "y",
          get currentVal() {
            return (elementRecordHeightPx ?? 0) + totalDelta.dy
          },
        })
      }
    }

    onMount(() => {
      resizableStateClassManager.add()
      onCleanup(resizableStateClassManager.remove)
    })

    createEffect(() => {
      const el = dom()
      if (!el) return
    })
    const canResizeX = options.canResizeX ?? true
    const canResizeY = options.canResizeY ?? false
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
      defineFirstChild: [
        canResizeX ? (
          <Piv // resize vertical handler
            icss={{
              position: "absolute",
              right: 0,
              top: 0,
              height: "100%",
              width: "6px",
              background: "transparent",
              borderRadius: "99px",
              zIndex: 2,
              transition: "300ms",
              cursor: "ew-resize",
              "._resizing &": {
                background: "#598def",
              },
            }}
            domRef={(el) => {
              listenGestureMove(el, {
                onMoveStart(cev) {
                  setIsResizingX(true)
                  recordElementSize(cev.el.parentElement as HTMLElement)
                  options.onMoveXStart?.(cev)
                  resizingStateClassManager.add()
                  document.body.style.setProperty("cursor", "ew-resize")
                  document.body.style.setProperty("user-select", "none")
                },
                onMoving(cev) {
                  options.onMoveX?.(cev)
                  reportResizing("x", cev.totalDeltaInPx)
                  tempResizeTo({ x: elementRecordWidthPx + cev.totalDeltaInPx.dx })
                },
                onMoveEnd(cev) {
                  setIsResizingX(false)
                  options.onMoveXEnd?.(cev)
                  reportSizeChange("x", cev.totalDeltaInPx)
                  clearTempResize()
                  recordElementSize(cev.el.parentElement as HTMLElement)
                  resizingStateClassManager.remove()
                  document.body.style.removeProperty("cursor")
                  document.body.style.removeProperty("user-select")
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
              height: "6px",
              width: "100%",
              background: "transparent",
              borderRadius: "99px",
              zIndex: 2,
              transition: "300ms",
              cursor: "ns-resize",
              "._resizing &": {
                background: "#598def",
              },
            }}
            domRef={(el) => {
              listenGestureMove(el, {
                onMoveStart(cev) {
                  setIsResizingY(true)
                  recordElementSize(cev.el.parentElement as HTMLElement)
                  options.onMoveYStart?.(cev)
                  resizingStateClassManager.add()
                  document.body.style.setProperty("cursor", "ns-resize")
                  document.body.style.setProperty("user-select", "none")
                },
                onMoving(cev) {
                  options.onMoveY?.(cev)
                  reportResizing("y", cev.totalDeltaInPx)
                },
                onMoveEnd(cev) {
                  setIsResizingY(false)
                  options.onMoveYEnd?.(cev)
                  reportSizeChange("y", cev.totalDeltaInPx)
                  recordElementSize(cev.el.parentElement as HTMLElement)
                  resizingStateClassManager.remove()
                  document.body.style.removeProperty("cursor")
                  document.body.style.removeProperty("user-select")
                },
              })
            }}
          />
        ) : null,
      ],
    }
  }
  const state: ResizableState = {
    get styleMask() {
      return {
        turnOn(el: HTMLElement | undefined) {
          el?.style.setProperty("transition", "none")
        },
        turnOff(el: HTMLElement | undefined) {
          el?.style.removeProperty("transition")
        },
      }
    },
    resizingHiddenTransactionMask: (el) => {
      styleMaskEls.add(el)
    },
  }
  return { plugin, state }
})

function useLocalStorageValue(
  key: string,
  defaultValue?: string,
): [Accessor<string | undefined>, Setter<string | undefined>] {
  const [value, setValue] = createSignal<string | undefined>(globalThis.localStorage.getItem(key) ?? defaultValue)
  createEffect(
    on(value, async (v) => {
      await 0 // force the action into microtask
      const storedValue = globalThis.localStorage.getItem(key)
      if (storedValue !== v) {
        if (v != null) {
          globalThis.localStorage.setItem(key, v)
        } else {
          globalThis.localStorage.removeItem(key)
        }
      }
    }),
  )
  onMount(() => {
    listenDomEvent(globalThis.window, "storage", ({ ev }) => {
      const { key: newKey, newValue } = ev as StorageEvent
      if (key === newKey) {
        if (newValue != null) {
          setValue(newValue)
        } else {
          setValue(defaultValue)
        }
      }
    })
  })
  return [value, setValue]
}
