import { MayPromise, assert, isObject } from '@edsolater/fnkit'

type TaskPayload = any
type TaskResult = any
type TaskHandler<Payload extends TaskPayload = TaskPayload, Result extends TaskResult = TaskResult> = (
  payloads: Set<Payload>
) => MayPromise<Map<Payload, Result>>

const _taskPayloadQueue = new WeakMap<TaskHandler, Set<TaskPayload>>()
const _taskResultPromiseHandler = new WeakMap<
  TaskPayload,
  { resolve: (resolve: TaskResult) => void; reject: (reason?: unknown) => void }
>()
const _taskHandlersTimoutids = new WeakMap<TaskHandler, ReturnType<typeof setTimeout>>()

/**
 * it is for batch multi single tasks in to a big one
 * @todo test it !!
 */
export function batchRunTask<Payload extends TaskPayload = TaskPayload, Result extends TaskResult = TaskResult>(
  taskHandler: TaskHandler<Payload, Result>,
  taskPayload: Payload
): Promise<Result> {
  assert(isObject(taskPayload), 'taskPayload must be an object')

  // add To queue
  _taskPayloadQueue.set(taskHandler, new Set(_taskPayloadQueue.get(taskHandler)).add(taskPayload))

  const promiseResult = new Promise((resolve, reject) => {
    _taskResultPromiseHandler.set(taskPayload, { resolve, reject })
  }) as Promise<Result>

  // fulfill result to all relative task promise
  function getResultFromHandlerResult(results: Map<Payload, Result>) {
    const allPayloads = _taskPayloadQueue.get(taskHandler)
    if (!allPayloads) {
      throw new Error('no allPayloads, why?')
    }
    allPayloads.forEach((payload) => {
      const thisResult = results.get(payload)
      const promiseHandlers = _taskResultPromiseHandler.get(taskPayload)
      if (!promiseHandlers) {
        throw new Error('no promiseHandlers, why?')
      } else {
        if (results.has(taskPayload)) {
          promiseHandlers.resolve(thisResult)
        } else {
          promiseHandlers.reject(`opps, fail to load result from fn:${taskHandler.name}`)
        }
      }
    })
    _taskPayloadQueue.delete(taskHandler)
  }
  clearTimeout(_taskHandlersTimoutids.get(taskHandler))
  const newTimeoutid = setTimeout(async () => {
    // run in next event loop
    // function run task
    const payloads = _taskPayloadQueue.get(taskHandler)
    if (payloads?.size) {
      const returnedResult = await taskHandler(payloads)
      getResultFromHandlerResult(returnedResult)
    }
    _taskPayloadQueue.delete(taskHandler)
    _taskHandlersTimoutids.delete(taskHandler)
  }, 0)
  _taskHandlersTimoutids.set(taskHandler, newTimeoutid)

  return promiseResult
}
