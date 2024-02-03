import { switchCase } from '@edsolater/fnkit'
import { createICSS, CSSObject } from '../../piv'

export type ICSSFontSize = 'xs' | 'sm' | 'md' | 'lg' | (string & {})

export const icssFontSize = createICSS((options?: { fontSize?: ICSSFontSize }) => {
  const fontSize = options?.fontSize ?? 'md'
  return {
    fontSize: switchCase(fontSize, { sm: '0.75em', xs: '0.5em', md: '1em', lg: '1.25em' }, fontSize),
  } as unknown as CSSObject
})

const cssFontWeight = (fontWeight: CSSObject['fontWeight']) => ({ fontWeight }) as CSSObject
export const icssFont = createICSS((options?: { fontSize?: ICSSFontSize; fontWeight?: CSSObject['fontWeight'] }) => {
  const fontSize = options?.fontSize ?? 'md'
  return {
    ...icssFontSize({ fontSize }),
    ...cssFontWeight(options?.fontWeight),
    color: 'white',
  } as unknown as CSSObject
})
