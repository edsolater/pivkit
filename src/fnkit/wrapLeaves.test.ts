import { expect, test } from "vitest"
import { wrapLeaves } from "./wrapLeaves"

test(`wrapLeaves.name() basic usage `, () => {
  const raw = { a: 1, b: { c: 2 } }
  const result = wrapLeaves(raw, { wrap: (leaf) => 2 * leaf })
  expect(result.a).toBe(2)
  expect(result.b.c).toBe(4)
  // should not mutate raw
  expect(result.a).toBe(2)
  // expect(result).not.toBe(raw)
})
