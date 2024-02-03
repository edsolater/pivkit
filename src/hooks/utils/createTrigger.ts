import { AnyFn, createEventCenter } from '@edsolater/fnkit'
import { Accessor } from 'solid-js'
import { createSignalWithPlugin } from '../createSignalWithPlugin'
import { UUID, createUUID } from './createUUID'

// global cache
const triggerControllers = new Map<UUID, TriggerController>()

type TriggerController = {
  open(): void
  close(): void
  toggle(): void
  callbackRegisterer: {
    onTriggerOn(cb: () => void): {
      cleanup(): void
    }
    onTriggerOff(cb: () => void): {
      cleanup(): void
    }
    onToggle(cb: () => void): {
      cleanup(): void
    }
  }
  isTriggerOn: () => boolean
}

/**
 * not a solid hook
 *
 * use for Modal / Popover / Drawer like trigger component
 * @param id force id; if not provided, will create a new one
 */
export function createTrigger({
  id = createUUID().id,
  defaultState = false,
  state = defaultState, // TODO: signal plugin should handle this
}: {
  id?: UUID
  defaultState?: boolean | Accessor<boolean>
  state?: boolean | Accessor<boolean> // TODO: signal plugin should handle this
} = {}): TriggerController {
  if (triggerControllers.has(id)) return triggerControllers.get(id)!
  const [isTriggerOn, setIsTriggerOn] = createSignalWithPlugin(defaultState)
  const callbackOnStack = [] as AnyFn[]
  const callbackOffStack = [] as AnyFn[]
  const callbackToggleStack = [] as AnyFn[]

  //TODO: createEventCenter is weird, right?
  const eventCenter = createEventCenter<{
    on(): void
    off(): void
    toggle(): void
  }>()
  eventCenter.registEvents({
    'on': () => {
      setIsTriggerOn(true)
      callbackOnStack.forEach((cb) => cb())
    },
    'off': () => {
      setIsTriggerOn(false)
      callbackOffStack.forEach((cb) => cb())
    },
    'toggle': () => {
      setIsTriggerOn((b) => !b)
      callbackToggleStack.forEach((cb) => cb())
    },
  })

  function turnTriggerOn() {
    eventCenter.emit('on', [])
  }
  function turnTriggerOff() {
    eventCenter.emit('off', [])
  }
  function toggleTrigger() {
    eventCenter.emit('toggle', [])
  }

  const callbackRegisterer = {
    onTriggerOn(cb: AnyFn) {
      callbackOnStack.push(cb)
      return {
        cleanup() {
          callbackOnStack.splice(callbackOnStack.indexOf(cb), 1)
        },
      }
    },
    onTriggerOff(cb: AnyFn) {
      callbackOffStack.push(cb)
      return {
        cleanup() {
          callbackOffStack.splice(callbackOffStack.indexOf(cb), 1)
        },
      }
    },
    onToggle(cb: AnyFn) {
      callbackToggleStack.push(cb)
      return {
        cleanup() {
          callbackToggleStack.splice(callbackToggleStack.indexOf(cb), 1)
        },
      }
    },
  } as TriggerController['callbackRegisterer']

  return { isTriggerOn, callbackRegisterer, close: turnTriggerOff, open: turnTriggerOn, toggle: toggleTrigger }
}
