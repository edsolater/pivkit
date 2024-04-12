import { createMemo } from "solid-js"
import { KitProps, useKitProps } from "../createKit"
import { Piv, type CSSObject } from "../piv"

export interface TextRawProps {
  inline?: boolean

  /** use flexbox; align-items */
  centerY?: boolean
  /** use flexbox; justify-items */
  centerX?: boolean
  /** use flexbox; justify-items + align-items */
  center?: boolean

  /** if true, it is 'text' */
  editable?: boolean | "text" | "all"
  /**
   *  all widgets should have `props:v`, to handle it's duty's property \
   *  you should directily use `props.children` if possiable, this prop is for batch processing
   */
  value?: string | number
}

export type TextProps = KitProps<TextRawProps>

/**
 * @componentType widget
 * if for layout , inner content should only be text
 */
export function Text(kitProps: TextProps) {
  const { props } = useKitProps(kitProps, { name: "Text" })

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
    if (props.inline) {
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
      icss={icss()}
      // @ts-ignore no need this check
      htmlProps={{
        contentEditable: contentEditableValue(),
      }}
      shadowProps={props}
    >
      {kitProps.children}
    </Piv>
  )
}
