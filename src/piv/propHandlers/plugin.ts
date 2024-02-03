import { AnyObj, isFunction, overwriteFunctionName } from '@edsolater/fnkit'
import { Accessor } from 'solid-js'
import { ConfigableFunction, createConfigableFunction } from '../../fnkit/configableFunction'
import { KitProps } from '../../createKit/KitProps'
import { Accessify } from '../../utils'
import { ValidController, ValidProps } from '../typeTools'
import { PivProps } from '../Piv'

export type GetPluginParams<T> =
  T extends Plugin<infer Px1>
    ? Px1
    : T extends Plugin<infer Px1>[]
      ? Px1
      : T extends (Plugin<infer Px1> | Plugin<infer Px2>)[]
        ? Px1 & Px2
        : T extends (Plugin<infer Px1> | Plugin<infer Px2> | Plugin<infer Px3>)[]
          ? Px1 & Px2 & Px3
          : T extends (Plugin<infer Px1> | Plugin<infer Px2> | Plugin<infer Px3> | Plugin<infer Px4>)[]
            ? Px1 & Px2 & Px3 & Px4
            : T extends (
                  | Plugin<infer Px1>
                  | Plugin<infer Px2>
                  | Plugin<infer Px3>
                  | Plugin<infer Px4>
                  | Plugin<infer Px5>
                )[]
              ? Px1 & Px2 & Px3 & Px4 & Px5
              : unknown

export type Plugin<
  PluginOptions extends Record<string, any> = any,
  PluginState extends Record<string, any> = any,
  T extends ValidProps = any,
  C extends ValidController = ValidController,
> = PluginObj<PluginOptions, PluginState, T, C> | PluginCoreFn<T, C>

export type PluginObj<
  PluginOptions extends Record<string, any>,
  PluginState extends Record<string, any> = any,
  T extends ValidProps = any,
  C extends ValidController = ValidController,
> = ConfigableFunction<{
  (options?: PluginOptions): { plugin: PluginCoreFn<T, C>; state: PluginState }
  [isPluginObjSymbol]: true
  priority?: number
  pluginName?: string
}>

/** a function that return additional props */
export type PluginCoreFn<T extends ValidProps = any, C extends ValidController = ValidController> = (
  props: T,
  utils: {
    /** only in component has controller, or will be an empty object*/
    controller: Accessor<C>
    dom: Accessor<HTMLElement | undefined>
  }
) => Accessify<Partial<KitProps<T, { controller: C }>>> | undefined | void // TODO: should support 'plugin' and 'shadowProps' for easier compose

export const plugin = Symbol('pluginCore')
export const isPluginObjSymbol = Symbol('isPlugin')

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
  }
): PluginObj<PluginOptions, PluginState, Props, Controller> {
  const pluginCoreFn = createConfigableFunction((params: PluginOptions) => {
    const mayPluginCore = createrFn(params)
    const renamedMayPluginCore =
      options?.name && isFunction(mayPluginCore) ? overwriteFunctionName(mayPluginCore, options.name) : mayPluginCore
    if (isFunction(renamedMayPluginCore)) return { plugin: renamedMayPluginCore, state: {} }
    return renamedMayPluginCore
  }, options?.defaultOptions)

  Object.assign(pluginCoreFn, { [isPluginObjSymbol]: true })

  // @ts-expect-error no need to check
  return pluginCoreFn
}

export function extractPluginCore<T extends ValidProps, C extends ValidController>(
  plugin: Plugin<any, any, T, C>,
  options?: any
): PluginCoreFn<T, C> {
  const pluginCoreFn = (isPluginObj(plugin) ? plugin(options ?? {}).plugin : plugin) as PluginCoreFn<T, C>
  return pluginCoreFn
}

export function isPluginObj(v: any): v is PluginObj<any> {
  return Reflect.has(v, isPluginObjSymbol)
}
