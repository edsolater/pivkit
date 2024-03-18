import { JSXElement } from "solid-js"
import { KitProps, useKitProps } from "../createKit"
import { Piv } from "../piv"
export type Temp = any
type LayoutPreset = Temp

export interface LayoutBoxProps {
  in?: LayoutPreset
}

export type LayoutBoxKitProps = KitProps<LayoutBoxProps>

/**
 * Render a Box for layout
 */
export function LayoutBox(rawProps: LayoutBoxKitProps) {
  const { props } = useKitProps(rawProps, { name: "LayoutBox" })
  /* ---------------------------------- props --------------------------------- */
  return (
    <Piv shadowProps={props} icss={{ display: "flex", alignItems: "center" }}>
      {/* TODO: porps.children should be normal  */}
      <>{props.children}</>
    </Piv>
  )
}
