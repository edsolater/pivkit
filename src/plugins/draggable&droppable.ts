import { createEffect, onCleanup } from "solid-js"
import { attachPointerGrag } from "../domkit"
import { createDomRef } from "../hooks"
import { cssOpacity } from "../styles"
import { createStateClass } from "../domkit/utils/stateClass"
import { emitCustomEvent, listenCustomEvent } from "../domkit/utils/customEvent"
import { moveElementDOMToNewContiner } from "../domkit/utils/moveElementDOMToNewContiner"
import { queryDiffInfo } from "@edsolater/fnkit"
import { createPlugin, type CSSObject } from "../piv/propHandlers"

type GestureDragCustomedEventInfo = {
  dragElement: HTMLElement
}

export const draggablePlugin = createPlugin(
  (options?: { draggableIcss?: CSSObject; draggingIcss?: CSSObject }) => () => {
    const { dom, setDom } = createDomRef()
    let droppableElements: HTMLElement[] = []
    createEffect(() => {
      const el = dom()
      if (!el) return
      const draggableStateClassRegistry = createStateClass("_draggable")(el)
      const draggingStateClassRegistry = createStateClass("_dragging")(el)
      draggableStateClassRegistry.add()
      const { remove } = attachPointerGrag(el, {
        onMoveStart() {
          draggingStateClassRegistry.add()
        },
        onMoving({ ev, el: dragElement }) {
          const droppables = findValidDroppableAreas(ev)
          const { newAdded, noLongerExist } = queryDiffInfo(droppableElements, droppables)
          droppableElements = droppables
          newAdded.forEach((el) => {
            emitCustomEvent<GestureDragCustomedEventInfo>(el, "customed-dragEnter", { dragElement })
          })
          noLongerExist.forEach((el) => {
            emitCustomEvent<GestureDragCustomedEventInfo>(el, "customed-dragLeave", { dragElement })
          })
        },
        onMoveEnd({ ev, el: dragElement }) {
          draggingStateClassRegistry.remove()
          findValidDroppableAreas(ev).forEach((el) => {
            emitCustomEvent<GestureDragCustomedEventInfo>(el, "customed-drop", { dragElement })
          })
        },
      })
      onCleanup(() => {
        remove()
        draggableStateClassRegistry.remove()
      })
    })
    return {
      icss: {
        "&._draggable": {
          cursor: "grab",
          "&._dragging": {
            cursor: "grabbing",
            ...options?.draggingIcss,
          },
          ...options?.draggableIcss,
        },
      },
      domRef: setDom,
    }
  },
)

export const droppablePlugin = createPlugin(
  (options?: { droppableIcss?: CSSObject; dragoverIcss?: CSSObject }) => () => {
    const { dom, setDom } = createDomRef()
    createEffect(() => {
      const el = dom()
      if (!el) return
      cacheElementRectInfo(el)

      const { add: addDroppableStateClass, remove: removeDroppableStateClass } = createStateClass("_droppable")(el)
      const { add: addDragoverStateClass, remove: removeDragoverStateClass } = createStateClass("_dragover")(el)

      addDroppableStateClass()
      listenCustomEvent<GestureDragCustomedEventInfo>(el, "customed-drop", ({ dragElement }) => {
        moveElementDOMToNewContiner({ dragElement, container: el })
        removeDragoverStateClass()
      })
      listenCustomEvent<GestureDragCustomedEventInfo>(el, "customed-dragEnter", () => {
        addDragoverStateClass()
      })
      listenCustomEvent<GestureDragCustomedEventInfo>(el, "customed-dragLeave", () => {
        removeDragoverStateClass()
      })
      onCleanup(() => {
        deleteElementRectInfo(el)
        removeDroppableStateClass()
      })
    })
    return {
      domRef: setDom,
      icss: {
        "&._droppable": {
          "&._dragover": {
            boxShadow: `inset 0 0 32px 16px ${cssOpacity("currentcolor", 0.4)}`,
            ...options?.dragoverIcss,
          },
          ...options?.droppableIcss,
        },
      },
    }
  },
)

const dropElementsRects = new Map<HTMLElement, DOMRect>()

function deleteElementRectInfo(el: HTMLElement) {
  dropElementsRects.delete(el)
}

function cacheElementRectInfo(el: HTMLElement) {
  dropElementsRects.set(el, el.getBoundingClientRect())
}

function findValidDroppableAreas(pointer: { x: number; y: number }) {
  const overedElements: HTMLElement[] = []
  for (const [el, rect] of dropElementsRects) {
    if (pointer.x > rect.left && pointer.x < rect.right && pointer.y > rect.top && pointer.y < rect.bottom) {
      overedElements.push(el)
    }
  }
  return overedElements
}
