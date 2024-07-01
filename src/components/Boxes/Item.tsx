import { type KitProps, useKitProps } from "../../createKit"
import { Piv } from "../../piv"
import { type SectionProps } from "./Section"

export type ItemProps = SectionProps & {
  name?: string
}

export type ItemKitProps = KitProps<ItemProps>

/**
 * for direct sub component of `<GridBox>`
 * @deprecated use `<Group>` or `<Section>` instead
 */
export function Item(rawProps: ItemKitProps) {
  const { shadowProps, props } = useKitProps(rawProps, { name: "Item" })
  return <Piv class={props.name} shadowProps={shadowProps} />
}
