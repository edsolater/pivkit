import { CSSObject, createICSS } from '../../piv'
import { cssLinearGradient, cssRadialGradient, cssVar } from '../cssValues'

export type ICSSSpecialCyberpenkCardOptions = {
  borderWidth?: CSSObject['borderWidth']
  borderRadius?: CSSObject['borderRadius']
  bg?: CSSObject['background']
}

export const icssCyberpenkBorder = createICSS(
  ({ borderWidth = '2px', borderRadius = '16px' }: ICSSSpecialCyberpenkCardOptions = {}) => ({
    position: 'relative',
    borderWidth: borderWidth,
    borderRadius: borderRadius,
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: '0',
      pointerEvents: 'none',
      borderRadius: borderRadius,
      border: 'solid transparent',
      borderWidth: borderWidth,
      background: 'linear-gradient(246deg, #da2eef 7.97%, #2b6aff 49.17%, #39d0d8 92.1%)',
      backgroundOrigin: 'border-box',
      '-webkit-mask': `linear-gradient(#fff 0 0) padding-box, 
    linear-gradient(#fff 0 0)`,
      '-webkit-mask-composite': 'destination-out',
      maskComposite: 'exclude',
    },
  })
)

export const icssCyberpenkBackground = createICSS(() => ({
  background: [
    cssLinearGradient({
      direction: '140.14deg',
      colors: ['rgba(0, 182, 191, 0.15)', ['rgba(27, 22, 89, 0.1)', '86.61%']],
    }),
    cssLinearGradient({ direction: '321.82deg', colors: ['#18134d', '#1b1659'] }),
  ].join(','),
}))

export const icssCyberpenkBackgroundGlow = createICSS(() => ({
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '-3vmax',
    zIndex: '-1',
    pointerEvents: 'none',
    '--pd': '35%',
    background: [
      cssRadialGradient({
        size: 'closest-side',
        position: cssVar('--pd'),
        colors: ['#39d0d875', 'transparent'],
      }),
      cssRadialGradient({
        size: 'closest-side',
        position: `calc(100% - ${cssVar('--pd')})`,
        colors: ['#e300ff75', 'transparent'],
      }),
    ].join(','),
  },
}))
