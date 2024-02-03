import { AnyObj, flap, hasProperty, MayArray, shakeNil, shrinkFn } from '@edsolater/fnkit'
import { createSignal } from 'solid-js'
import { KitProps } from '../../createKit/KitProps'
import { PivProps } from '../Piv'
import { ValidController } from '../typeTools'
import { mergeProps } from '../utils/mergeProps'
import { omit } from '../utils/omit'
import { extractPluginCore, isPluginObj, Plugin } from './plugin'

export const pluginCoreSymbol = Symbol('pluginCore')

// TODO2: not accessify yet
export function handlePluginProps<P extends AnyObj>(
  props: P,
  getPlugin: (props: PivProps) => PivProps['plugin'] = (props) => props.plugin,
  checkHasPluginProps: (props: PivProps) => boolean = (props) => hasProperty(props, 'plugin')
) {
  if (!props) return props
  if (!checkHasPluginProps(props)) return props
  const plugin = getPlugin(props)
  if (!plugin) return omit(props, 'plugin')
  return getMergePluginReturnedProps(sortPluginByPriority(flap(plugin)), props)
}

function sortPluginByPriority(plugins: Plugin<any>[]) {
  function getPluginPriority(plugin: Plugin<any>) {
    return isPluginObj(plugin) ? plugin.priority ?? 0 : 0
  }
  if (plugins.length <= 1) return plugins
  if (plugins.every((plugin) => getPluginPriority(plugin))) return plugins

  // judge whether need sort
  let needSort = false
  let firstPriority = getPluginPriority(plugins[0]!)
  for (const plugin of plugins) {
    if (getPluginPriority(plugin) !== firstPriority) {
      needSort = true
      break
    }
  }

  return needSort
    ? plugins.toSorted((pluginA, pluginB) => getPluginPriority(pluginB) - getPluginPriority(pluginA))
    : plugins
}

/**
 * merge additional props from plugin
 */

function getMergePluginReturnedProps<T extends AnyObj>(
  plugins: MayArray<Plugin<T> | undefined>,
  props: T & PivProps
): Omit<T & PivProps, 'plugin'> {
  return omit(
    plugins ? shakeNil(flap(plugins)).reduce((acc, plugin) => invokePlugin(plugin, acc), props) : props,
    'plugin'
  )
}

/** core */
function invokePlugin(plugin: Plugin<any>, props: KitProps<any>) {
  const [controller, setController] = createSignal<ValidController>({})
  const [dom, setDom] = createSignal<HTMLElement>()

  const pluginProps = shrinkFn(extractPluginCore(plugin)(props, { controller, dom }))
  const returnProps = mergeProps(props, pluginProps, { controllerRef: setController, domRef: setDom })
  return returnProps
}
