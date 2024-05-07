import { pipeDo } from "@edsolater/fnkit"
import { PivProps } from "../Piv"
import { handlePluginProps } from "./handlePluginProps"
import { handleShadowProps } from "./shadowProps"


export function recursivelyPluginPropsAndShadowProps<P extends Partial<PivProps<any>>>(
  props: P,
): Omit<P, "shadowProps" | "plugin"> {
  return pipeDo(props, handleShadowProps, handlePluginProps, handleShadowProps) as Omit<P, "shadowProps" | "plugin">
}
