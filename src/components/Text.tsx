import { cacheFn, isString } from "@edsolater/fnkit"
import { createEffect, createMemo, createSignal, on } from "solid-js"
import { KitProps, useKitProps } from "../createKit"
import { Piv, parseICSSToClassName } from "../piv"

export interface TextRawProps {
  /**
   *
   *  all widgets should have `props:v`, to handle it's duty's property \
   *  you should directily use `props.children` if possiable, this prop is for batch processing
   */
  value?: string | number
  // {props.children} is props:value, sometimes you need to set a default value to avoid controlled component (like in editablePlugin, if in controlled mode, the cursor will always be at the end)
  defaultValue?: string | number
}

export type TextProps = KitProps<TextRawProps>

/**
 * @componentType widget
 * if for layout , inner content should only be text
 */
export function Text(kitProps: TextProps) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "Text" })

  const value = createMemo(() =>
    "value" in props ? props.value : "children" in props && isString(props.children) ? props.children : undefined,
  )
  const [innerValue, setInnerValue] = createSignal<string | number | undefined>(value() ?? props.defaultValue)

  createEffect(
    on(
      value,
      () => {
        setInnerValue(value())
      },
      { defer: true },
    ),
  )

  return (
    <Piv shadowProps={shadowProps} icss={defaultTextICSS}>
      {innerValue()}
    </Piv>
  )
}

const defaultTextICSS = cacheFn(() =>
  parseICSSToClassName({
    display: "inline",
    alignContent: "center", // make text vertical center
  }),
)
