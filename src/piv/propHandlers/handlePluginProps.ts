import { AnyObj, arrify, hasProperty, MayArray, shakeNil, shrinkFn } from "@edsolater/fnkit"
import { createSignal } from "solid-js"
import { KitProps } from "../../createKit/KitProps"
import { PivProps } from "../Piv"
import { ValidController } from "../typeTools"
import { mergeProps } from "../utils/mergeProps"
import { omitProps } from "../utils/omitProps"
import { extractPluginCore, isPluginObj, Pluginable } from "./plugin"

export const pluginCoreSymbol = Symbol("pluginCore")

// TODO2: not accessify yet
export function handlePluginProps<P extends AnyObj>(
  props: P,
  getPlugin: (props: PivProps) => PivProps["plugin"] = (props) => props.plugin,
  checkHasPluginProps: (props: PivProps) => boolean = (props) => hasProperty(props, "plugin"),
) {
  if (!props) return props
  if (!checkHasPluginProps(props)) return props
  const plugin = getPlugin(props)
  if (!plugin) return omitProps(props, "plugin")
  return getMergePluginReturnedProps(sortPluginByPriority(arrify(plugin)), props)
}

function sortPluginByPriority(plugins: Pluginable<any>[]) {
  function getPluginPriority(plugin: Pluginable<any>) {
    return isPluginObj(plugin) ? plugin.priority ?? 0 : 0
  }
  if (plugins.length <= 1) return plugins
  if (plugins.every((plugin) => getPluginPriority(plugin))) return plugins

  // judge whether need sort
  const firstPriority = getPluginPriority(plugins[0]!)
  const needSort = plugins.some((plugin) => getPluginPriority(plugin) !== firstPriority)

  return needSort
    ? plugins.toSorted((pluginA, pluginB) => getPluginPriority(pluginB) - getPluginPriority(pluginA))
    : plugins
}

/**
 * merge additional props from plugin
 */

function getMergePluginReturnedProps<T extends AnyObj>(
  plugins: MayArray<Pluginable<T> | undefined>,
  props: T & PivProps,
): Omit<T & PivProps, "plugin"> {
  return omitProps(
    plugins ? shakeNil(arrify(plugins)).reduce((acc, plugin) => invokePlugin(plugin, acc), props) : props,
    "plugin",
  )
}

/** core */
function invokePlugin(plugin: Pluginable<any>, props: KitProps<any>) {
  const [controller, setController] = createSignal<ValidController>({})
  const [dom, setDom] = createSignal<HTMLElement>()

  const pluginProps = shrinkFn(extractPluginCore(plugin)(props, { controller, dom }))
  const returnProps = mergeProps(props, pluginProps, { controllerRef: setController, domRef: setDom })
  return returnProps
}
