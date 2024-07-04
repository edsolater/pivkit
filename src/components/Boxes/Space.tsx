import { useKitProps } from "../../createKit/useKitProps"
import { KitProps } from "../../createKit/KitProps"
import { Piv } from "../../piv"

export interface SpaceProps {}

/**
 * for flex/grid wrapper
 */
export function Space(kitProps: KitProps<SpaceProps>) {
  const { shadowProps, props } = useKitProps(kitProps, { name: "Space" })
  /* ---------------------------------- props --------------------------------- */
  return <Piv icss={{ flex: 1 }} shadowProps={shadowProps} />
}
