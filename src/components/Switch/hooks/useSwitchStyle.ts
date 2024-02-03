import { DeKitProps } from '../../../createKit'
import { cssColors } from '../../../styles'
import { HTMLCheckboxKitProps } from '../HTMLCheckbox'
import { SwitchProps } from '../Switch'

/**
 * hook for switch's **style**
 */
export function useSwitchStyle(params: { props: DeKitProps<SwitchProps> }) {
  const wrapperLabelStyleProps = {
    icss: ({ isChecked }) => ({
      '@layer default-variable': {
        '--accent-color': cssColors.accentColor,
        '--switch-width': '2em',
        '--slot-bg-active': 'color-mix(in srgb, var(--accent-color), #fff 80%)',
        '--slot-bg-inactive': 'color-mix(in srgb, color-mix(in srgb, var(--accent-color), #fff 80%), #ddd 90%)',
        '--thumb-bg-active': 'var(--accent-color)',
        '--thumb-bg-inactive': '#fff',
      },
      display: 'block',
      width: 'var(--switch-width)',
      height: 'calc(var(--switch-width) / 2)',
      background: isChecked() ? 'var(--slot-bg-active)' : 'var(--slot-bg-inactive)',
      borderRadius: '999em',
      padding: 'calc(var(--switch-width) / 9) ',
      transition: 'background 300ms',
    }),
  } satisfies Partial<SwitchProps>

  const htmlCheckboxStyleProps = {
    icss: {
      position: 'absolute',
      border: '0px',
      outline: 'none',
      opacity: 0,
      width: '1px',
      height: '1px',
      margin: '-1px',
      overflow: 'hidden',
    },
  } satisfies Partial<HTMLCheckboxKitProps>

  const switchThumbStyleProps = {
    icss: ({ isChecked }) => ({
      height: '100%',
      aspectRatio: '1',
      borderRadius: '999em',
      background: isChecked() ? 'var(--thumb-bg-active)' : 'var(--thumb-bg-inactive)',
      marginLeft: isChecked() ? 'auto' : '0',
      transition: '300ms',
    }),
  } satisfies Partial<SwitchProps>

  return { wrapperLabelStyleProps, htmlCheckboxStyleProps, switchThumbStyleProps }
}
