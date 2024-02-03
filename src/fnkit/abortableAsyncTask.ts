import { Subscribable, createSubscribable } from '@edsolater/fnkit'
import { invoke } from './invoke'

export type AbortableTask<T> = {
  abort(): void
  resultSubscribable: Subscribable<T | undefined>
}

/**
 * make it  possiable to abort inside the progress of task
 * inner use basic subscribable
 */
export function abortableAsyncTask<T>(
  task: (utils: { resolve: (value: T | PromiseLike<T>) => void; aborted: () => boolean }) => void
): AbortableTask<T> {
  let isTaskAborted = false
  const innerResolve: (value: T | PromiseLike<T>) => void = async (asyncValue) => {
    const value = await asyncValue
    if (isTaskAborted) return // case: abort before value promise fulfilled
    taskResultSubscribable.set(value)
  }
  const taskResultSubscribable = createSubscribable<T>()
  const utils = { resolve: innerResolve, aborted: () => isTaskAborted }
  invoke(task, utils)
  return {
    abort: () => {
      isTaskAborted = true
    },
    resultSubscribable: taskResultSubscribable,
  }
}
