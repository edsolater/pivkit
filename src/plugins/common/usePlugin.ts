import type { Plugin, PluginCoreFn, ValidController, ValidProps } from "../../piv"

export function usePlugin<
  PluginOptions extends Record<string, any>,
  PluginState extends Record<string, any> = any,
  T extends ValidProps = any,
  C extends ValidController = any,
>(
  plugin: Plugin<PluginOptions, PluginState, T, C>,
  options?: PluginOptions,
): [pluginModule: PluginCoreFn<T, C>, pluginState: PluginState] {
  const { plugin: pluginModule, state: pluginState } = plugin(options)
  return [pluginModule, pluginState]
}
