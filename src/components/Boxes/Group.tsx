import { KitProps, useKitProps } from "../../createKit"
import { Box, BoxProps } from "./Box"

export type GroupProps = BoxProps & {
  /**
   * only display:contents
   * just render nothing
   */
  ghost?: boolean
  name?: string
}

/**
 * just render nothing
 */
export function Group(kitProps: KitProps<GroupProps>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "Group" })
  /* ---------------------------------- props -------------------------------- */
  return <Box class={props.name} shadowProps={shadowProps} icss={props.ghost ? { display: "contents" } : undefined} />
}
