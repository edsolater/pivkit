import { makeElementMove, type RectInfo } from "../hooks/usePositionTranslate"
import { isHTMLElement } from "./isHTMLElement"

/** for plugin:draggable and plugin:droppable */
export function moveElementDOMToNewContiner({
  dropElement,
  dragElement,
  needRelaceContent,
  withTransition = true,
  dragTranslate,
  transitionDuration = 150,
}: {
  dropElement: HTMLElement
  dragElement: HTMLElement
  needRelaceContent?: boolean
  // animation
  withTransition?: boolean
  dragTranslate: {
    x: number
    y: number
  }
  transitionDuration?: number
}) {
  function core() {
    if (needRelaceContent) {
      const moveTargetNodes = Array.from(dragElement.childNodes)
      const oldChildren = Array.from(dropElement.childNodes)
      dragElement.append(...oldChildren)
      dropElement.append(...moveTargetNodes)
    } else {
      dropElement.append(dragElement)
    }
  }

  if (withTransition) {
    const startDragElementRect = getRectInfo(dragElement)
    core()
    const endDragElementRect = getRectInfo(dragElement)
    makeElementMove({
      from: startDragElementRect,
      to: endDragElementRect,
      actionElement: dragElement,
      additionalTranslateInfo: dragTranslate,
      animateOptions: { duration: transitionDuration },
    })
  } else {
    core()
    //TODO: still don't know to transition switch
  }
}

/** for plugin:sortable */
export function moveElementNextToSibling({
  dragElement,
  droppedElement,
  withTransition = true,
  dragTranslate,
  transitionDuration = 150,
}: {
  dragElement: HTMLElement
  droppedElement: HTMLElement
  // animation
  withTransition?: boolean
  dragTranslate: {
    x: number
    y: number
  }
  transitionDuration?: number
}) {
  const dragElementRect = dragElement.getBoundingClientRect()

  const leaderElementRect = droppedElement.getBoundingClientRect()

  // const computed = getComputedStyle(droppedElement) //

  if (withTransition) {
    const beforeDroppedRect = getRectInfo(droppedElement)
    const beforeDragRect = getRectInfo(dragElement)
    const betweenedElements = getBetweenTwoElements(dragElement, droppedElement)
    const beforeBetweenedElementRects = betweenedElements.map((el) => getRectInfo(el))

    // core
    core()

    const afterDroppedRect = getRectInfo(droppedElement)
    const afterDragRect = getRectInfo(dragElement)
    const afterBetweenedElementRects = betweenedElements.map((el) => getRectInfo(el))

    makeElementMove({
      from: beforeDragRect,
      to: afterDragRect,
      actionElement: dragElement,
      additionalTranslateInfo: dragTranslate,
      animateOptions: { duration: transitionDuration },
    })
    makeElementMove({
      from: beforeDroppedRect,
      to: afterDroppedRect,
      actionElement: droppedElement,
      animateOptions: { duration: transitionDuration },
    })
    // move betweened elements
    for (const [idx, el] of betweenedElements.entries()) {
      if (beforeBetweenedElementRects[idx] && afterBetweenedElementRects[idx]) {
        makeElementMove({
          from: beforeBetweenedElementRects[idx]!,
          to: afterBetweenedElementRects[idx]!,
          actionElement: el,
          animateOptions: { duration: transitionDuration },
        })
      }
    }
  } else {
    core()
  }

  function core() {
    const direction = (() => {
      const dragElementCenterPoint = {
        x: dragElementRect.left + dragElementRect.width / 2,
        y: dragElementRect.top + dragElementRect.height / 2,
      }
      const leaderElementCenterPoint = {
        x: leaderElementRect.left + leaderElementRect.width / 2,
        y: leaderElementRect.top + leaderElementRect.height / 2,
      }
      const deltaX = Math.abs(leaderElementCenterPoint.x - dragElementCenterPoint.x)
      const deltaY = Math.abs(leaderElementCenterPoint.y - dragElementCenterPoint.y)
      if (deltaX > deltaY) {
        return "horizontal"
      } else {
        return "vertical"
      }
    })()

    const leaderShouldAppearFirst = (() => {
      if (direction === "horizontal") {
        return dragElementRect.left < leaderElementRect.left
      } else {
        return dragElementRect.top < leaderElementRect.top
      }
    })()

    if (leaderShouldAppearFirst) {
      droppedElement.before(dragElement)
    } else {
      droppedElement.after(dragElement)
    }
    droppedElement.clientHeight
  }
}

/**
 *
 * @param domRectInfo original Dom domRectInfo
 * @returns original Dom domRectInfo's left, top, right, bottom is getter, so we need to convert it to object
 */
function getRectInfo(dom: HTMLElement): RectInfo {
  const domRectInfo = dom.getBoundingClientRect()
  return {
    left: domRectInfo.left,
    top: domRectInfo.top,
    right: domRectInfo.right,
    bottom: domRectInfo.bottom,
  }
}

function getBetweenTwoElements(boundaryElement1: HTMLElement, boundaryElement2: HTMLElement): HTMLElement[] {
  const parentElement = boundaryElement1.parentElement
  if (!parentElement) {
    throw new Error("boundaryElement1 should have parentElement")
  }
  const children = Array.from(parentElement.children).filter(isHTMLElement)
  const boundaryElement1Index = children.indexOf(boundaryElement1)
  const boundaryElement2Index = children.indexOf(boundaryElement2)
  if (boundaryElement1Index === -1 || boundaryElement2Index === -1) {
    throw new Error("boundaryElement1 and boundaryElement2 should be in the same parentElement")
  }
  const start = Math.min(boundaryElement1Index, boundaryElement2Index)
  const end = Math.max(boundaryElement1Index, boundaryElement2Index)
  return children.slice(start + 1, end)
}
