import { createEffect, onCleanup } from "solid-js"
import { attachPointerGrag, listenDomEvent } from "../domkit"
import { emitCustomEvent, listenCustomEvent } from "../domkit/utils/customEvent"
import { moveElementDOMToNewContiner } from "../domkit/utils/moveElementDOMToNewContiner"
import { createStateClass } from "../domkit/utils/stateClass"
import { createDomRef } from "../hooks"
import { createPlugin, type CSSObject } from "../piv/propHandlers"
import { cssOpacity } from "../styles"
import type { AnyFn } from "@edsolater/fnkit"

export type GestureDragCustomedEventInfo = {
  dragElement: HTMLElement
  shouldSwitch?: boolean
}

export function isDraggableElement(el: HTMLElement) {
  return el.classList.contains("_draggable")
}

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
  (options?: {
    /** only replace work when target canOnlyContent is also on*/
    canOnlyContent?: boolean
    draggableIcss?: CSSObject
    draggingIcss?: CSSObject
  }) =>
    () => {
      const { dom, setDom } = createDomRef()
      createEffect(() => {
        const selfElement = dom()
        if (!selfElement) return
        attachDragFeature(selfElement, {
          canOnlyContent: options?.canOnlyContent,
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
  (options?: {
    /** only replace work when target canOnlyContent is also on*/
    canOnlyContent?: boolean

    noPresetIcss?: boolean
    droppableIcss?: CSSObject
    dragoverIcss?: CSSObject
  }) =>
    () => {
      const { dom, setDom } = createDomRef()
      createEffect(() => {
        const selfElement = dom()
        if (!selfElement) return
        attachDropFeature(selfElement, {
          canOnlyContent: options?.canOnlyContent,
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

let isDragging = false

/**
 * at end of drag, will emit customed-drop event to all droppable areas (the action can be changed by options)
 * onDrop callback is fired before customed-drop event is emitted
 */
function attachDragFeature(
  selfElement: HTMLElement,
  options?: {
    onDrop?: (payloads: { dragElement: HTMLElement; droppableAreas: HTMLElement[] }) => void
    /** only replace work when target canOnlyContent is also on*/
    canOnlyContent?: boolean
  },
) {
  const cleanFns = [] as AnyFn[]
  const { add: addDraggableStateClass, remove: removeDraggableStateClass } = createStateClass("_draggable")(selfElement)
  const { add: addDraggingStateClass, remove: removeDraggingStateClass } = createStateClass("_dragging")(selfElement)
  addDraggableStateClass()
  cleanFns.push(removeDraggableStateClass)
  const { cancel: cancelPresetGestureGrag } = attachPointerGrag(selfElement, {
    onMoveStart() {
      addDraggingStateClass()
      isDragging = true
    },
    onMoveEnd({ ev, el: dragElement }) {
      removeDraggingStateClass()
      isDragging = false
      const selectedDroppableAreas = findValidDroppableAreas()
      options?.onDrop?.({ dragElement, droppableAreas: selectedDroppableAreas })
      console.log("options?.canOnlyContent: ", options)
      selectedDroppableAreas.forEach((el) => {
        emitCustomEvent<GestureDragCustomedEventInfo>(el, "customed-drop", {
          dragElement: dragElement,
          shouldSwitch: options?.canOnlyContent,
        })
      })
    },
  })
  cleanFns.push(cancelPresetGestureGrag)
  cleanFns.push(() => {
    isDragging = false
  })
  return () => {
    cleanFns.forEach((fn) => fn())
  }
}

function attachDropFeature(
  selfElement: HTMLElement,
  options?: {
    /** only replace work when target canOnlyContent is also on*/
    canOnlyContent?: boolean
  },
) {
  const cleanFns = [] as AnyFn[]
  const { add: addDroppableStateClass, remove: removeDroppableStateClass } = createStateClass("_droppable")(selfElement) // TODO: is not good to read
  const { add: addDragoverStateClass, remove: removeDragoverStateClass } = createStateClass("_dragover")(selfElement)
  addDroppableStateClass()
  cleanFns.push(removeDroppableStateClass)

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
    ({ dragElement, shouldSwitch }) => {
      if (dragElement && dragElement !== selfElement && dragElement.parentElement !== selfElement) {
        moveElementDOMToNewContiner({
          dropElement: selfElement,
          dragElement: dragElement,
          needRelaceContent: shouldSwitch && options?.canOnlyContent,
        })
      }
      cleanSelf()
    },
  )
  cleanFns.push(cancelCustomedDropEnterListener)
  const { cancel: cancelPointerEnterListener } = listenDomEvent(selfElement, "pointerenter", observeSelf)
  cleanFns.push(cancelPointerEnterListener)
  const { cancel: cancelPointerLeaveListener } = listenDomEvent(selfElement, "pointerleave", cleanSelf)
  cleanFns.push(cancelPointerLeaveListener)
  const { cancel: cancelPointerCancelListener } = listenDomEvent(globalThis.document, "pointercancel", cleanSelf)
  cleanFns.push(cancelPointerCancelListener)
  return () => {
    cleanFns.forEach((fn) => fn())
  }
}
