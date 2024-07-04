import { AnyFn, hasProperty, isArray, isFunction, shrinkFn } from "@edsolater/fnkit"
import { JSXElement } from "solid-js"
import { KitProps } from "../../createKit/KitProps"
import { ValidController } from "../typeTools"

export function loadPropsControllerRef<Controller extends ValidController | unknown>(
  props: Partial<KitProps<{ controllerRef?: (getController: Controller) => void }>>,
  providedController: Controller,
) {
  if (hasProperty(props, "controllerRef")) {
    props.controllerRef?.(providedController)
  }
}

/** for solidjs's raw JSXElement is just a function */
export function parsePivChildren<
  P extends unknown | ((controller: Controller) => unknown),
  Controller extends ValidController | unknown,
>(originalChildren: P, controller: Controller = {} as Controller): JSXElement {
  return isArray(originalChildren)
    ? originalChildren.map((i) => parsePivChildren(i, controller))
    : isCustomizedFunctionalChildren(originalChildren)
      ? originalChildren(controller)
      : originalChildren
}

/**
 * solid children is normal children, so must have a judger function to distingrish normal function and solidjs children function
 * @param node children
 * @returns
 */
function isCustomizedFunctionalChildren(node: unknown): node is AnyFn {
  return isFunction(node) && !node.name.includes("readSignal" /*  learn by window console.log */)
}

export function shrinkPivChildren(fn: any, params?: any[]) {
  return isCustomizedFunctionalChildren(fn) ? shrinkFn(fn, params as any) : fn
}
