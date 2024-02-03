import { KitProps, useKitProps } from '../createKit'
import { Piv } from '../piv'
import { renderHTMLDOM } from '../piv/propHandlers/renderHTMLDOM'

export type LabelBoxProps = {}

export type LabelBoxKitProps = KitProps<LabelBoxProps>
/**
 * created for form widget component
 *
 * !`<label>` can transpond click/focus event for inner `<Input>`-like Node
 */
export function LabelBox(kitProps: LabelBoxKitProps) {
  const { props, shadowProps } = useKitProps(kitProps, { name: 'LabelBox' })
  return (
    <Piv
      render:self={(selfProps) => renderHTMLDOM('label', selfProps)} // why set as will render twice
      shadowProps={shadowProps}
    />
  )
}
