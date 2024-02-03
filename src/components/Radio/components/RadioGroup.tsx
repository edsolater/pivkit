import { createSignal } from 'solid-js'
import { useKitProps } from '../../../createKit/useKitProps'
import { KitProps } from '../../../createKit/KitProps'
import { ValidController } from '../../../piv/typeTools'
import { icssCol } from '../../../styles/icssRules'
import { Box } from '../../Boxes/Box'

export interface RadioGroupController {
  name: string
  current: () => string | undefined

  check: (option: string) => void
  uncheck: () => void
}

export type RadioGroupProps = {
  name: string
  option?: string
  defaultOption?: string
  onChange?(utils: { option: string; isChecked: boolean }): void
}

export type RadioGroupKitProps<Controller extends ValidController = RadioGroupController> = KitProps<
  RadioGroupProps,
  { controller: Controller }
>

const selfProps = ['name', 'option', 'defaultOption', 'onChange'] satisfies (keyof RadioGroupKitProps)[]

const defaultProps = {
  name: 'unknown radio group',
} satisfies Partial<RadioGroupKitProps>

/**
 * RadioGroup can illustrate a boolean value
 */
export function RadioGroup(kitProps: RadioGroupKitProps) {
  const { props, shadowProps, lazyLoadController } = useKitProps(kitProps, {
    name: 'RadioGroup',
    defaultProps,
    selfProps: selfProps,
  })

  const [selectedOption, setSeletedOption] = createSignal(props.option)

  const radioGroupController = {
    get option() {
      return props.option
    },
  }

  lazyLoadController(radioGroupController)

  return <Box class='RadioGroup' shadowProps={shadowProps} icss={icssCol()} />
}
