import { AnyFn } from '@edsolater/fnkit'

export function runInNextLoop(cb: AnyFn) {
  setTimeout(cb)
}
