import { createEventCenter, type AnyFn, type ID } from "@edsolater/fnkit"
import type { Accessor } from "solid-js"
import { createSignal } from "../createSignal"
import { createUUID } from "./createUUID"

// global cache
const triggerControllers = new Map<ID, TriggerController>()

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
  id = createUUID(),
  defaultState = false,
  state = defaultState, // TODO: signal plugin should handle this
}: {
  id?: ID
  defaultState?: boolean | Accessor<boolean>
  state?: boolean | Accessor<boolean> // TODO: signal plugin should handle this
} = {}): TriggerController {
  if (triggerControllers.has(id)) return triggerControllers.get(id)!
  const [isTriggerOn, setIsTriggerOn] = createSignal(defaultState)
  const callbackOnStack = [] as AnyFn[]
  const callbackOffStack = [] as AnyFn[]
  const callbackToggleStack = [] as AnyFn[]

  //TODO: createEventCenter is weird, right?
  const eventCenter = createEventCenter<{
    on: []
    off: []
    toggle: []
  }>()
  eventCenter.on("on", () => {
    setIsTriggerOn(true)
    callbackOnStack.forEach((cb) => cb())
  })
  eventCenter.on("off", () => {
    setIsTriggerOn(false)
    callbackOffStack.forEach((cb) => cb())
  })
  eventCenter.on("toggle", () => {
    setIsTriggerOn((b) => !b)
    callbackToggleStack.forEach((cb) => cb())
  })

  function turnTriggerOn() {
    eventCenter.emit("on", [])
  }
  function turnTriggerOff() {
    eventCenter.emit("off", [])
  }
  function toggleTrigger() {
    eventCenter.emit("toggle", [])
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
  } as TriggerController["callbackRegisterer"]

  return { isTriggerOn, callbackRegisterer, close: turnTriggerOff, open: turnTriggerOn, toggle: toggleTrigger }
}
