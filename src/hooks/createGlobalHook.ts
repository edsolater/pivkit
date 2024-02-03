import { createRoot } from 'solid-js'
import { tryOnCleanup } from './utils/tryOnCleanup'

/**
 * @see https://solidjs-use.github.io/solidjs-use/shared/createSharedComposable
 * Make a composable function usable with multiple SolidJS component instances.
 * @example
 * import { createSharedComposable, useCounter } from 'solidjs-use'
 *
 * const useSharedCounter = createSharedComposable(useCounter)
 *
 * // CompA.tsx
 * const { count, inc, dec } = useSharedCounter()
 *
 * // CompB.tsx - will reuse the previous state and no new event listeners will be registered
 * const { count, inc, dec } = useSharedCounter()
 */
export function createGlobalHook<Fn extends (...args: any[]) => any>(
  composable: Fn,
  options?: { cacheStateWithoutClean?: boolean }
): Fn {
  let subscribers = 0
  let state: ReturnType<Fn> | undefined
  let disposer: () => void | undefined

  const dispose = () => {
    subscribers -= 1
    if (disposer && subscribers <= 0) {
      disposer()
      if (!options?.cacheStateWithoutClean) {
        state = undefined
      }
    }
  }

  return ((...args) => {
    subscribers += 1
    if (!state) {
      createRoot((_disposer) => {
        disposer = _disposer
        state = composable(...args)
      })
    }
    tryOnCleanup(dispose)
    return state
  }) as Fn
}

export function createCachedGlobalHook<Fn extends (...args: any[]) => any>(composable: Fn): Fn {
  return createGlobalHook(composable, { cacheStateWithoutClean: true })
}
