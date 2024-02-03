import { AnyFn, createCurrentTimestamp, mergeFunction } from '@edsolater/fnkit'

const defaultDebouneDelay = 400
const defaultThrottleDelay = 400

export interface DebounceOptions {
  /** @default false */
  alwaysCalculateInFirstInvoke?: boolean
  /** @default 400 */
  delay?: number
}

export interface ThrottleOptions {
  /** @default 400 */
  delay?: number
}

/**
 * a period will only invoke fist task
 * @see https://juejin.cn/post/6971431743681200165
 * @param fn original function
 * @returns debounced function (new function)
 */
export function debounce<F extends (...args: any[]) => any>(fn: F, options?: DebounceOptions): PromisifyFunction<F> {
  let hasFirstInvoke = false // (for alwaysCalculateInFirstInvoke)
  const setTimeoutController = empolyOneTimeSetTimeout()
  const promiseController = empolyPromise()

  async function debounced() {
    if (!hasFirstInvoke && options?.alwaysCalculateInFirstInvoke) {
      hasFirstInvoke = true
      return fn()
    }
    setTimeoutController.set(() => {
      try {
        promiseController.resolve(fn())
      } catch {
        promiseController.reject('debounce task failed')
      }
    }, options?.delay ?? defaultDebouneDelay)
    return promiseController.result
  }

  return debounced
}

/**
 * will only invoke once (at last frame) in one period
 * @see https://juejin.cn/post/6971431743681200165
 * @param fn original function
 * @returns throttled function (new function)
 */
export function throttle<F extends (...args: any[]) => any>(fn: F, options?: ThrottleOptions): F {
  const middleParams = [] as Parameters<F>[]
  let currentTimoutId: any | null = null
  let prevDurationTimestamp: number | null = null
  let remainDelayTime = options?.delay ?? defaultThrottleDelay
  let cachedFnResult: ReturnType<F> | undefined = undefined

  const invokeFn = () => {
    const result = fn(...(middleParams.at(-1) ?? []))
    middleParams.length = 0 // clear middleParams
    currentTimoutId = null // clear Timeout Id
    remainDelayTime = options?.delay ?? defaultThrottleDelay // reset remain time
    cachedFnResult = result
    return result
  }
  // @ts-expect-error force
  return async function throttled(...args: Parameters<F>) {
    middleParams.push(args)

    const currentTimestamp = createCurrentTimestamp()

    if (currentTimoutId) {
      globalThis.clearTimeout(currentTimoutId)
      remainDelayTime -= prevDurationTimestamp ? currentTimestamp - prevDurationTimestamp : 0
    }

    if (remainDelayTime <= 0) {
      invokeFn()
    } else {
      currentTimoutId = globalThis.setTimeout(invokeFn, remainDelayTime)
    }

    prevDurationTimestamp = currentTimestamp
  }
}

/** when new task loaded, old task canceled */
function empolyOneTimeSetTimeout<T>() {
  let timerId: NodeJS.Timeout | number
  function clear() {
    globalThis.clearTimeout(timerId)
  }
  function set(fn: AnyFn, delay: number) {
    clear()
    timerId = globalThis.setTimeout(fn, delay)
    return { clear }
  }
  return { set, clear }
}

/** util: to record result iin promise (should not use destructured params) */
function empolyPromise<T = any>(): {
  readonly result: Promise<T>
  resolve(value: T | PromiseLike<T>): Promise<Awaited<T>>
  reject(reason?: any): any
} {
  let resultResolve: AnyFn
  let resultReject: AnyFn
  let resultPromise = getInnerPromise()
  function getInnerPromise() {
    return new Promise<T>((resolve, reject) => {
      resultResolve = resolve
      resultReject = reject
    })
  }

  function createNew() {
    resultPromise = getInnerPromise()
  }

  return {
    get result() {
      return resultPromise
    },
    // @ts-ignore no need to check
    resolve: mergeFunction(resultResolve, createNew),
    //@ts-ignore no need to check
    reject: mergeFunction(resultReject, createNew),
  }
}

function promisedSetTimeout<T>(
  fn: () => T | Promise<T>,
  delay: number
): { timer: Promise<ReturnType<typeof setTimeout>>; result: Promise<Awaited<T>> } {
  let timerPromiseResolve: (value: ReturnType<typeof setTimeout>) => void
  const timer = new Promise<ReturnType<typeof setTimeout>>((resolve, reject) => {
    timerPromiseResolve = resolve
  })
  const result = new Promise<Awaited<T>>((resolve, reject) => {
    const id = globalThis.setTimeout(async () => {
      try {
        const result = await fn()
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }, delay)
    timerPromiseResolve(id)
  })
  return { timer, result }
}

type PromisifyFunction<F extends (...args: any[]) => any> = (...args: Parameters<F>) => Promise<Awaited<ReturnType<F>>>

function promisifyFunctionResult<F extends AnyFn>(fn: F): PromisifyFunction<F> {
  return async (...args) => {
    const result = fn(...args)
    if (result instanceof Promise) {
      return result
    } else {
      return Promise.resolve(result)
    }
  }
}
