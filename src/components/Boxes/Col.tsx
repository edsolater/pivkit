import { KitProps, useKitProps } from '../../createKit'
import { ICSSColOption, icssCol } from '../../styles/icssRules'
import { getICSSFromProps } from '../../utils/getICSSFromProps'
import { Box, BoxProps } from './Box'

export type ColProps = {
  [K in keyof ICSSColOption as `icss:${K}`]?: ICSSColOption[K]
} & BoxProps
/**
 * if for layout , don't render important content in ColBox
 */
export function Col(rawProps: KitProps<ColProps>) {
  const { props, shadowProps } = useKitProps(rawProps, { name: 'ColBox' })
  const icssOption = getICSSFromProps(props)
  /* ---------------------------------- props --------------------------------- */
  return <Box icss={icssCol(icssOption)} shadowProps={shadowProps} />
}
