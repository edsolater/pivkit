import { MayFn, shrinkFn } from "@edsolater/fnkit"
import { Accessor, createEffect, createSignal } from "solid-js"
import { addDefaultProps } from "../piv"

interface DisclosureController {
  open(options?: { delay?: number }): void
  close(options?: { delay?: number }): void
  toggle(options?: { delay?: number }): void
  set(b: boolean, options?: { delay?: number }): void
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
  const [isOn, _setIsOn] = createSignal(shrinkFn(initValue))

  createEffect(() => {
    const propsOn = shrinkFn(initValue)
    if (propsOn) {
      coreOn()
    } else {
      coreOff()
    }
  })

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
    cancelDelayAction()
    delayActionId = globalThis.setTimeout(coreOn, options?.delay ?? opts.delay)
  }
  const close: DisclosureController["close"] = (options) => {
    cancelDelayAction()
    delayActionId = globalThis.setTimeout(coreOff, options?.delay ?? opts.delay)
  }
  const toggle: DisclosureController["toggle"] = (options) => {
    cancelDelayAction()
    delayActionId = globalThis.setTimeout(coreToggle, options?.delay ?? opts.delay)
  }
  const set: DisclosureController["set"] = (v, options) => {
    cancelDelayAction()
    delayActionId = globalThis.setTimeout(() => setIsOn(v), options?.delay ?? opts.delay)
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
