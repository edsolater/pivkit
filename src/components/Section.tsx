import { KitProps, useKitProps } from '../createKit'
import { Piv } from '../piv'

export type SectionProps = {
  name?: string
}

export type SectionKitProps = KitProps<SectionProps>

/**
 * if for layout , don't render important content in Box
 */
export function Section(rawProps: SectionKitProps) {
  const { shadowProps, props } = useKitProps(rawProps, { name: 'Section' })
  return <Piv class={props.name} shadowProps={shadowProps} />
}
