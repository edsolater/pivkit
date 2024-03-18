import { Box } from ".."
import { KitProps, useKitProps } from "../createKit"

export interface ListContainerBoxProps {
  dir?: "x" | "y"
}

export interface ListContainerBoxController {}

export type DefaultListContainerBoxProps = typeof defaultProps

const defaultProps = {
  dir: "y",
} as const satisfies Partial<ListContainerBoxProps>

export type ListContainerBoxKitProps = KitProps<ListContainerBoxProps, ListContainerBoxController>

/**
 * box for list
 * @deprecated , just use {@link List}
 */
export function ListContainerBox(kitProps: ListContainerBoxKitProps) {
  const { props, lazyLoadController } = useKitProps(kitProps, { defaultProps, name: "ListContainerBox" })
  return (
    <Box
      shadowProps={props}
      icss={[
        props.dir === "x" ? { overflowY: "hidden", overflowX: "scroll" } : { overflowY: "scroll", overflowX: "hidden" },
      ]}
    >
      {props.children}
    </Box>
  )
}
