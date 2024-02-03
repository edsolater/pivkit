import { KitProps, useKitProps } from '../../createKit'
import { Box, BoxProps } from './Box'

export type GroupProps = BoxProps & {
  name: string
}

/**
 * just render nothing
 */
export function Group(kitProps: KitProps<GroupProps>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'Group' })
  /* ---------------------------------- props --------------------------------- */
  return <Box class={props.name} shadowProps={shadowProps} />
}
