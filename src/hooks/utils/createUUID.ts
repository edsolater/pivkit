import type { ID } from "@edsolater/fnkit"

let currentIdGen = 1
/** not a hook, just a JS function  */
export function createUUID(): ID {
  const id = currentIdGen++
  return id
}
