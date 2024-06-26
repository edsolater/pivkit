import { isArray, isNumber, isObjectLiteral, isString, toPercentString } from "@edsolater/fnkit"
import type { CSSObject } from "@edsolater/pivkit"

type ColorString = CSSObject["color"]

type ColorPercent = number | `${number}%`

type ColorItemObj = {
  color?: ColorString
  percent?: ColorPercent
}

type ColorItemArray = [color: ColorString, percent?: ColorPercent]

type ColorItem = ColorItemArray | ColorItemObj

export function cssColorMix(...colors: (ColorString | ColorPercent | ColorItem)[]) {
  const colorItems = getColorItemsObj(colors)
  const colorInfoList = colorItems.map((colorItem) => {
    const { color, percent } = isArray(colorItem) ? { color: colorItem[0], percent: colorItem[1] } : colorItem
    return isColorPercent(percent) ? `${color} ${isNumber(percent) ? toPercentString(percent) : percent}` : color
  })
  return `color-mix(in srgb, ${colorInfoList.join(", ")})`
}

/**
 *
 * @example
 * getColorItems(['#fff', '60%', ['#000', 0.5]]) // => [{color: '#fff', percent: 0.6}, {color: '#000', percent: 0.5}]
 */
function getColorItemsObj(colors: (ColorString | ColorPercent | ColorItem)[]): ColorItemObj[] {
  const composedColorItems: ColorItemObj[] = []
  for (const item of colors) {
    if (isColorItemObj(item)) {
      composedColorItems.push(item)
    }
    if (isColorItemArray(item)) {
      composedColorItems.push({ color: item[0], percent: item[1] })
    }
    if (isColorString(item)) {
      composedColorItems.push({ color: item })
    }
  }
  return composedColorItems
}

function isColorString(c: ColorPercent | ColorString | ColorItem | undefined): c is ColorString {
  return isString(c)
}

function isColorPercent(c: ColorPercent | ColorString | ColorItem | undefined): c is ColorPercent {
  return typeof c === "number" || (typeof c === "string" && c.endsWith("%"))
}

function isColorItemObj(c: ColorPercent | ColorString | ColorItem | undefined): c is ColorItemObj {
  return isObjectLiteral(c)
}

function isColorItemArray(c: ColorPercent | ColorString | ColorItem | undefined): c is ColorItemArray {
  return isArray(c)
}
/**
 * **CSS Utility Function**
 *
 * @example
 * cssOpacity('#fff', 0.1) // => 'rgb(255, 255, 255, 0.1)'
 * @param transparentPercent 0~1
 * @returns color-mix() string
 */
export function cssOpacity(color: CSSObject["color"], alpha: number) {
  return cssColorMix(color, ["transparent", 1 - alpha])
}

export function cssLighten(color: CSSObject["color"], depth: number) {
  return cssColorMix(color, ["white", depth])
}

export function cssDarken(color: CSSObject["color"], depth: number) {
  return cssColorMix(color, ["black", depth])
}

export function cssGrayscale(color: CSSObject["color"], depth: number) {
  return cssColorMix(color, ["gray", depth])
}
