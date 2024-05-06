import type { AnyFn } from "@edsolater/fnkit"
import { createEffect } from "solid-js"
import { attachPointerGrag, listenDomEvent, type OnMoveEnd, type OnMoveStart, type OnMoving } from "../domkit"
import { emitCustomEvent, listenCustomEvent } from "../domkit/utils/customEvent"
import { moveElementDOMToNewContiner } from "../domkit/utils/moveElementDOMToNewContiner"
import { createStateClass } from "../domkit/utils/stateClass"
import { createDomRef } from "../hooks"
import { createPlugin, type CSSObject, type Plugin } from "../piv/propHandlers"
import { cssOpacity } from "../styles"

export type GestureDragCustomedEventInfo = {
  dragElement: HTMLElement
  shouldSwitch?: boolean
  dragTranslate: {
    x: number
    y: number
  }
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

export type DraggablePluginOptions = {
  draggableIcss?: CSSObject
  draggingIcss?: CSSObject
} & DragFeatureOptions

export type DraggablePlugin = Plugin<{ draggableIcss?: CSSObject; draggingIcss?: CSSObject } & DragFeatureOptions>

export const draggablePlugin: DraggablePlugin = createPlugin((options) => () => {
  const { dom, setDom } = createDomRef()
  createEffect(() => {
    const selfElement = dom()
    if (!selfElement) return
    attachDragFeature(selfElement, options)
  })
  return {
    icss: {
      "&._draggable": {
        cursor: "grab",
        "&._dragging": {
          cursor: "grabbing",
          userSelect: "none",
          pointerEvents: "none",
          ...options.draggingIcss,
        },
        ...options.draggableIcss,
      },
    } as const,
    domRef: setDom,
  }
})

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

type DragFeatureOptions = {
  onDrop?: (payloads: { dragElement: HTMLElement; droppableAreas: HTMLElement[] }) => void
  onMoving?: OnMoving
  onMoveStart?: OnMoveStart
  onMoveEnd?: OnMoveEnd
  /** only replace work when target canOnlyContent is also on*/
  canOnlyContent?: boolean
}

/**
 * at end of drag, will emit customed-drop event to all droppable areas (the action can be changed by options)
 * onDrop callback is fired before customed-drop event is emitted
 */
function attachDragFeature(selfElement: HTMLElement, options?: DragFeatureOptions) {
  const cleanFns = [] as AnyFn[]
  const { add: addDraggableStateClass, remove: removeDraggableStateClass } = createStateClass("_draggable")(selfElement)
  const { add: addDraggingStateClass, remove: removeDraggingStateClass } = createStateClass("_dragging")(selfElement)
  addDraggableStateClass()
  cleanFns.push(removeDraggableStateClass)
  const { cancel: cancelPresetGestureGrag } = attachPointerGrag(selfElement, {
    onMoving(cev) {
      options?.onMoving?.(cev)
    },
    onMoveStart(cev) {
      addDraggingStateClass()
      isDragging = true
      options?.onMoveStart?.(cev)
    },
    onMoveEnd(cev) {
      const { ev, el: dragElement, totalDeltaInPx } = cev
      removeDraggingStateClass()
      isDragging = false
      const selectedDroppableAreas = findValidDroppableAreas()
      options?.onDrop?.({ dragElement, droppableAreas: selectedDroppableAreas })
      selectedDroppableAreas.forEach((el) => {
        emitCustomEvent<GestureDragCustomedEventInfo>(el, "customed-drop", {
          dragElement: dragElement,
          shouldSwitch: options?.canOnlyContent,
          dragTranslate: {
            x: totalDeltaInPx.dx,
            y: totalDeltaInPx.dy,
          },
        })
      })
      options?.onMoveEnd?.(cev)
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
    ({ dragElement, shouldSwitch, dragTranslate }) => {
      if (dragElement && dragElement !== selfElement && dragElement.parentElement !== selfElement) {
        moveElementDOMToNewContiner({
          dropElement: selfElement,
          dragElement: dragElement,
          dragTranslate,
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
