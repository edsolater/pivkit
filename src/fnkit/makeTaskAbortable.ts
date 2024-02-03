import { assert } from '@edsolater/fnkit'

/**
 * result will be undefined if aborted
 * @param task task action
 * @returns
 */
export function makeTaskAbortable<T>(task: (canContinue: () => boolean) => T | Promise<T>): {
  abort(): void
  hasAborted(): boolean
  hasFinished(): boolean
  assertNotAborted(): void
  result: Promise<Awaited<T | undefined>>
} {
  let hasAbort = false
  const hasAborted = () => hasAbort
  const canContinue = () => !hasAbort
  const abort = () => {
    hasAbort = true
  }
  let finished = false
  const hasFinished = () => finished
  const result = Promise.resolve(task(canContinue)).then(
    (r) => {
      finished = true
      if (hasAbort) {
        throw new Error('input task aborted')
      }
      return r
    },
    () => {
      hasAbort = true
    }
  ) as Promise<Awaited<T | undefined>> // typescript v4.8.3 isn't very cleaver
  return { abort, result, hasFinished, hasAborted, assertNotAborted: () => assert(!hasAbort, 'has aborted') }
}
