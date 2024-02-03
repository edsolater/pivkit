// create a context  to past props
/**
 * this component is related to useKitProps
 */
import { createContext, useContext } from 'solid-js'
import { PivProps, ValidProps, mergeProps, omit } from '.'
import { Fragnment } from './Fragnment'

/** add props is implied by solidjs context */
const _PropContext = createContext<ValidProps[]>()

/**
 * `<PropContext>` is **Context** , not `<AddProps>` \
 * it will add props to all children components
 */
export function PropContext<Props extends ValidProps = PivProps>(props: Props) {
  const parentPropContext = useContext(_PropContext) ?? []
  const selfPropContextValue = parentPropContext.concat(
    omit(props, 'children') // PropContext should not change inners children
  )
  return (
    <_PropContext.Provider value={selfPropContextValue}>
      <Fragnment>{props.children}</Fragnment>
    </_PropContext.Provider>
  )
}

/** add additional prop through solidjs context */
export function getPropsFromPropContextContext(componentInfo: { componentName?: string }): ValidProps | undefined {
  const allPropses = useContext(_PropContext)
  if (!allPropses) return undefined
  return mergeProps(...allPropses)
}
