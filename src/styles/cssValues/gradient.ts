import { isString } from "@edsolater/fnkit"
import { CSSColorString } from "../type"
import { CSSObject } from "../../piv"

/**
 * **CSS Utility Function**
 * @example
 * background: cssLinearGradient({
 * direction: "to right",
 * colors: ["#000", "#fff", "#000"],
 * })
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
 * @example
 * background: cssRepeatingLinearGradient({
 *  direction: "to right",
 *  colors: ["#000", "#fff 10px", "#000 20px"],
 * })
 */
export function cssRepeatingLinearGradient(options: {
  /** @default 'to bottom' */
  direction?: "to top" | "to bottom" | "to left" | "to right" | (string & {})
  colors: (CSSColorString | [color: CSSColorString, position?: string])[]
}): string {
  return `repeating-linear-gradient(${options.direction ?? "to bottom"}, ${options.colors
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

export function cssRepeatingRadialGradient(options: {
  /** @default 'circle' */
  endingShape?: "circle" | "ellipse"
  size?: "closest-side" | "closest-corner" | "farthest-side" | "farthest-corner"
  /** @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/radial-gradient#values */
  position?: CSSObject["backgroundOrigin"] | CSSObject["transformOrigin"]
  colors: (CSSColorString | [color: CSSColorString, position?: string])[]
}): string {
  return `repeating-radial-gradient(${options.size ?? "circle"}${
    options.position ? ` at ${options.position ?? "center"}` : ""
  }, ${options.colors.map((item) => (isString(item) ? item : item.join(" "))).join(", ")})`
}

export function cssConicGradient(options: {
  /** @default 'circle' */
  endingShape?: "circle" | "ellipse"
  size?: "closest-side" | "closest-corner" | "farthest-side" | "farthest-corner"
  /** @see https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/radial-gradient#values */
  position?: CSSObject["backgroundOrigin"] | CSSObject["transformOrigin"]
  colors: (CSSColorString | [color: CSSColorString, position?: string])[]
}): string {
  return `conic-gradient(${options.size ?? "circle"}${
    options.position ? ` at ${options.position ?? "center"}` : ""
  }, ${options.colors.map((item) => (isString(item) ? item : item.join(" "))).join(", ")})`
}
