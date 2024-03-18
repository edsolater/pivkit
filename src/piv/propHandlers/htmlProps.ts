import { MayArray, flapDeep, isArray, shakeNil } from "@edsolater/fnkit"
import { JSX } from "solid-js"
import { objectMerge } from "../../fnkit"
import { HTMLTag } from "../typeTools"

export type HTMLProps<TagName extends HTMLTag = HTMLTag> = MayArray<JSX.IntrinsicElements[TagName] | undefined>

/**
 * htmlProps can't have controller, because if this props be a function. there is no way to detect which props it will finnaly use
 */
export function parseHTMLProps(htmlProps: HTMLProps) {
  if (!htmlProps) return undefined
  return objectMerge(...shakeNil(flapDeep(htmlProps)))
}

/**
 *
 * detect it related HTML attribute key
 * @todo has shadow props
 */
export function getHTMLPropsKeys(htmlProps: HTMLProps): string[] {
  if (!htmlProps) return []
  return isArray(htmlProps)
    ? htmlProps.map((i) => (i ? Object.getOwnPropertyNames(i) : [])).flat()
    : Object.getOwnPropertyNames(htmlProps)
}
