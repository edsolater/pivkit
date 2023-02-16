import { tailwindPaletteColors } from './tailwindPaletteColors'
import { CSSColorString } from './type'

export const cssColors = {
  screenBg: '#f3f5f7',

  cardBg: '#ffffffcc',
  cardBg2: '#ffffffdd',
  cardBgDark: '#515254e0',

  cardSelected: '#d3d6d99e',
  textColor: tailwindPaletteColors.gray800,
  labelColor: tailwindPaletteColors.gray500,
  secondaryTextColor: tailwindPaletteColors.gray500,
  secondaryLabelColor: tailwindPaletteColors.gray400,

  white: '#ffffff',
  black: '#000000',

  dodgerBlue: '#1e90ff' as CSSColorString,
  dodgerBlueDark: '#1e90ff' as CSSColorString,
  transparent: 'transparent',

  opacityGray: '#6767675e' as CSSColorString,
  /** use for dark mode button default  color */
  buttonPrimaryColor: tailwindPaletteColors.indigo600
} as const
