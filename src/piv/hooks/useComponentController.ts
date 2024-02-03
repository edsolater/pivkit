import { WeakerMap, createSubscribable } from '@edsolater/fnkit'
import { createEffect, onCleanup } from 'solid-js'
import { ValidController } from '../typeTools'
import { createStore } from 'solid-js/store'
import { createStoreSetter } from '../../hooks/smartStore/utils/setStoreByObject'
import { createSmartStore } from '../../hooks'

const recordedControllers = createSubscribable<WeakerMap<string, ValidController | unknown>>()

/**
 * only use it in {@link useKitProps}
 * @param proxyController provide controller
 * @param id id for {@link useControllerByID}
 */
export function registerControllerInCreateKit(
  proxyController: ValidController | unknown | undefined,
  id: string | undefined
) {
  if (!proxyController) return
  if (!id) return
  createEffect(() => {
    recordController(id, proxyController)
    onCleanup(() => {
      unregisterController(id)
    })
  })
}

export function recordController<Controller extends ValidController | unknown>(
  id: string,
  proxyController: Controller
) {
  recordedControllers.set((m) => (m ?? new WeakerMap()).set(id, proxyController))
}

export function unregisterController(id?: string) {
  if (!id) return
  const records = recordedControllers()
  if (!records) return
  recordedControllers.set((recoder) => {
    recoder?.delete(id)
    return recoder
  })
}

/**
 * **Hook:** get target component's controller
 * @param componentID component id
 */
export function useControllerByID<Controller extends ValidController | unknown>(componentID: string) {
  let recordController: Controller | undefined = undefined
  const { store: controller, setStore: setController } = createSmartStore<Partial<Controller>>({})
  recordedControllers.subscribe((records) => {
    const newController = records?.get(componentID) as Controller | undefined
    if (newController && newController !== recordController) {
      recordController = newController
      try {
        setController(newController)
      } catch (error) {
        console.error('use controller set controller error', error, '| controller: ', newController)
      }
    }
  })
  return controller as Partial<Controller>
}
