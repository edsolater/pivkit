import type { AnyFn } from "@edsolater/fnkit"
import { createEffect, onCleanup } from "solid-js"
import { emitCustomEvent, listenCustomEvent } from "../domkit/utils/customEvent"
import { moveElementDOMToNewContiner } from "../domkit/utils/moveElementDOMToNewContiner"
import { createStateClass } from "../domkit/utils/stateClass"
import { createDomRef } from "../hooks"
import { attachIcssToElement, createPlugin, type CSSObject, type Plugin } from "../piv/propHandlers"
import { cssOpacity } from "../styles"
import { getElementFromRefs, type ElementRefs } from "../utils"
import type { ICSS } from "@edsolater/pivkit"
import type { OnMoveEnd, OnMoveStart, OnMoving } from "../domkit/utils/attachPointerMove"
import { listenDomEvent } from "../domkit"
import { attachGestureDrag, type GestureDragOptions } from "../domkit/utils/attachGestureDrag"

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
} & FeatureDragOptions

export type DraggablePlugin = Plugin<DraggablePluginOptions>

export const draggablePlugin: DraggablePlugin = createPlugin((options) => {
  const { dom: selfEl, setDom: setSelfDom } = createDomRef()
  createEffect(() => {
    const selfElement = selfEl()
    if (!selfElement) return
    attachFeatureDrag(selfElement, options)
  })
  const draggableIcssRules: ICSS = {
    ":is(&._draggable, ._draggable &)": {
      cursor: "grab",
      ...options.draggableIcss,
    },
  }

  if (options.handlerElement) {
    createEffect(() => {
      const els = getElementFromRefs(options.handlerElement)
      els.forEach((el) => {
        const { dispose } = attachIcssToElement(el, draggableIcssRules)
        onCleanup(dispose)
      })
    })
  } else {
    createEffect(() => {
      const el = selfEl()
      if (!el) return
      const { dispose } = attachIcssToElement(el, draggableIcssRules)
      onCleanup(dispose)
    })
  }
  return () => ({
    domRef: setSelfDom,
    icss: {
      "&._dragging": {
        cursor: "grabbing",
        userSelect: "none",
        pointerEvents: "none",
        ...options.draggingIcss,
      },
    },
  })
})

export const droppablePlugin = createPlugin(
  (options?: {
    /** only replace work when target canOnlyContent is also on*/
    canOnlyContent?: boolean

    noPresetIcss?: boolean
    droppableIcss?: CSSObject
    dragoverIcss?: CSSObject
  }) => {
    const { dom, setDom } = createDomRef()
    createEffect(() => {
      const selfElement = dom()
      if (!selfElement) return
      attachDropFeature(selfElement, {
        canOnlyContent: options?.canOnlyContent,
      })
    })
    return () => ({
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
    })
  },
)

let isDragging = false

type FeatureDragOptions = {
  onDrop?: (payloads: { handlerElement: HTMLElement; droppableAreas: HTMLElement[] }) => void
  /** only replace work when target canOnlyContent is also on*/
  canOnlyContent?: boolean
  /** draggable is default self element, but can also detect a hander */
  handlerElement?: ElementRefs
} & GestureDragOptions

/**
 * at end of drag, will emit customed-drop event to all droppable areas (the action can be changed by options)
 * onDrop callback is fired before customed-drop event is emitted
 */
function attachFeatureDrag(selfElement: HTMLElement, options?: FeatureDragOptions) {
  const cleanFns = [] as AnyFn[]
  const { add: addDraggableStateClass, remove: removeDraggableStateClass } = createStateClass("_draggable")(selfElement)
  const { add: addDraggingStateClass, remove: removeDraggingStateClass } = createStateClass("_dragging")(selfElement)
  addDraggableStateClass()
  cleanFns.push(removeDraggableStateClass)

  // ---------------- attach gesture move ----------------
  function moveHandlerElement(wrapElement: HTMLElement, handlerElements: HTMLElement[]) {
    handlerElements.forEach((handlerElement) => {
      const { cancel: cancelPresetGestureGrag } = attachGestureDrag(handlerElement, {
        ...options,
        moveElement: wrapElement,
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
          options?.onDrop?.({ handlerElement, droppableAreas: selectedDroppableAreas })
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
    })
  }

  if (options?.handlerElement) {
    moveHandlerElement(selfElement, getElementFromRefs(options.handlerElement))
  } else {
    moveHandlerElement(selfElement, [selfElement])
  }

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
