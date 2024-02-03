import { addDefault } from '@edsolater/fnkit'
import { createICSS, CSSObject } from '../../piv'
import { cssColors } from '../cssColors'
import { ICSSFontSize, icssFontSize } from './fondation'

export type ICSSRowOption = {
  gap?: CSSObject['gap']

  /** css: alignItems */
  align?: CSSObject['alignItems']

  /** css: justifyContent */
  justify?: CSSObject['justifyContent']

  alignContent?: CSSObject['alignContent']
  alignItems?: CSSObject['alignItems']
  justifyContent?: CSSObject['justifyContent']
  justifyItems?: CSSObject['justifyItems']

  //TODO
  presetEqualWidthChildren?: true

  /** only for children,  */
  childItems?: CSSObject['flex']
}

export const icssRow = createICSS(
  ({
    gap = '.25em',
    align,
    alignContent,
    alignItems = align,
    justify,
    justifyItems,
    justifyContent = justify,
    childItems,
  }: ICSSRowOption = {}) => ({
    display: 'flex',
    alignItems,
    alignContent,
    justifyItems,
    justifyContent,
    gap,
    '> *': childItems ? { flex: childItems } : undefined,
  })
)

export type ICSSColOption = {
  gap?: CSSObject['gap']
  /** css: alignItems */
  align?: CSSObject['alignItems']
  /** css: justifyContent */
  justify?: CSSObject['justifyContent']

  alignContent?: CSSObject['alignContent']
  alignItems?: CSSObject['alignItems']
  justifyContent?: CSSObject['justifyContent']
  justifyItems?: CSSObject['justifyItems']
  /** only for children,  */
  childItems?: CSSObject['flex']
}

export const icssCol = createICSS(
  ({
    gap = '.25em',
    align,
    alignContent,
    alignItems = align,
    justify,
    justifyItems,
    justifyContent = justify,
    childItems,
  }: ICSSColOption = {}) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems,
    alignContent,
    justifyItems,
    justifyContent,
    gap,
    '> *': childItems ? { flex: childItems } : undefined,
  })
)

//#region ------------------- grid -------------------
export type ICSSGridOption = {
  gap?: CSSObject['gap']
  /** css: placeItems */
  items?: CSSObject['placeItems']
  /** css: placeContent */
  content?: CSSObject['placeContent']
  template?: CSSObject['gridTemplate']
  templateRow?: CSSObject['gridTemplateRows']
  templateColumn?: CSSObject['gridTemplateColumns']
}

export const icssGrid = createICSS(({ items, template, templateColumn, templateRow, gap }: ICSSGridOption = {}) => ({
  display: 'grid',
  placeItems: items,
  gridTemplate: template,
  gridTemplateColumns: templateColumn,
  gridTemplateRows: templateRow,
  gap: gap,
}))

export type ICSSGridItemOption = {
  area?: CSSObject['gridArea']
}

export const icssGridItem = createICSS((opts: ICSSGridItemOption = {}) => ({
  gridArea: opts?.area,
}))

//#endregion

export type ICSSCardOption = {
  styleType?: 'big-card' | 'ghost'
  gap?: CSSObject['gap']
  items?: CSSObject['alignItems']
  bg?: CSSObject['background']
}

export const icssCard = createICSS((options?: ICSSCardOption) => ({
  display: 'grid',
  // backgroundColor: 'color-mix(in srgb, currentColor, transparent 95%)',
  background: options?.bg ?? 'var(--app-bg)',
  /* generate by https://shadows.brumm.af/ */
  boxShadow:
    options?.styleType === 'ghost'
      ? undefined
      : `4.1px 4.1px 5.3px -23px rgba(0, 0, 0, 0.012),
           19.6px 19.6px 17.9px -23px rgba(0, 0, 0, 0.018),
           100px 100px 80px -23px rgba(0, 0, 0, 0.03)`,
  padding: '12px 24px',
  borderRadius: '16px',
}))

export type ICSSClickableOption = {}

/**
 * build-in icss for make element looks clickable
 */
export const icssClickable = createICSS((options?: ICSSClickableOption) => ({
  cursor: 'pointer',
  transition: '100ms',
  backdropFilter: 'brightness(1)',
  filter: 'brightness(1)',
  '&:is(:hover,:active,:focus)': { backdropFilter: 'brightness(0.95)', filter: 'brightness(0.95)' },
  '&:active': { transform: 'scale(0.95)' },
}))
export const icssFocusDetector = createICSS(() => ({
  outline: 'solid 1px',
  '&:focus': { outlineStyle: 'solid', outlineWidth: '2px' },
  transition: '100ms',
}))

export const icssTitle = createICSS((options?: { w?: CSSObject['minWidth']; h?: CSSObject['minHeight'] }) => ({
  fontSize: '1.5em',
  fontWeight: 'bold',
}))

export const icssLabel = createICSS((options?: { w?: CSSObject['minWidth']; h?: CSSObject['minHeight'] }) => ({
  minWidth: options?.w ?? '5em',
  minHeight: options?.h ?? 'calc(2em)',
  textAlign: 'center',
  paddingBlock: '.25em',
  paddingInline: '.5em',
  borderRadius: '4px',
  background: cssColors.component_label_bg_default,
}))

export const icssLabelTitle = createICSS((options?: { fontSize?: ICSSFontSize }) => [
  icssFontSize({ fontSize: options?.fontSize ?? 'sm' }),
  { fontWeight: '500', color: '#abc4ff88' },
])

export const icssSubContent = createICSS((options?: { fontSize?: ICSSFontSize }) => [
  icssFontSize({ fontSize: options?.fontSize ?? 'sm' }),
  { color: '#abc4ff88' },
])

export const icssInputType = createICSS((options?: { w?: CSSObject['minWidth']; h?: CSSObject['minHeight'] }) => ({
  minWidth: '12em',
  paddingBlock: '.25em',
  paddingInline: '.5em',
  // borderRadius: '4px',
  // background: cssColors.component_input_bg_default,
  // outlineColor: cssColors.dodgerBlue,
  borderBottom: 'solid',
}))
