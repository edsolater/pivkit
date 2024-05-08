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
import { cssOpacity } from "../../styles"
import { glob } from "goober"

export function isResizableElement(el: HTMLElement) {
  return el.classList.contains("_resizable")
}

export type ResizablePluginOptions = {
  resizableIcss?: CSSObject
  resizingIcss?: CSSObject

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
                options.onMoveXStart?.(cev)
                resizingStateClassManager.add()
                document.body.style.setProperty("cursor", "ew-resize")
                document.body.style.setProperty("user-select", "none")
              },
              onMoveEnd(cev) {
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
                options.onMoveYStart?.(cev)
                resizingStateClassManager.add()
                document.body.style.setProperty("cursor", "ns-resize")
                document.body.style.setProperty("user-select", "none")
              },
              onMoveEnd(cev) {
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
