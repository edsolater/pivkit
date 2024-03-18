import { useKitProps } from "../createKit/useKitProps"
import { KitProps } from "../createKit/KitProps"
import { PivChild, Piv } from "../piv"
import { cssOpacity, cssColorMix, cssCurrentColor } from "../styles"
import { Row } from "./Boxes"

type BadgeType = {
  noOutline?: boolean
  /** default: outline */
  type?: "solid" | "outline"
  /** default 'md' */
  size?: "md" | "sm"
  /** usually, it appear with onClick */
  // hoverChildren?: PivChild
}

export function Badge(kitProps: KitProps<BadgeType>) {
  const { props, shadowProps } = useKitProps(kitProps)
  const defaultSize = props.size ?? "md"
  console.count("badge: ")
  return (
    <Row
      line
      icss={{
        backgroundColor: "transparent",
        "&:hover": {
          backgroundColor: cssOpacity(cssCurrentColor, 0.1),
        },
        transition: "50ms",
        borderRadius: "1rem",
        border: `solid ${cssColorMix(cssCurrentColor, "#5ac4be", 0.5)}`,
        padding: "0.1rem .5rem",
        lineHeight: "1",
      }}
      shadowProps={shadowProps}
    >
      <Piv
        // class={props.hoverChildren ? 'group-hover:opacity-0 transition duration-300' : undefined}
        icss={{ fontSize: ".75em" }}
      >
        {props.children}
      </Piv>
    </Row>
  )
}
