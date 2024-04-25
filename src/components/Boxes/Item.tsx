import { KitProps, useKitProps } from "../../createKit"
import { Box, BoxProps } from "./Box"

export type ItemProps = BoxProps & {
  name: string
}

export type ItemKitProps = KitProps<ItemProps>

/**
 * for direct sub component of `<GridBox>`
 */
export function Item(rawProps: ItemKitProps) {
  const { shadowProps, props } = useKitProps(rawProps, { name: "Item" })
  return <Box class={props.name} shadowProps={shadowProps} />
}
