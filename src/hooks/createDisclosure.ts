import { MayFn, hasProperty, setTimeoutWithSecondes, shrinkFn } from "@edsolater/fnkit"
import { Accessor, createEffect, createMemo, createSignal, on } from "solid-js"

interface DisclosureController {
  open(options?: { delay?: number }): {
    /** useful for delay action */
    cancel(): void
  }
  close(options?: { delay?: number }): {
    /** useful for delay action */
    cancel(): void
  }
  toggle(options?: { delay?: number }): {
    /** useful for delay action */
    cancel(): void
  }
  set(
    b: boolean,
    options?: { delay?: number },
  ): {
    /** useful for delay action */
    cancel(): void
  }
  cancelDelayAction(): void
}

export type CreateDisclosureReturn = [Accessor<boolean>, DisclosureController]

/** more piecer than createDisclosure */
export function createDisclosure(
  defaultValue: MayFn<boolean> = false,
  options: {
    locked?: boolean
    useDefaultValueOnlyWhenInit?: boolean

    /**
     * unit: s
     * only affact delay-* and canelDelayAction
     */
    delay?: number
    /* usually it is for debug */
    onClose?(): void
    /* usually it is for debug */
    onOpen?(): void
    /* usually it is for debug */
    onToggle?(isOn: boolean): void
  } = {},
): CreateDisclosureReturn {
  const defaultOn = () => shrinkFn(defaultValue)
  const [isInnerOn, _setIsInnerOn] = createSignal(defaultOn())

  if (!options.useDefaultValueOnlyWhenInit) {
    createEffect(
      on(
        defaultOn,
        (outside) => {
          // accessor will be updated in next micro task, so have to use Promise.resolve() to wait the value change
          Promise.resolve().then(() => {
            if (outside !== isInnerOn()) {
              outside ? coreOn() : coreOff()
            }
          })
        },
        { defer: true },
      ),
    )
  }

  let delayActionId: any = 0
  const setIsOn = (is: boolean | ((b: boolean) => boolean)) => {
    if (options.locked) return

    _setIsInnerOn((b) => {
      const bl = shrinkFn(is, [b])
      if (!bl && b) {
        options.onClose?.()
        options.onToggle?.(false)
      }
      if (bl && !b) {
        options.onOpen?.()
        options.onToggle?.(true)
      }
      return bl
    })
  }
  const cancelDelayAction = () => {
    globalThis.clearTimeout(delayActionId)
  }
  const coreOn = () => {
    cancelDelayAction()
    setIsOn(true)
  }
  const coreOff = () => {
    cancelDelayAction()
    setIsOn(false)
  }
  const coreToggle = () => {
    cancelDelayAction()
    setIsOn((b) => !b)
  }

  const open: DisclosureController["open"] = (innerOptions) => {
    if (hasProperty(options, "delay") || hasProperty(innerOptions, "delay")) {
      const delay = innerOptions?.delay ?? options.delay
      delayActionId = setTimeoutWithSecondes(() => coreOn(), delay)
    } else {
      coreOn()
    }
    return { cancel: cancelDelayAction }
  }
  const close: DisclosureController["close"] = (innerOptions) => {
    if (hasProperty(options, "delay") || hasProperty(innerOptions, "delay")) {
      const delay = innerOptions?.delay ?? options.delay
      delayActionId = setTimeoutWithSecondes(coreOff, delay)
    } else {
      coreOff()
    }
    return { cancel: cancelDelayAction }
  }
  const toggle: DisclosureController["toggle"] = (innerOptions) => {
    if (hasProperty(options, "delay") || hasProperty(innerOptions, "delay")) {
      const delay = innerOptions?.delay ?? options.delay
      delayActionId = setTimeoutWithSecondes(coreToggle, delay)
    } else {
      coreToggle()
    }
    return { cancel: cancelDelayAction }
  }
  const set: DisclosureController["set"] = (v, innerOptions) => {
    if (hasProperty(options, "delay") || hasProperty(innerOptions, "delay")) {
      const delay = innerOptions?.delay ?? options.delay
      delayActionId = setTimeoutWithSecondes(() => setIsOn(v), delay)
    } else {
      setIsOn(v)
    }

    return { cancel: cancelDelayAction }
  }
  const controller = {
    cancelDelayAction,
    open,
    close,
    toggle,
    set,
  }
  return [isInnerOn, controller]
}
