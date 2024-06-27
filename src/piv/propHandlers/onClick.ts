import { AnyFn, flap, mergeObjects, type MayArray } from "@edsolater/fnkit"
import { ValidController } from "../typeTools"
export type OnClickPayloads<C extends ValidController> = C & {
  ev: MouseEvent & {
    currentTarget: HTMLElement
    target: Element
  }
  el: HTMLElement
  isSelf(): boolean
  isBubbled(): boolean
  stopPropagation(): void
  preventDefault(): void
  eventPath(): HTMLElement[]
}

export function parseOnClick(onClick: MayArray<AnyFn | undefined>, controller: ValidController) {
  return (ev: Event) => {
    const param = mergeObjects(controller, {
      ev,
      el: ev.currentTarget,
      isSelf: () => ev.currentTarget === ev.target,
      isBubbled: () => ev.currentTarget !== ev.target,
      stopPropagation: () => ev.stopPropagation(),
      preventDefault: () => ev.preventDefault(),
      eventPath: () => ev.composedPath().filter((el) => el instanceof HTMLElement) as HTMLElement[],
    }) as OnClickPayloads<ValidController>
    return flap(onClick).forEach((fn) => fn?.(param))
  }
}
