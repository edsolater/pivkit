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
  const defaultOn = createMemo(() => Boolean(shrinkFn(defaultValue)))
  const [isOn, _setIsOn] = createSignal(defaultOn())

  if (!options.useDefaultValueOnlyWhenInit) {
    createEffect(
      on(
        defaultOn,
        (opened) => {
          if (opened) {
            coreOn()
          } else {
            coreOff()
          }
        },
        { defer: true },
      ),
    )
  }

  let delayActionId: any = 0
  const setIsOn = (is: boolean | ((b: boolean) => boolean)) => {
    if (options.locked) return

    _setIsOn((b) => {
      const bl = shrinkFn(is, [b])
      if (b) options.onOpen?.()
      if (!b) options.onClose?.()
      return bl
    })
  }
  const cancelDelayAction = () => {
    globalThis.clearTimeout(delayActionId)
  }
  const coreOn = () => {
    cancelDelayAction()
    setIsOn(true)
    options.onOpen?.()
  }
  const coreOff = () => {
    cancelDelayAction()
    setIsOn(false)
    options.onClose?.()
  }
  const coreToggle = () => {
    cancelDelayAction()
    setIsOn((b) => !b)
    options.onToggle?.(isOn())
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
  return [isOn, controller]
}
