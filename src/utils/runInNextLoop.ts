import { AnyFn, setTimeoutWithSecondes } from "@edsolater/fnkit"

export function runInNextLoop(cb: AnyFn) {
  setTimeoutWithSecondes(cb)
}
