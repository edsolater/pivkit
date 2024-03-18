import { AnyFn } from "@edsolater/fnkit"
import { objectMerge } from "../../fnkit"
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

export function parseOnClick(onClick: AnyFn, controller: ValidController) {
  return (ev: Event) =>
    onClick?.(
      objectMerge(controller, {
        ev,
        el: ev.currentTarget,
        isSelf: () => ev.currentTarget === ev.target,
        isBubbled: () => ev.currentTarget !== ev.target,
        stopPropagation: () => ev.stopPropagation(),
        preventDefault: () => ev.preventDefault(),
        eventPath: () => ev.composedPath().filter((el) => el instanceof HTMLElement) as HTMLElement[],
      }) as OnClickPayloads<ValidController>,
    )
}
