import { MayPromise } from "@edsolater/fnkit"
import { JFetchCacheItem, resultCache } from "./jFetchCache"

export type JFetchCoreOptions = RequestInit & {
  /** if still within cache fresh time, use cache. */
  cacheFreshTime?: number
}
const defaultCacheFreshTime = 1000 // 1 second

async function isRequestSuccess(res: MayPromise<Response>) {
  const clonedRes = (await res).clone()
  if (!clonedRes.ok) return false
}

function canJFetchUseCache({ key, cacheFreshDuraction }: { key: string; cacheFreshDuraction?: number }) {
  const hasCached = resultCache.get(key) != null
  const isCacheFresh =
    cacheFreshDuraction != null ? Date.now() - (resultCache.get(key)?.timeStamp ?? 0) < cacheFreshDuraction : true
  return hasCached && isCacheFresh
}

/**
 * same interface as original fetch, but, customized version have cache
 */
export async function jFetchCoreWithCache(input: RequestInfo, options?: JFetchCoreOptions): Promise<string> {
  const key = typeof input === "string" ? input : input.url

  const shouldUseCache = canJFetchUseCache({
    key,
    cacheFreshDuraction: options?.cacheFreshTime ?? defaultCacheFreshTime,
  })

  if (shouldUseCache) return resultCache.get(key)!.rawText

  try {
    const response = fetch(input, options)
    const rawText = response
      .then((r) => {
        if (r.ok) return r.clone()
        else {
          throw new Error("not ok")
        }
      })
      .then((r) => r.text())
      .then((r) => {
        if (resultCache.has(key)) {
          resultCache.get(key)!.ok = true
        }
        return r
      })
      .finally(() => {
        if (resultCache.has(key)) {
          resultCache.get(key)!.timeStamp = Date.now()
        }
      })

    const tempJFetchItem = {
      response,
      rawText,
      timeStamp: Date.now(),
    } satisfies JFetchCacheItem
    resultCache.set(key, tempJFetchItem)

    // error
    if (!(await isRequestSuccess(response))) {
      const jFetchItem = {
        response,
        rawText,
        timeStamp: Date.now(),
      } satisfies JFetchCacheItem
      resultCache.set(key, jFetchItem)
      return canJFetchUseCache({ key }) && resultCache.get(key)!.ok === true ? resultCache.get(key)!.rawText : rawText
    } else {
      const jFetchItem = {
        response,
        rawText,
        timeStamp: Date.now(),
        ok: true,
      } satisfies JFetchCacheItem
      resultCache.set(key, jFetchItem)
      return rawText
    }
  } catch {
    const jFetchItem = {
      rawText: Promise.reject("jFetch failed2"),
      timeStamp: Date.now(),
      ok: false,
    } satisfies JFetchCacheItem
    resultCache.set(key, jFetchItem)
    return Promise.reject("jFetch failed3")
  }
}
