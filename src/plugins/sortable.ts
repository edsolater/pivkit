import { createEffect, onCleanup } from "solid-js"
import { attachPointerGrag, listenDomEvent } from "../domkit"
import { emitCustomEvent, listenCustomEvent } from "../domkit/utils/customEvent"
import { moveElementNextToSibling } from "../domkit/utils/moveElementDOMToNewContiner"
import { createStateClass } from "../domkit/utils/stateClass"
import { createDomRef } from "../hooks"
import { createPlugin, type CSSObject } from "../piv/propHandlers"
import { cssOpacity } from "../styles"
import { GestureDragCustomedEventInfo } from "./draggable&droppable"
type GestureSortCustomedEventInfo = {
  dragElement: HTMLElement
  dragTranslateX: number
  dragTranslateY: number
}
const sortableElements = new Set<HTMLElement>()

function deleteSortableElement(el: HTMLElement) {
  sortableElements.delete(el)
}
function cacheSortableElement(el: HTMLElement) {
  sortableElements.add(el)
}

function findValidSortableAreas() {
  return Array.from(sortableElements)
}

let isSorting = false
/**
 * droppable means `<Box>` is a container
 * sortable means `<Box>` is in an container
 */
export const sortablePlugin = createPlugin(
  (options?: {
    noPresetIcss?: boolean
    sortableIcss?: CSSObject
    dragoverIcss?: CSSObject
    draggingIcss?: CSSObject
  }) =>
    () => {
      const { dom, setDom } = createDomRef()
      createEffect(() => {
        const selfElement = dom()
        if (!selfElement) return
        const { add: addSortableStateClass, remove: removeSortableStateClass } =
          createStateClass("_sortable")(selfElement)
        const { add: addDragoverStateClass, remove: removeDragoverStateClass } =
          createStateClass("_dragover")(selfElement)
        const { add: addDraggableStateClass, remove: removeDraggableStateClass } =
          createStateClass("_draggable")(selfElement)
        const { add: addDraggingStateClass, remove: removeDraggingStateClass } =
          createStateClass("_dragging")(selfElement)

        addSortableStateClass()
        onCleanup(removeSortableStateClass)

        addDraggableStateClass()
        onCleanup(removeDraggableStateClass)

        function cleanSelf() {
          if (selfElement) deleteSortableElement(selfElement)
          removeDragoverStateClass()
        }
        function observeSelf() {
          if (!isSorting) return
          if (selfElement) cacheSortableElement(selfElement)
          addDragoverStateClass()
        }

        // drag self
        const { cancel: cancelPresetGestureGrag } = attachPointerGrag(selfElement, {
          onMoveStart() {
            addDraggingStateClass()
            isSorting = true
          },
          onMoveEnd({ el: dragElement, totalDeltaInPx }) {
            removeDraggingStateClass()
            isSorting = false
            findValidSortableAreas().forEach((el) =>
              emitCustomEvent<GestureSortCustomedEventInfo>(
                el,
                "customed-sort-drop",
                {
                  dragElement,
                  dragTranslateX: totalDeltaInPx.dx,
                  dragTranslateY: totalDeltaInPx.dy,
                },
                { async: false },
              ),
            )
          },
        })
        onCleanup(cancelPresetGestureGrag)

        // be cover by other(should switch position)
        const { cancel: cancelCustomSortDropEnterListener } = listenCustomEvent<GestureSortCustomedEventInfo>(
          selfElement,
          "customed-sort-drop",
          ({ dragElement, dragTranslateX, dragTranslateY }) => {
            if (isSortableElement(selfElement) && isSortableElement(dragElement)) {
              moveElementNextToSibling({
                dragElement,
                droppedElement: selfElement,
                withTransition: true,
                dragTranslateX,
                dragTranslateY,
              })
            }
            cleanSelf()
          },
        )
        onCleanup(cancelCustomSortDropEnterListener)
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
          "&._sortable": {
            cursor: "grab",
            "&._dragover": {
              boxShadow: options?.noPresetIcss ? undefined : `inset 0 0 32px 16px ${cssOpacity("currentcolor", 0.1)}`,
              ...options?.dragoverIcss,
            },
            "&._dragging": {
              cursor: "grabbing",
              userSelect: "none",
              pointerEvents: "none",
              ...options?.draggingIcss,
            },
            ...options?.sortableIcss,
          } as const,
        },
      }
    },
)

function isSortableElement(el: HTMLElement) {
  return el.classList.contains("_sortable")
}
