import { createICSS } from '../../piv'
import { cssCurrentColor } from '../cssColors'
import { cssOpacity, cssVar } from '../cssValues'

export const icssFrostedGlass = createICSS((options?: { blurBg?: boolean }) => ({
  '@layer default-variable': {
    '--text-color': cssCurrentColor,
    '--border-color': cssCurrentColor,
    '--bg-board-color': cssOpacity(cssCurrentColor, 0.12),
    '--bg-board-color-2': 'transparent',
    '--blur-size': '3px',
    '--is-scrolling': '0',
    '--border-width': '.08em',
  },

  position: 'relative',
  backdropFilter: options?.blurBg
    ? `blur(calc(${cssVar('--blur-size')} * (-1 * ${cssVar('--is-scrolling')} + 1)))`
    : undefined,
  color: cssVar('--text-color'),
  background: `linear-gradient(162deg, ${cssVar('--bg-board-color')} 28.7%, ${cssVar('--bg-board-color-2')})`,
  isolation: 'isolate',
  '&::before': {
    content: "''",
    position: 'absolute',
    inset: 0,
    zIndex: '-1',
    opacity: '0.5',
    background: 'transparent',
    borderRadius: 'inherit',
    boxShadow: `inset 0 0 0 ${cssVar('--border-width')} ${cssVar('--border-color')}`,
    '-webkit-mask-image': `radial-gradient(at -31% -58%, hsl(0, 0%, 0%, 0.5) 34%, transparent 60%),
    linear-gradient(to left, hsl(0, 0%, 0%, 0.2) 0%, transparent 13%),
    linear-gradient(hsl(0deg 0% 0% / 5%), hsl(0deg 0% 0% / 5%))`,
  },
}))

export const icssFrostedCard = createICSS((options?: { size?: 'sm' | 'md' | 'lg' }) => ({
  padding: '24px 32px 20px',
  borderRadius: '1em',
  border: 'solid rgba(99,130,202,.2)',
}))
