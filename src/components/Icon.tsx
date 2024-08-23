import { KitProps, useKitProps } from "../createKit"
import { useClassRef } from "../webTools"
import { Piv } from "../piv"
import { renderHTMLDOM } from "../piv/propHandlers/renderHTMLDOM"
import { cssVar } from "../styles"
import { addGlobalCSS } from "../utils/cssGlobalStyle"

export interface IconProps {
  name?: string
  /** sx: 12px; sm: 16px; smi: 20px; md: 24px; lg: 32px (default: md) */
  size?: keyof typeof IconSize
  variant?: keyof typeof IconVariant

  src?: string
}

export const IconSize = {
  full: "full",
  lg: "lg",
  md: "md", // default
  smi: "smi",
  sm: "sm",
  xs: "xs",
}

export const IconVariant = {
  /**pure, used in text content, set this will change icon width to 1em, and display is inline */
  inline: "inline",
}

export const IconState = {
  broken: "broken",
}

/**
 * if for layout , don't render important content in Box
 * @todo add fallbackSrc
 * @todo fallback
 */
export function Icon(rawProps: KitProps<IconProps>) {
  const { props, shadowProps } = useKitProps(rawProps, { name: "Icon" })
  loadIconDefaultICSS()

  /** if not set src, no need to render wired broken image */
  const shouldRender = () => Boolean(props.src)

  // ---------------- stateClass sizeClass and variantClass ----------------
  const { setClassRef: setStateClassRef } = useClassRef(
    Object.assign(
      {
        [IconState.broken]: () => !shouldRender(),
      },
      Object.fromEntries(Object.entries(IconSize).map(([key, sizeClass]) => [sizeClass, () => props.size === key])),
      Object.fromEntries(
        Object.entries(IconVariant).map(([key, variantClass]) => [variantClass, () => props.variant === key]),
      ),
    ),
  )

  const image = () => (
    <Piv<"img">
      defineSelf={(selfProps) => renderHTMLDOM("img", selfProps)}
      htmlProps={{ alt: props.name, src: props.src }}
      icss={{
        display: "block",
        visibility: shouldRender() ? undefined : "hidden",
        objectFit: "cover",
      }}
      shadowProps={shadowProps}
    />
  )
  return <Piv shadowProps={shadowProps} domRef={setStateClassRef} icss={{ "--icon-image": `url(${props.src})` }} />
}

let hasLoadIconDefaultICSS = false
/**
 * use global css to style basic icon theme
 */
function loadIconDefaultICSS() {
  if (!hasLoadIconDefaultICSS) {
    addGlobalCSS(
      `
      @layer kit-theme {
        .Icon {
          display: block;
          object-fit: cover;
          background-color: currentcolor;
          mask: ${cssVar("--icon-image")} no-repeat center / contain;

          &.${IconSize.xs} {
            width: .75em;
            height: .75em;
          }
          &.${IconSize.sm} {
            width: 1em;
            height: 1em;
          }
          &.${IconSize.smi} {
            width: 1.25em;
            height: 1.25em;
          }
          &.${IconSize.md}, 
          &${Object.values(IconSize)
            .map((c) => `:not(.${c})`)
            .join("")} {
            width: 1.5em;
            height: 1.5em;
          }
          &.${IconSize.lg} {
            width: 2em;
            height: 2em;
          }
          &.${IconSize.full} {
            width: 100%;
            height: 100%;
          }
          &.${IconVariant.inline} {
            width: 1em;
            display: inline-block;
          }
        }
      }
    `,
    )
    hasLoadIconDefaultICSS = true
  }
}

