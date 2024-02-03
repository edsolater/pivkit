import { useKitProps } from '../../createKit/useKitProps'
import { KitProps } from '../../createKit/KitProps'
import { Piv } from '../../piv'

export interface ContainerProps {
  /** it's size can't base on inner content's size */
  canContainQuery?: boolean
}

/**
 * set css container for containerQuery
 * a alias of `<Box>`, often used as a Root of Component
 */
export function Container(kitProps: KitProps<ContainerProps>) {
  const { shadowProps, props } = useKitProps(kitProps, { name: 'Container' })
  /* ---------------------------------- props --------------------------------- */
  return <Piv icss={props.canContainQuery ? { container: 'anonymous / size' } : undefined} shadowProps={shadowProps} />
}
