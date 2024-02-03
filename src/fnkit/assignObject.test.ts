import { createSubscribable, isSubscribable } from '@edsolater/fnkit'
import { expect, test } from 'vitest'
import { assignObjectWithConfigs } from './assignObject'

test('basic usage', () => {
  const obj = { a: 'a', b: 'b' }
  assignObjectWithConfigs(obj, { a: 'hello', b: 'world' })
  expect(obj.a).toBe('hello')

  const obj2 = { a: createSubscribable(0) }
  assignObjectWithConfigs(obj2, { a: 2 }, ({ originalValueDescriptor, patchValueDescriptor }) => {
    const originalValue = originalValueDescriptor?.value
    const patchValue = patchValueDescriptor?.value
    if (isSubscribable(originalValue)) {
      originalValue.set(patchValue)
    }
  })
  expect(obj2.a()).toBe(2)
})
