import { isString } from "@edsolater/fnkit"
import { CSSColorString } from "../type"
import { CSSObject } from "../../piv"

/**
 * **CSS Utility Function**
 */
export function cssLinearGradient(options: {
  /** @default 'to bottom' */
  direction?: "to top" | "to bottom" | "to left" | "to right" | (string & {})
  colors: (CSSColorString | [color: CSSColorString, position?: string])[]
}): string {
  return `linear-gradient(${options.direction ?? "to bottom"}, ${options.colors
    .map((item) => (isString(item) ? item : item.join(" ")))
    .join(", ")})`
}

/**
 * **CSS Utility Function**
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/radial-gradient#formal_syntax
 */
export function cssRadialGradient(options: {
  /** @default 'circle' */
  endingShape?: "circle" | "ellipse"
  size?: "closest-side" | "closest-corner" | "farthest-side" | "farthest-corner"
  /** @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/radial-gradient#values */
  position?: CSSObject["backgroundOrigin"] | CSSObject["transformOrigin"]
  colors: (CSSColorString | [color: CSSColorString, position?: string])[]
}): string {
  return `radial-gradient(${options.size ?? "circle"}${
    options.position ? ` at ${options.position ?? "center"}` : ""
  }, ${options.colors.map((item) => (isString(item) ? item : item.join(" "))).join(", ")})`
}
