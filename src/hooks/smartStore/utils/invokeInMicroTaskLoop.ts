import { AnyFn, setTimeoutWithSecondes } from "@edsolater/fnkit"
import { PromiseWithInjecters, createPromiseWithInjecters } from "./createPromiseWithInjecters"

const allRegistedTasks = new Map<any, AnyFn>()
const allTaskResult = new WeakMap<AnyFn, PromiseWithInjecters>()
function run() {
  allRegistedTasks.forEach((cb, key) => {
    const calbackResult = cb()
    const promiseWithInjecters = allTaskResult.get(cb)
    if (promiseWithInjecters) {
      promiseWithInjecters.resolve(calbackResult)
    }
    allRegistedTasks.delete(key)
  })
}
/**
 * same function will invoke only once in micro task loop
 * @param cb callback need to invoke in micro task
 * @returns promise of callback result
 */
export function delayDo<F extends AnyFn>(
  cb: F,
  options?: {
    /**
     * any Map key is acceptable
     * default is cb itself
     */
    taskKey?: any

    /** user can detect delay to use setTimeout */
    delayMethod?(task: () => void): void
  },
): Promise<ReturnType<F>> {
  if (!allRegistedTasks.has(cb)) {
    const taskKey = options?.taskKey ?? cb
    allRegistedTasks.set(taskKey, cb)
    allTaskResult.set(cb, createPromiseWithInjecters<ReturnType<F>>())
    ;(options?.delayMethod ?? delayDo_doInMicroLoop)(run)
  }
  return allTaskResult.get(cb)!.promise
}

/**
 * delay method
 */
export function delayDo_doInMicroLoop<T>(task: () => Promise<T> | T): Promise<T> {
  return Promise.resolve().then(() => task())
}

export function delayDo_doInNextFrame<T>(delayTime = 0) {
  return function delayDo_setTimeOut(task: () => Promise<T> | T): Promise<T> {
    return new Promise((resolve, reject) => {
      let timeoutId
      try {
        timeoutId = setTimeoutWithSecondes(() => {
          const result = task()
          resolve(result)
        }, delayTime)
      } catch (err) {
        globalThis.clearTimeout(timeoutId)
        reject(err)
      }
    })
  }
}
