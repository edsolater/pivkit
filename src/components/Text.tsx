import { cacheFn, isString } from "@edsolater/fnkit"
import { createEffect, createMemo, createSignal, on } from "solid-js"
import { KitProps, useKitProps } from "../createKit"
import { Piv, parseICSSToClassName, type CSSObject } from "../piv"

export interface TextRawProps {
  block?: boolean

  /** use flexbox; align-items */
  centerY?: boolean
  /** use flexbox; justify-items */
  centerX?: boolean
  /** use flexbox; justify-items + align-items */
  center?: boolean

  /** if true, it is 'text'
   * @deprecated
   */
  editable?: boolean | "text" | "all"
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

  const contentEditableValue = createMemo(() =>
    props.editable != null
      ? props.editable
        ? props.editable === "text" || props.editable === true
          ? "plaintext-only"
          : "true"
        : "false"
      : undefined,
  )

  const icss = createMemo(() => {
    const icssRules = {} as CSSObject
    if (props.block) {
      icssRules.display ??= "inline-block"
    }
    if (props.centerX || props.center) {
      icssRules.display ??= "flex"
      icssRules.justifyContent ??= "center"
    }
    if (props.centerY || props.center) {
      icssRules.display ??= "flex"
      icssRules.alignItems ??= "center"
    }
    return Object.keys(icssRules).length > 0 ? icssRules : undefined
  })

  return (
    <Piv
      shadowProps={shadowProps}
      icss={[icss(), defaultTextICSS]}
      // @ts-ignore no need this check
      htmlProps={{
        contentEditable: contentEditableValue(),
      }}
    >
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
