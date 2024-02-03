import { KitProps, useKitProps } from '../../createKit'
import { renderAsHTMLMain } from '../../piv'
import { Box, BoxProps } from './Box'

export type MainProps = BoxProps

/**
 * just render nothing
 */
export function Main(kitProps: KitProps<MainProps>) {
  const { shadowProps } = useKitProps(kitProps, { name: 'Main' })
  /* ---------------------------------- props --------------------------------- */
  return <Box shadowProps={shadowProps} render:self={renderAsHTMLMain} />
}
