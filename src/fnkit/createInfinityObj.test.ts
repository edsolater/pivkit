import { expect, test } from "vitest"
import { createTreeableInfinityNode } from "./createInfinityObj"

test("basic usage", () => {
  const obj = createTreeableInfinityNode()

  obj.a.b = 3
  expect(obj.a.b, "InfiniteNode is a place to store node content").toBe(3)
  expect(obj.a.b, "even `obj.a` is still exist `obj.a.b` can still be setted").toBe(3)

  const targetValue = {}
  obj.b.d.e = targetValue
  expect(obj.b.d.e, "node content can be object").toBe(targetValue)
})
