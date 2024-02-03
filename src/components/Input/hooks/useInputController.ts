import { useControllerByID } from '../../../piv'
import { InputController } from '../Input'

/** a shortcut of {@link useControllerByID} with correct type */

export function useInputController(name: string) {
  const controller = useControllerByID<InputController>(name)
  return controller
}
