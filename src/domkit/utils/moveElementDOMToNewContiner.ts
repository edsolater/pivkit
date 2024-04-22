export function moveElementDOMToNewContiner({ dragElement, container }: { dragElement: HTMLElement; container: HTMLElement; }) {
  dragElement.remove();
  container.appendChild(dragElement);
}
