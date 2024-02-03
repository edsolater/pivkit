import { mergeObjects } from '@edsolater/fnkit'
import { KitProps, useKitProps } from '../../createKit'
import { ICSSRowOption, icssRow } from '../../styles/icssRules'
import { getICSSFromProps } from '../../utils/getICSSFromProps'
import { Box, BoxProps } from './Box'

export type RowProps = {
  /* the same as `icss:align='center'` */
  line?: boolean
} & {
  [K in keyof ICSSRowOption as `icss:${K}`]?: ICSSRowOption[K]
} & BoxProps

/**
 * if for layout , don't render important content in Row
 */
export function Row(kitProps: KitProps<RowProps>) {
  const { shadowProps, props } = useKitProps(kitProps, { name: 'Row' })
  const icssOption = getICSSFromProps(props)
  /* ---------------------------------- props --------------------------------- */
  return (
    <Box
      icss={props.line ? icssRow(mergeObjects(icssOption, { align: 'center' })) : icssRow(icssOption)}
      shadowProps={shadowProps}
    />
  )
}
