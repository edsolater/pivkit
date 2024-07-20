import { shrinkFn } from "@edsolater/fnkit"
import { createMemo } from "solid-js"
import { type KitProps, useKitProps } from "../createKit"
import { renderHTMLDOM } from "../piv"
import { icssTitle } from "../styles"
import type { Accessify } from "../utils"
import { Text, type TextRawProps } from "./Text"

export type TitleProps = Omit<
  TextRawProps & {
    htmlAs?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  },
  "children"
>

export type TitleKitProps = KitProps<
  TitleProps & {
    children?: Accessify<string | undefined>
  }
>

export function Title(kitProps: TitleKitProps) {
  const { props } = useKitProps(kitProps, { name: "Title", defaultProps: { htmlAs: "h2" } })
  const id = createMemo(() => shrinkFn(props.children) ?? "")
  return (
    <Text
      id={id()}
      defineSelf={(selfProps) => renderHTMLDOM(props.htmlAs, selfProps)}
      shadowProps={props}
      icss={[icssTitle, { marginBottom: "16px" }]}
    >
      {id()}
    </Text>
  )
}
