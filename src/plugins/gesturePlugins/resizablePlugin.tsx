import { createEffect, createSignal, on, onCleanup, onMount, type Accessor, type Setter } from "solid-js"
import {
  listenDomEvent,
  listenGestureMove,
  useStateClass,
  type OnMoveEnd,
  type OnMoveStart,
  type OnMoving,
} from "../../domkit"
import { createDomRef } from "../../hooks"
import { Piv, createPlugin, type CSSObject, type Plugin } from "../../piv"
import { WeakerSet, createSubscribable } from "@edsolater/fnkit"

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
                onMoving(cev) {
                  options.onMoveX?.(cev)
                },
                onMoveStart(cev) {
                  setIsResizingX(true)
                  options.onMoveXStart?.(cev)
                  resizingStateClassManager.add()
                  document.body.style.setProperty("cursor", "ew-resize")
                  document.body.style.setProperty("user-select", "none")
                },
                onMoveEnd(cev) {
                  setIsResizingX(false)
                  options.onMoveXEnd?.(cev)
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
                onMoving(cev) {
                  options.onMoveY?.(cev)
                },
                onMoveStart(cev) {
                  setIsResizingY(true)
                  options.onMoveYStart?.(cev)
                  resizingStateClassManager.add()
                  document.body.style.setProperty("cursor", "ns-resize")
                  document.body.style.setProperty("user-select", "none")
                },
                onMoveEnd(cev) {
                  setIsResizingY(false)
                  options.onMoveYEnd?.(cev)
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
