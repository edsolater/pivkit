import { createMemo } from 'solid-js'
import { KitProps, useKitProps } from '../createKit'
import { Piv } from '../piv'

export interface TextRawProps {
  inline?: boolean
  /** if true, it is 'text' */
  editable?: boolean | 'text' | 'all'
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
  const { props } = useKitProps(kitProps, { name: 'Text' })

  const contentEditableValue = createMemo(() =>
    props.editable != null
      ? props.editable
        ? props.editable === 'text' || props.editable === true
          ? 'plaintext-only'
          : 'true'
        : 'false'
      : undefined
  )

  return (
    <Piv
      icss={{
        display: props.inline ? 'inline-block' : undefined,
      }}
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
