import { createEffect, onCleanup } from "solid-js"
import { attachPointerGrag, listenDomEvent } from "../domkit"
import { emitCustomEvent, listenCustomEvent } from "../domkit/utils/customEvent"
import { moveElementDOMToNewContiner } from "../domkit/utils/moveElementDOMToNewContiner"
import { createStateClass } from "../domkit/utils/stateClass"
import { createDomRef } from "../hooks"
import { createPlugin, type CSSObject } from "../piv/propHandlers"
import { cssOpacity } from "../styles"

type GestureDragCustomedEventInfo = {
  dragElement: HTMLElement
  oldContainer: HTMLElement | null
}
let isDragging = false
export const draggablePlugin = createPlugin(
  (options?: { draggableIcss?: CSSObject; draggingIcss?: CSSObject }) => () => {
    const { dom, setDom } = createDomRef()
    createEffect(() => {
      const el = dom()
      if (!el) return
      const draggableStateClassRegistry = createStateClass("_draggable")(el)
      const draggingStateClassRegistry = createStateClass("_dragging")(el)
      draggableStateClassRegistry.add()
      const { cancel } = attachPointerGrag(el, {
        onMoveStart() {
          draggingStateClassRegistry.add()
          isDragging = true
        },
        onMoveEnd({ ev, el: dragElement }) {
          draggingStateClassRegistry.remove()
          isDragging = false
          findValidDroppableAreas(ev).forEach((el) => {
            emitCustomEvent<GestureDragCustomedEventInfo>(el, "customed-drop", {
              dragElement,
              oldContainer: dragElement.parentElement,
            })
          })
        },
      })
      onCleanup(() => {
        cancel()
        draggableStateClassRegistry.remove()
        isDragging = false
      })
    })
    return {
      icss: {
        "&._draggable": {
          cursor: "grab",
          "&._dragging": {
            cursor: "grabbing",
            userSelect: "none",
            pointerEvents: "none",
            ...options?.draggingIcss,
          },
          ...options?.draggableIcss,
        },
      } as const,
      domRef: setDom,
    }
  },
)

export const droppablePlugin = createPlugin(
  (options?: { noPresetIcss?: boolean; droppableIcss?: CSSObject; dragoverIcss?: CSSObject }) => () => {
    const { dom, setDom } = createDomRef()
    createEffect(() => {
      const el = dom()
      if (!el) return
      const { add: addDroppableStateClass, remove: removeDroppableStateClass } = createStateClass("_droppable")(el)
      const { add: addDragoverStateClass, remove: removeDragoverStateClass } = createStateClass("_dragover")(el)
      function cleanSelf() {
        if (el) deleteDroppableElement(el)
        removeDragoverStateClass()
      }
      function observeSelf() {
        if (!isDragging) return
        if (el) cacheDroppableElement(el)
        addDragoverStateClass()
      }
      addDroppableStateClass()
      listenCustomEvent<GestureDragCustomedEventInfo>(el, "customed-drop", ({ dragElement, oldContainer }) => {
        if (oldContainer !== el) {
          moveElementDOMToNewContiner({ dragElement, container: el })
        }
        cleanSelf()
      })
      listenDomEvent(el, "pointerenter", observeSelf)
      listenDomEvent(el, "pointerleave", cleanSelf)
      listenDomEvent(globalThis.document, "pointercancel", cleanSelf)

      onCleanup(() => {
        removeDroppableStateClass()
      })
    })
    return {
      domRef: setDom,
      icss: {
        "&._droppable": {
          "&._dragover": {
            boxShadow: options?.noPresetIcss ? undefined : `inset 0 0 32px 16px ${cssOpacity("currentcolor", 0.1)}`,
            ...options?.dragoverIcss,
          },
          ...options?.droppableIcss,
        },
      },
    }
  },
)

const droppableElements = new Set<HTMLElement>()

function deleteDroppableElement(el: HTMLElement) {
  droppableElements.delete(el)
}

function cacheDroppableElement(el: HTMLElement) {
  droppableElements.add(el)
}

function findValidDroppableAreas(pointer: { x: number; y: number }) {
  return Array.from(droppableElements)
}
