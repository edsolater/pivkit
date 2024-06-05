import { KitProps, useKitProps } from "../createKit"
import { useClassRef } from "../domkit"
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
  /** default has opacity,  */
  btn: "btn",
  /**pure, used in text content, set this will change icon width to 1em, and display is inline */
  betweenText: "betweenText",
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
      render:self={(selfProps) => renderHTMLDOM("img", selfProps)}
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
          mask: ${cssVar("--icon-image")} no-repeat center;

          &.${IconSize.xs} {
            width: 12px;
            height: 12px;
          }
          &.${IconSize.sm} {
            width: 16px;
            height: 16px;
          }
          &.${IconSize.smi} {
            width: 20px;
            height: 20px;
          }
          &.${IconSize.md}, 
          &${Object.values(IconSize)
            .map((c) => `:not(.${c})`)
            .join("")} {
            width: 24px;
            height: 24px;
          }
          &.${IconSize.lg} {
            width: 32px;
            height: 32px;
          }
          &.${IconSize.full} {
            width: 100%;
            height: 100%;
          }
          &.${IconVariant.betweenText} {
            width: 1em;
            display: inline-block;
          }
          &.${IconVariant.btn} {
            opacity: 0.8;
          }
        }
      }
    `,
    )
    hasLoadIconDefaultICSS = true
  }
}
