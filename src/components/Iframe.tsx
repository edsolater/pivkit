import { KitProps, useKitProps } from "../createKit"
import { Piv } from "../piv"
import { renderHTMLDOM } from "../piv/propHandlers/renderHTMLDOM"
import { addGlobalCSS } from "../utils/cssGlobalStyle"
import { useClassRef } from "../webTools"

export interface IframeProps {
  name?: string
  // /** sx: 12px; sm: 16px; smi: 20px; md: 24px; lg: 32px (default: md) */
  size?: keyof typeof IframeSize
  // variant?: keyof typeof IframeVariant

  src?: string
}

export const IframeSize = {
  full: "full",
  lg: "lg",
  md: "md", // default
  smi: "smi",
  sm: "sm",
  xs: "xs",
}

export const IframeVariant = {}

export const IframeState = {
  broken: "broken",
}

/**
 * if for layout , don't render important content in Box
 * @todo add fallbackSrc
 * @todo fallback
 */
export function Iframe(rawProps: KitProps<IframeProps>) {
  const { props, shadowProps } = useKitProps(rawProps, { name: "Iframe" })
  loadIframeDefaultICSS()

  // ---------------- stateClass sizeClass and variantClass ----------------
  const { setClassRef } = useClassRef(
    Object.assign(
      // {
      //   [IframeState.broken]: () => !shouldRender(),
      // },
      Object.fromEntries(Object.entries(IframeSize).map(([key, sizeClass]) => [sizeClass, () => props.size === key])),
      // Object.fromEntries(
      //   Object.entries(IframeVariant).map(([key, variantClass]) => [variantClass, () => props.variant === key]),
      // ),
    ),
  )

  return (
    <Piv<"iframe">
      domRef={setClassRef}
      defineSelf={(selfProps) => renderHTMLDOM("iframe", selfProps)}
      htmlProps={{ src: props.src, allow: "fullscreen" }}
      shadowProps={shadowProps}
    />
  )
}

let hasLoadIframeDefaultICSS = false
/**
 * use global css to style basic iframe theme
 */
function loadIframeDefaultICSS() {
  if (!hasLoadIframeDefaultICSS) {
    addGlobalCSS(
      `
      @layer kit-theme {
        .Iframe {
          display: block;
          width: 35em;
          height: 20em;
          &.lg {
            width: 50em;
            height: 30em;
          }
        }
      }
    `,
    )
    hasLoadIframeDefaultICSS = true
  }
}
