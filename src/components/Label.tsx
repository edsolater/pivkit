import { KitProps, useKitProps } from "../createKit"
import { PivChild } from "../piv/typeTools"
import { Text } from "./Text"

export type LabelProps = {
  value?: string
  render?: (value: string) => PivChild
}

export type LabelKitProps = KitProps<LabelProps>
/**
 * created for form widget component
 *
 * !`<label>` can transpond click/focus event for inner `<Input>`-like Node
 */
export function Label(kitProps: LabelKitProps) {
  const { shadowProps, props } = useKitProps(kitProps, { name: "Label" })
  return <Text class="Label" shadowProps={shadowProps} />
}
