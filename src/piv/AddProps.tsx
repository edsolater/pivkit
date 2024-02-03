// create a context  to past props
/**
 * this component is related to useKitProps
 */
import { createContext, useContext } from 'solid-js'
import { PivProps, ValidProps, mergeProps, omit } from '.'
import { Fragnment } from './Fragnment'

/** set this to true, means addProps has already comsumed, no need subchildren to consume again */
const hasConsumed = new WeakSet<ValidProps>()

/** add props is implied by solidjs context */
const AddPropContext = createContext<ValidProps>()

/**
 * `<PropContext>` is **Context** , not `<AddProps>` \
 * `<AddProps>` can only consume once
 */
export function AddProps<Props extends ValidProps = PivProps>(props: Props) {
  const parentAddProp = useContext(AddPropContext)
  const selfContextValue = mergeProps(
    parentAddProp && !hasConsumed.has(parentAddProp) ? parentAddProp : undefined,
    omit(props, 'children')
  )
  return (
    <AddPropContext.Provider value={selfContextValue}>
      <Fragnment>{props.children}</Fragnment>
    </AddPropContext.Provider>
  )
}

/** add additional prop through solidjs context */
export function getPropsFromAddPropContext(componentInfo: { componentName?: string }): ValidProps | undefined {
  const additionalProps = useContext(AddPropContext)
  if (!additionalProps) return undefined
  if (hasConsumed.has(additionalProps)) return undefined
  hasConsumed.add(additionalProps)
  return additionalProps
}
