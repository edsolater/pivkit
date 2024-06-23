let currentIdGen = 1
export type UUID = unknown
/** not a hook, just a JS function  */
export function createUUID(): UUID {
  const id = currentIdGen++
  return id
}
