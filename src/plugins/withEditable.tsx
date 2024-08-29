import { type Accessor, type JSXElement } from "solid-js"
import { PluginWrapper } from "../components"
import { type KitProps, useKitProps } from "../createKit"
import { createDomRef, createSyncSignal } from "../hooks"
import { createPlugin, type PivProps, type Plugin } from "../piv"
import { cssOpacity } from "../styles"

export type EditablePluginController = {
  isEnabled: Accessor<boolean>
}

export type EditablePluginOptions = {
  /** for debug */
  $debug?: string
  /**
   * directly can type , or only type when js callback was trigger.
   * usually, u should pass a accessor as a signal
   **/
  isEnabled?: boolean
  /** with onEnabledChange, it will be a two-way binding */
  onEnabledChange?: (isEnabled: boolean) => void
  /** when innerText is empty. placeholderText will always has .4 opacity */
  placeholder?: string
  onInput?: (newText: string) => void
  onEnter?: (newText: string) => void
  /**
   * use click outside
   * @default true
   */
  endEditWhenClickOutside?: boolean
  /**
   * start edit when click
   * @default true
   */
  startEditWhenClick?: boolean
  /**
   * use more strightforward enter to
   * @default true
   */
  okWhenTypeEnter?: boolean
  /** init cursor position
   * @default "end"
   */
  initEditCursorPlacement?: "start" | "end"
}

export type EditablePluginKitOptions = KitProps<EditablePluginOptions>

//TODO: contenteditable should also be a buildin plugin in `<Text />`
/** special plugin */
export const withEditable: Plugin<EditablePluginKitOptions, EditablePluginController> = createPlugin((kitOptions) => {
  const { props: options } = useKitProps(kitOptions, {
    defaultProps: {
      startEditWhenClick: true,
      endEditWhenClickOutside: true,
      okWhenTypeEnter: true,
      initEditCursorPlacement: "end",
    },
  })
  const { dom: selfDom, setDom: setSelfDom } = createDomRef()

  const [isEnabled, setIsEnabled] = createSyncSignal({
    value: () => Boolean(options.isEnabled),
    onSet(value) {
      options.onEnabledChange?.(value)
    },
  })

  return {
    plugin: () =>
      ({
        domRef: (el) => {
          if (options.$debug) {
            console.log("el: ", el, options.$debug)
          }
          return setSelfDom(el)
        },
        htmlProps: {
          "data-placeholder": options.placeholder,
        },
        icss: () => ({
          "&:empty": {
            color: cssOpacity("currentColor", 0.4),
            "&::before": {
              content: "attr(data-placeholder)",
            },
          },
        }),
      }) as PivProps,
    state: { isEnabled },
  }
})

/** component version of {@link withEditable} */
export function EditablePluginWrapper(
  rawProps: Omit<EditablePluginKitOptions, "children"> & {
    children?: (state: EditablePluginController) => JSXElement
  },
) {
  return (
    <PluginWrapper plugin={withEditable} isEnabled={rawProps.isEnabled} onInput={rawProps.onInput}>
      {rawProps.children}
    </PluginWrapper>
  )
}

function isDomNodeTextNode(node: Node): node is Text {
  return node.nodeType === Node.TEXT_NODE
}

/**
 * document has cursor
 */
function hasCursor() {
  const selection = window.getSelection()
  if (!selection) return false
  return selection.rangeCount > 0
}
