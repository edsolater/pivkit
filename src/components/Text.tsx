import { cacheFn, isString, shrinkFn } from "@edsolater/fnkit"
import { createEffect, createMemo, createSignal, on } from "solid-js"
import { KitProps, useKitProps } from "../createKit"
import { Piv, parseICSSToClassName } from "../piv"
import {
  editablePlugin,
  type EditablePluginOptions,
  type EditablePluginPluginController,
} from "../plugins/textEditablePlugin"

export interface TextProps {
  /**
   *
   *  all widgets should have `props:v`, to handle it's duty's property \
   *  you should directily use `props.children` if possiable, this prop is for batch processing
   */
  value?: string | number
  // {props.children} is props:value, sometimes you need to set a default value to avoid controlled component (like in editablePlugin, if in controlled mode, the cursor will always be at the end)
  defaultValue?: string | number
}

export type TextKitProps = KitProps<TextProps>

/**
 * @componentType widget
 * if for layout , inner content should only be text
 */
export function Text(kitProps: TextKitProps) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "Text" })

  if ("value" in kitProps || "defaultValue" in kitProps) {
    // NOTE: is value and defaultValue in props
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
    // this is debug code!!
    // createEffect(
    //   on(innerValue, () => {
    //     console.log("innerValue(): ", innerValue(), value(), shrinkFn(kitProps.defaultValue))
    //   }),
    // )
    return (
      <Piv shadowProps={shadowProps} icss={defaultTextICSS}>
        {value() ?? innerValue()}
      </Piv>
    )
  } else {
    // NOTE: just use props.children to be faster
    return (
      <Piv shadowProps={shadowProps} icss={defaultTextICSS}>
        {props.children}
      </Piv>
    )
  }
}

const defaultTextICSS = cacheFn(() =>
  parseICSSToClassName({
    display: "inline",
    alignContent: "center", // make text vertical center
  }),
)

/** have build-in editablePlugin to easier use */
export function EditableText(
  props: KitProps<TextProps & EditablePluginOptions, { controller: EditablePluginPluginController }>,
) {
  return <Text {...props} plugin={editablePlugin.config(props)} />
}
