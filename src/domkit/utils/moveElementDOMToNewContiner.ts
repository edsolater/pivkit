export function moveElementDOMToNewContiner({
  dragElement,
  container,
}: {
  dragElement: HTMLElement
  container: HTMLElement
}) {
  container.appendChild(dragElement)
}
export function moveElementNextToSibling({
  dragElement,
  leaderElement,
}: {
  dragElement: HTMLElement
  leaderElement: HTMLElement
}) {
  const dragElementRect = dragElement.getBoundingClientRect()
  const leaderElementRect = leaderElement.getBoundingClientRect()
  const dir = (() => {
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
    if (dir === "horizontal") {
      return dragElementRect.left < leaderElementRect.left
    } else {
      return dragElementRect.top < leaderElementRect.top
    }
  })()
  if (leaderShouldAppearFirst) {
    leaderElement.before(dragElement)
  } else {
    leaderElement.after(dragElement)
  }
}
