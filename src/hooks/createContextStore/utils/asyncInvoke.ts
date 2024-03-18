import { AnyFn, WeakerMap } from "@edsolater/fnkit"

// hold fn in map, so can cover if input the same key
const queueTask = new WeakerMap<any, AnyFn>()

/**
 * invoke function in micro task queue
 *
 * **same** task will only invoke **once**
 * @param fn task
 * @param options
 * @returns
 */
export async function asyncInvoke<T>(
  fn: () => T,
  options?: {
    /**
     * same key tasks will only invoke once in one event loop
     * by default, it is the function itself
     */
    key?: unknown
  },
): Promise<T> {
  const key = options?.key ?? fn
  queueTask.set(key, fn)
  await Promise.resolve()
  const cb = queueTask.get(key)
  queueTask.delete(key)
  return cb?.()
}
