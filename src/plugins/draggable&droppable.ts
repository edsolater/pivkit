import { createEffect, onCleanup } from "solid-js"
import { attachPointerGrag, listenDomEvent } from "../domkit"
import { emitCustomEvent, listenCustomEvent } from "../domkit/utils/customEvent"
import { moveElementDOMToNewContiner } from "../domkit/utils/moveElementDOMToNewContiner"
import { createStateClass } from "../domkit/utils/stateClass"
import { createDomRef } from "../hooks"
import { createPlugin, type CSSObject } from "../piv/propHandlers"
import { cssOpacity } from "../styles"

export type GestureDragCustomedEventInfo = {
  dragElement: HTMLElement
  oldContainer: HTMLElement | null
}
let isDragging = false

const droppableElements = new Set<HTMLElement>()

function deleteDroppableElement(el: HTMLElement) {
  droppableElements.delete(el)
}

function cacheDroppableElement(el: HTMLElement) {
  droppableElements.add(el)
}

function findValidDroppableAreas() {
  return Array.from(droppableElements)
}

export const draggablePlugin = createPlugin(
  (options?: { draggableIcss?: CSSObject; draggingIcss?: CSSObject }) => () => {
    const { dom, setDom } = createDomRef()
    createEffect(() => {
      const selfElement = dom()
      if (!selfElement) return
      const { add: addDraggableStateClass, remove: removeDraggableStateClass } =
        createStateClass("_draggable")(selfElement)
      const { add: addDraggingStateClass, remove: removeDraggingStateClass } =
        createStateClass("_dragging")(selfElement)
      addDraggableStateClass()
      onCleanup(removeDraggableStateClass)
      const { cancel: cancelPresetGestureGrag } = attachPointerGrag(selfElement, {
        onMoveStart() {
          addDraggingStateClass()
          isDragging = true
        },
        onMoveEnd({ ev, el: dragElement }) {
          removeDraggingStateClass()
          isDragging = false
          findValidDroppableAreas().forEach((el) => {
            emitCustomEvent<GestureDragCustomedEventInfo>(el, "customed-drop", {
              dragElement,
              oldContainer: dragElement.parentElement,
            })
          })
        },
      })
      onCleanup(cancelPresetGestureGrag)
      onCleanup(() => {
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
      const selfElement = dom()
      if (!selfElement) return
      const { add: addDroppableStateClass, remove: removeDroppableStateClass } =
        createStateClass("_droppable")(selfElement) // TODO: is not good to read
      const { add: addDragoverStateClass, remove: removeDragoverStateClass } =
        createStateClass("_dragover")(selfElement)
      addDroppableStateClass()
      onCleanup(removeDroppableStateClass)

      function cleanSelf() {
        if (selfElement) deleteDroppableElement(selfElement)
        removeDragoverStateClass()
      }
      function observeSelf() {
        if (!isDragging) return
        if (selfElement) cacheDroppableElement(selfElement)
        addDragoverStateClass()
      }

      const { cancel: cancelCustomedDropEnterListener } = listenCustomEvent<GestureDragCustomedEventInfo>(
        selfElement,
        "customed-drop",
        ({ dragElement, oldContainer }) => {
          if (oldContainer !== selfElement) {
            moveElementDOMToNewContiner({ dragElement, container: selfElement })
          }
          cleanSelf()
        },
      )
      onCleanup(cancelCustomedDropEnterListener)
      const { cancel: cancelPointerEnterListener } = listenDomEvent(selfElement, "pointerenter", observeSelf)
      onCleanup(cancelPointerEnterListener)
      const { cancel: cancelPointerLeaveListener } = listenDomEvent(selfElement, "pointerleave", cleanSelf)
      onCleanup(cancelPointerLeaveListener)
      const { cancel: cancelPointerCancelListener } = listenDomEvent(globalThis.document, "pointercancel", cleanSelf)
      onCleanup(cancelPointerCancelListener)
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

function isDraggableElement(el: HTMLElement) {
  return el.classList.contains("_draggable")
}
