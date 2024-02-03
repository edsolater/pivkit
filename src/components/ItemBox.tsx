import { JSXElement } from 'solid-js'
import { KitProps, useKitProps } from '../createKit'
import { Piv, ValidController } from '../piv'
import { Box } from './Boxes'

export interface ItemBoxProps {
  suffix?: JSXElement
  prefix?: JSXElement
}

export type ItemBoxKitProps<Controller extends ValidController = ValidController> = KitProps<
  ItemBoxProps,
  { controller: Controller }
>

/**
 * if for layout , don't render important content in Box
 */
export function ItemBox(rawProps: ItemBoxKitProps) {
  const { props } = useKitProps(rawProps, { name: 'ItemBox' })
  /* ---------------------------------- props --------------------------------- */
  return (
    <Box shadowProps={props} icss={{ display: 'flex' }}>
      {props.prefix}
      {/* TODO: porps.children should be normal  */}
      <>{props.children}</>
      {props.suffix}
    </Box>
  )
}
