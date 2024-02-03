import { KitProps, useKitProps } from '../../createKit'
import { ICSSGridItemOption, ICSSGridOption, icssGrid } from '../../styles/icssRules'
import { getICSSFromProps } from '../../utils/getICSSFromProps'
import { Box, BoxProps } from './Box'

export type GridBoxProps = {
  [K in keyof ICSSGridOption as `icss:${K}`]?: ICSSGridOption[K]
} & BoxProps

/**
 * if for layout , don't render important content in GridBox
 * it's icss: props is from {@link ICSSGridOption}
 */
export function Grid(rawProps: KitProps<GridBoxProps>) {
  const { shadowProps, props } = useKitProps(rawProps, { name: 'Grid' })
  const icssOption = getICSSFromProps(props)
  return <Box shadowProps={shadowProps} icss={icssGrid(icssOption)} />
}

export type GridItemBoxProps = {
  'icss:area'?: ICSSGridItemOption['area']
} & BoxProps

/**
 * for direct sub component of `<GridBox>`
 * @deprecated no , should use `<Box icss={{gridArea: 'xxx'}} />` instead
 */
export function GridItem(rawProps: KitProps<GridItemBoxProps>) {
  const { shadowProps, props } = useKitProps(rawProps, { name: 'GridItemBox' })
  return <Box shadowProps={shadowProps} icss={{ gridArea: props['icss:area'] }} />
}
