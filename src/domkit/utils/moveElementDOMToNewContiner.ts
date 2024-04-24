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
  leaderElement.after(dragElement)
}
