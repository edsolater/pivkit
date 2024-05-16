import { MayFn, hasProperty, isNumber, shrinkFn } from "@edsolater/fnkit"
import { Accessor, createEffect, createMemo, createSignal, on } from "solid-js"
import { addDefaultProps } from "../piv"

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
  initValue: MayFn<boolean> = false,
  options: {
    locked?: boolean
    /**only affact delay-* and canelDelayAction */
    delay?: number
    /* usually it is for debug */
    onClose?(): void
    /* usually it is for debug */
    onOpen?(): void
    /* usually it is for debug */
    onToggle?(isOn: boolean): void
  } = {},
): CreateDisclosureReturn {
  const defaultOptions = { delay: 24 }
  const opts = addDefaultProps(options, defaultOptions)
  const defaultOn = createMemo(() => Boolean(shrinkFn(initValue)))
  const [isOn, _setIsOn] = createSignal(defaultOn())

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

  let delayActionId: any = 0
  const setIsOn = (...params: any[]) => {
    if (options.locked) return
    //@ts-expect-error temp
    _setIsOn(...params)
  }
  const cancelDelayAction = () => {
    globalThis.clearTimeout(delayActionId)
  }
  const coreOn = () => {
    cancelDelayAction()
    setIsOn(true)
    opts.onOpen?.()
  }
  const coreOff = () => {
    cancelDelayAction()
    setIsOn(false)
    opts.onClose?.()
  }
  const coreToggle = () => {
    cancelDelayAction()
    setIsOn((b: any) => {
      if (b) opts.onClose?.()
      if (!b) opts.onOpen?.()
      return !b
    })
    opts.onToggle?.(isOn())
  }

  const open: DisclosureController["open"] = (options) => {
    if (hasProperty(opts, "delay") || hasProperty(options, "delay")) {
      delayActionId = globalThis.setTimeout(coreOn, options?.delay ?? opts.delay)
    } else {
      coreOn()
    }
    return { cancel: cancelDelayAction }
  }
  const close: DisclosureController["close"] = (options) => {
    if (hasProperty(opts, "delay") || hasProperty(options, "delay")) {
      delayActionId = globalThis.setTimeout(coreOff, options?.delay ?? opts.delay)
    } else {
      coreOff()
    }
    return { cancel: cancelDelayAction }
  }
  const toggle: DisclosureController["toggle"] = (options) => {
    if (hasProperty(opts, "delay") || hasProperty(options, "delay")) {
      delayActionId = globalThis.setTimeout(coreToggle, options?.delay ?? opts.delay)
    } else {
      coreToggle()
    }
    return { cancel: cancelDelayAction }
  }
  const set: DisclosureController["set"] = (v, options) => {
    if (hasProperty(opts, "delay") || hasProperty(options, "delay")) {
      delayActionId = globalThis.setTimeout(() => setIsOn(v), options?.delay ?? opts.delay)
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
