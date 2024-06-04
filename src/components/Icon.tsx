import { glob } from "goober"
import { KitProps, useKitProps } from "../createKit"
import { Piv } from "../piv"
import { renderHTMLDOM } from "../piv/propHandlers/renderHTMLDOM"
import { cssVar } from "../styles"
import { addGlobalCSS } from "../utils/cssGlobalStyle"

export interface IconProps {
  name?: string
  /** sx: 12px; sm: 16px; smi: 20px; md: 24px; lg: 32px (default: md) */
  size?: keyof typeof IconSize
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
  broken: "broken", // default
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
  return <Piv shadowProps={shadowProps} icss={{ "--icon-image": `url(${props.src})` }} />
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
          background-color: currentColor;
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
          :is(&.${IconSize.md}, &${Object.values(IconSize)
            .map((c) => `:not(.${c})`)
            .join("")}) {
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
        }
      }
    `,
    )
    hasLoadIconDefaultICSS = true
  }
}
