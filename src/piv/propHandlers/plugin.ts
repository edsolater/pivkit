import {
  AnyObj,
  ConfigableFunction,
  createConfigableFunction,
  isFunction,
  overwriteFunctionName,
} from "@edsolater/fnkit"
import { Accessor } from "solid-js"
import { KitProps } from "../../createKit/KitProps"
import { Accessify } from "../../utils"
import { PivProps } from "../Piv"
import { ValidController, ValidProps } from "../typeTools"

export type GetPluginParams<T> =
  T extends Pluginable<infer Px1>
    ? Px1
    : T extends Pluginable<infer Px1>[]
      ? Px1
      : T extends (Pluginable<infer Px1> | Pluginable<infer Px2>)[]
        ? Px1 & Px2
        : T extends (Pluginable<infer Px1> | Pluginable<infer Px2> | Pluginable<infer Px3>)[]
          ? Px1 & Px2 & Px3
          : T extends (Pluginable<infer Px1> | Pluginable<infer Px2> | Pluginable<infer Px3> | Pluginable<infer Px4>)[]
            ? Px1 & Px2 & Px3 & Px4
            : T extends (
                  | Pluginable<infer Px1>
                  | Pluginable<infer Px2>
                  | Pluginable<infer Px3>
                  | Pluginable<infer Px4>
                  | Pluginable<infer Px5>
                )[]
              ? Px1 & Px2 & Px3 & Px4 & Px5
              : unknown

export type Pluginable<
  PluginOptions extends Record<string, any> = any,
  PluginState extends Record<string, any> = any,
  T extends ValidProps = any,
  C extends ValidController = ValidController,
> = Plugin<PluginOptions, PluginState, T, C> | PluginCoreFn<T, C>

export type Plugin<
  PluginOptions extends Record<string, any>,
  PluginState extends Record<string, any> = any,
  T extends ValidProps = any,
  C extends ValidController = any,
> = ConfigableFunction<{
  (options?: PluginOptions): { plugin: PluginCoreFn<T, C>; state: PluginState }
  [isPluginObjStringSymbol]: true
  priority?: number
  pluginName?: string
}>

export type PluginCorePayload<C extends ValidController> = {
  /** only in component has controller, or will be an empty object*/
  controller: Accessor<C>
  dom: Accessor<HTMLElement | undefined>
}

/** a function that return additional props */
export type PluginCoreFn<T extends ValidProps = any, C extends ValidController = ValidController> = (
  props: T,
  utils: PluginCorePayload<C>,
) => Accessify<Partial<KitProps<T, { controller: C }>>> | undefined | void // TODO: should support 'plugin' and 'shadowProps' for easier compose

export const isPluginObjStringSymbol = "$__isPlugin__"

/** plugin can only have one level */
export function createPlugin<
  PluginOptions extends AnyObj,
  PluginState extends Record<string, any> = any,
  Props extends ValidProps = PivProps,
  Controller extends ValidController = ValidController,
>(
  createrFn: (options: PluginOptions) =>
    | {
        plugin: PluginCoreFn<Props, Controller>
        state: PluginState
      }
    | PluginCoreFn<Props, Controller>, // return a function , in this function can exist hooks
  options?: {
    defaultOptions?: Partial<PluginOptions>
    priority?: number // NOTE -1:  it should be render after final prop has determine
    /** Fixme: why not work? */
    name?: string
  },
): Plugin<PluginOptions, PluginState, Props, Controller> {
  const pluginCoreFn = createConfigableFunction((params: PluginOptions) => {
    const mayPluginCore = createrFn(params)
    const renamedMayPluginCore =
      options?.name && isFunction(mayPluginCore) ? overwriteFunctionName(mayPluginCore, options.name) : mayPluginCore
    if (isFunction(renamedMayPluginCore)) return { plugin: renamedMayPluginCore, state: {} }
    return renamedMayPluginCore
  }, options?.defaultOptions)

  Object.assign(pluginCoreFn, { [isPluginObjStringSymbol]: true })

  // @ts-expect-error no need to check
  return pluginCoreFn
}

export function extractPluginCore<T extends ValidProps, C extends ValidController>(
  plugin: Pluginable<any, any, T, C>,
  options?: any,
): { plugin: PluginCoreFn<T, C>; state?: object } {
  const pluginCore = isPluginObj(plugin) ? plugin(options ?? {}) : { plugin: plugin as PluginCoreFn<T, C> }
  return pluginCore
}

export function isPluginObj(v: any): v is Plugin<any> {
  return Reflect.has(v, isPluginObjStringSymbol)
}
