import { type KitProps, useKitProps } from "../createKit"
import { Box } from "./Boxes"

export type TagProps = {}

export type TagKitProps = KitProps<TagProps>

export function Tag(kitProps: TagKitProps) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "Tag" })
  return (
    <Box shadowProps={shadowProps} style={{ padding: "4rem", background: "gray" }}>
      {props.children}
    </Box>
  )
}
