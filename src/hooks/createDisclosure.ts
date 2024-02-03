import { MayFn, shrinkFn } from '@edsolater/fnkit'
import { Accessor, createEffect, createSignal } from 'solid-js'
import { addDefaultProps } from '../piv'

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
  } = {}
): CreateDisclosureReturn {
  const defaultOptions = { delay: 800 }
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

  const [delayActionId, setDelayActionId] = createSignal<unknown>(0)
  const setIsOn = (...params: any[]) => {
    if (options.locked) return
    //@ts-expect-error temp
    _setIsOn(...params)
  }
  const cancelDelayAction = () => {
    globalThis.clearTimeout(delayActionId() as any)
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

  const open: DisclosureController['open'] = (options) => {
    cancelDelayAction()
    const actionId = globalThis.setTimeout(coreOn, options?.delay ?? opts.delay)
    setDelayActionId(actionId)
  }
  const close: DisclosureController['close'] = (options) => {
    cancelDelayAction()
    const actionId = globalThis.setTimeout(coreOff, options?.delay ?? opts.delay)
    setDelayActionId(actionId)
  }
  const toggle: DisclosureController['toggle'] = (options) => {
    cancelDelayAction()
    const actionId = globalThis.setTimeout(coreToggle, options?.delay ?? opts.delay)
    setDelayActionId(actionId)
  }
  const set: DisclosureController['set'] = (v, options) => {
    cancelDelayAction()
    const actionId = globalThis.setTimeout(() => setIsOn(v), options?.delay ?? opts.delay)
    setDelayActionId(actionId)
  }
  const controller = {
    cancelDelayAction,
    open,
    close,
    toggle,
    set
  }
  return [isOn, controller]
}
