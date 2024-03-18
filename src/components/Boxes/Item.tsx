import { KitProps, useKitProps } from "../../createKit"
import { Box, BoxProps } from "./Box"

export type ItemProps = BoxProps

export type ItemKitProps = KitProps<ItemProps>
/**
 * for direct sub component of `<GridBox>`
 * @deprecated no , should use `<Box icss={{gridArea: 'xxx'}} />` instead
 */

export function Item(rawProps: ItemKitProps) {
  const { shadowProps, props } = useKitProps(rawProps, { name: "Item" })
  return <Box shadowProps={shadowProps} />
}
