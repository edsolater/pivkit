// create a context  to past props
/**
 * this component is related to useKitProps
 */
import { shakeNil } from "@edsolater/fnkit"
import { createContext, splitProps, useContext } from "solid-js"
import { mergeProps, PivProps, ValidProps } from "."

/** set this to true, means addProps has already comsumed, no need subchildren to consume again */
const hasConsumed = new WeakSet<ValidProps>()

/** add props is implied by solidjs context */
const AddPropContext = createContext<(ValidProps | undefined)[]>()

/**
 * `<PropContext>` is **Context** , not `<AddProps>` \
 * `<AddProps>` can only consume once
 */
export function AddProps<Props extends ValidProps = PivProps>(props: Props) {
  const parentAddProp = useContext(AddPropContext)
  const [local, restProps] = splitProps(props, ["children"])
  const selfContextValue = [parentAddProp && !hasConsumed.has(parentAddProp) ? parentAddProp : undefined, restProps]
  return <AddPropContext.Provider value={selfContextValue}>{(local as any).children}</AddPropContext.Provider>
}

/** add additional prop through solidjs context */
export function getPropsFromAddPropContext(componentInfo: { componentName?: string }): ValidProps | undefined {
  const additionalProps = useContext(AddPropContext)
  if (!additionalProps) return undefined
  const shakedAdditionalProps = shakeNil(additionalProps).filter((props) => !hasConsumed.has(props))
  if (shakedAdditionalProps.length === 0) return undefined
  shakedAdditionalProps.forEach((props) => hasConsumed.add(props))
  return mergeProps(...shakedAdditionalProps)
}
