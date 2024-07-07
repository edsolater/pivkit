import type { JSXElement } from "solid-js"
import { AddProps, type Plugin } from "../piv"
import { usePlugin } from "../plugins"
import { omit } from "@edsolater/fnkit"

/** componentify the plugin to a more readable component */
export function PluginWrapper<O extends object, S extends object>(
  props: {
    plugin: Plugin<O, S>
    children?: (state: S) => JSXElement
  } & Omit<NoInfer<O>, "children">,
): JSXElement {
  const [pluginModule, state] = usePlugin(props.plugin, omit(props, ["plugin", "children"]) as O)
  return <AddProps plugin={pluginModule}>{props.children?.(state)}</AddProps>
}
