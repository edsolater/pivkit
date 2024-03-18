import { AnyFn } from "@edsolater/fnkit"
import { getOwner, onCleanup } from "solid-js"

/**
 * Call OnCleanup() if it's inside a component lifecycle, if not, do nothing
 */
export function tryOnCleanup(fn: AnyFn) {
  if (getOwner()) {
    onCleanup(fn)
    return true
  }
  return false
}
