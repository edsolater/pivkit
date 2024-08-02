import { isPromise, setTimeoutWithSecondes } from "@edsolater/fnkit"
import { type Accessor, createEffect, on } from "solid-js"
import { createLazySignal } from "./createLazySignal"

/**
 * Creates a derived signal from an existing accessor by applying a mapping function.
 *
 * @param oldAccessor - The original accessor.
 * @param mapFn - The mapping function to apply to the original accessor's value.
 * @returns The derived signal.
 * @example
 * const [count] = createSignal(0)
 * const doubled = createDerivate(count, (v) => v * 2)
 */
export function createDerivate<T, W>(oldAccessor: Accessor<T>, mapFn: (v: T) => Promise<W>): Accessor<W | undefined>
export function createDerivate<T, W>(
  oldAccessor: Accessor<T>,
  mapFn: (v: T) => Promise<W>,
  fallbackValue: W,
): Accessor<W>
export function createDerivate<T, W>(oldAccessor: Accessor<T>, mapFn: (v: T) => W): Accessor<W>
export function createDerivate<T, W>(
  oldAccessor: Accessor<T>,
  mapFn: (v: T) => W | Promise<W>,
  fallbackValue?: W,
): Accessor<W> {
  const [signal, setSignal] = createLazySignal<W>((set) => {
    const nv = mapFn(oldAccessor())
    if (isPromise(nv)) {
      nv.then((v) => set(v))
      return fallbackValue as W
    } else {
      return nv
    }
  })
  createEffect(
    on(
      oldAccessor,
      () => {
        const nv = mapFn(oldAccessor())
        if (isPromise(nv)) {
          nv.then((v) => setSignal(() => v))
        } else {
          setSignal(() => nv)
        }
      },
      { defer: true },
    ),
  )
  return signal
}

/**
 * fn atom
 * Returns the logical NOT of a value.
 *
 * @param v - The value to negate.
 * @returns The logical NOT of the value.
 * @example
 * const [isOpen, setIsOpen] = createSignal(false)
 * const isClosed = createDerivate(isOpen, not)
 */
export function not<T>(v: T): boolean {
  return !v
}

/**
 * fn atom
 * return a promise that solved in next macro task
 *
 * @param v
 * @returns
 */
export function resolveInNextMacroTask<T>(v: T): Promise<Awaited<T>> {
  return new Promise<Awaited<T>>((resolve) => {
    setTimeoutWithSecondes(() => {
      resolve(Promise.resolve(v))
    }, 0)
  })
}
