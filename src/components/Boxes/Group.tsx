import { KitProps, useKitProps } from "../../createKit"
import { Box, BoxProps } from "./Box"

export type GroupProps = BoxProps & {
  /** only display:contents */
  displayContents?: boolean
  name?: string
}

/**
 * just render nothing
 */
export function GhostGroup(kitProps: KitProps<GroupProps>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "GhostGroup" })
  const groupIcss = { display: "contents" }
  /* ---------------------------------- props --------------------------------- */
  return <Box class={props.name} shadowProps={shadowProps} icss={groupIcss} />
}

/**
 * just render nothing
 */
export function Group(kitProps: KitProps<GroupProps>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "Group" })
  /* ---------------------------------- props -------------------------------- */
  return (
    <Box
      class={props.name}
      shadowProps={shadowProps}
      icss={props.displayContents ? { display: "contents" } : undefined}
    />
  )
}
