import { AnyFn, hasProperty, isArray, isFunction, shrinkFn } from '@edsolater/fnkit'
import { KitProps } from '../../createKit/KitProps'
import { ValidController } from '../typeTools'
import { JSXElement } from 'solid-js'

export function loadPropsControllerRef<Controller extends ValidController | unknown>(
  props: Partial<KitProps<{ controllerRef?: (getController: Controller) => void }>>,
  providedController: Controller
) {
  if (hasProperty(props, 'controllerRef')) {
    props.controllerRef?.(providedController)
  }
}

export function parsePivChildren<
  P extends unknown | ((controller: Controller) => unknown),
  Controller extends ValidController | unknown,
>(originalChildren: P, controller: Controller = {} as Controller): JSXElement {
  return isArray(originalChildren)
    ? originalChildren.map((i) => parsePivChildren(i, controller))
    : isNormalControllerChildren(originalChildren)
      ? originalChildren(controller)
      : originalChildren
}

/**
 * solid children is normal children, so must have a judger function to distingrish normal function and solidjs children function
 * @param node children
 * @returns
 */
function isNormalControllerChildren(node: unknown): node is AnyFn {
  return isFunction(node) && !node.name.includes('readSignal' /*  learn by window console.log */)
}
