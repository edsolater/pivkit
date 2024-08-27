import { isFunction, shrinkFn } from "@edsolater/fnkit"
import { type Accessor, createEffect, on } from "solid-js"
import { createLazySignal } from "."

/**
 * a hook utils to enabled and disabled
 */
export function createEnableValidator(options: {
  enabled?: boolean | Accessor<boolean>
  disabled?: boolean | Accessor<boolean>
}): Accessor<boolean> {
  const [enabled, setEnabled] = createLazySignal(() => getValid())

  function getValid() {
    const enabled = shrinkFn(options?.enabled)
    const disabled = shrinkFn(options?.disabled)
    const isEnabled = enabled != null ? enabled : !disabled
    return isEnabled
  }

  const totalAccessor = (() => {
    const bucket = [] as Accessor<any>[]
    if (isFunction(options.enabled)) bucket.push(options.enabled)
    if (isFunction(options.disabled)) bucket.push(options.disabled)
    return bucket
  })()

  createEffect(
    on(
      totalAccessor,
      () => {
        setEnabled(getValid())
      },
      { defer: true },
    ),
  )
  return enabled
}
