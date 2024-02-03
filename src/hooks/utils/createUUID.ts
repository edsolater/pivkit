let currentIdGen = 1
export type UUID = unknown
export function createUUID(): { id: UUID } {
  const id = currentIdGen++
  return { id }
}
