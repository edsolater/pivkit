import { CallbackRef, ValidController } from '../piv'

export function useControllerRef(propsRef: CallbackRef<any> | undefined, componentController: ValidController) {
  propsRef?.(componentController)
}
