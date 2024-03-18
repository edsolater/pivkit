import { KitProps, useKitProps } from "../../createKit"
import { Piv } from "../../piv"

export type BoxProps = {}

export type BoxKitProps = KitProps<BoxProps>

/**
 * if for layout , don't render important content in Box
 */
export function Box(rawProps: BoxKitProps) {
  const { shadowProps } = useKitProps(rawProps, { name: "Box" })
  /* ---------------------------------- props --------------------------------- */
  return <Piv shadowProps={shadowProps} />
}
