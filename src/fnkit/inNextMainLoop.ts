/**
 * calculate in the next event loop
 *
 * usually used in **Promise's** `then()` methods
 */
export function inNextMainLoop<T, U>(fn: (result: T) => U): (r: T) => Promise<U extends void ? T : Awaited<U>> {
  return (r) =>
    new Promise((resolve, reject) =>
      setTimeout(() => {
        try {
          const result = fn(r) ?? r
          // @ts-expect-error force
          resolve(result)
        } catch (err) {
          reject(err)
        }
      }, 0)
    )
}
