import { cssVar } from "./cssValues"
import { tailwindPaletteColors } from "./tailwindPaletteColors"
import { CSSColorString } from "./type"

// TODO: just inner the uikit, but should export to outside
export const cssColors = {
  screenBg: "#f3f5f7",

  cardBg: "#ffffffcc",
  cardBg2: "#ffffffdd",
  cardBgDark: "#515254e0",

  cardSelected: "#d3d6d99e",
  textColor: tailwindPaletteColors.gray800,
  labelColor: tailwindPaletteColors.gray500,
  secondaryTextColor: tailwindPaletteColors.gray500,
  secondaryLabelColor: tailwindPaletteColors.gray400,

  white: "#ffffff",
  black: "#000000",

  dodgerBlue: "#1e90ff" as CSSColorString,
  dodgerBlueDark: "#1e90ff" as CSSColorString,
  transparent: "transparent",

  opacityGray: "#6767675e" as CSSColorString,
  /** use for dark mode button default  color */

  //---- button
  // theme:solid
  component_button_bg_primary: tailwindPaletteColors.gray300,
  component_button_text_primary: tailwindPaletteColors.gray700,

  //---- label
  component_label_bg_default: "#e1e3e769",

  //---- input
  component_input_bg_default: "transparent",

  accentColor: "dodgerblue",
  // accentColorInactive: 'dodgerblue',
} as const

export const cssCurrentColor = cssVar("--current-color", "currentcolor")
