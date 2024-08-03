import { WeakerMap, WeakerSet, concat } from "@edsolater/fnkit"
import { Context, createContext, useContext, type JSXElement } from "solid-js"
import { PivProps, ValidController, ValidProps, mergeProps } from "."
import { Fragnment } from "./Fragnment"

type ControllerContext = Context<ValidController | undefined>
type ComponentName = string

// same component share same ControllerContext
const controllerContextStore = new WeakerMap<ComponentName, ControllerContext>()
const anonymousComponentControllerContextStore = new WeakerSet<ControllerContext>()

/**
 * may auto-create a Context by componentName
 * same componentName will output same context
 */
function getControllerContext(
  name: ComponentName | undefined,
  options: { willAutoCreate: false },
): ControllerContext | undefined
function getControllerContext(name?: ComponentName, options?: { willAutoCreate?: boolean }): ControllerContext
function getControllerContext(
  name?: ComponentName,
  options?: { willAutoCreate?: boolean },
): ControllerContext | undefined {
  if (name) {
    if (controllerContextStore.has(name)) {
      return controllerContextStore.get(name)!
    } else {
      if (options?.willAutoCreate === false) return undefined
      const InnerControllerContext: ControllerContext = createContext()
      controllerContextStore.set(name, InnerControllerContext)
      return InnerControllerContext
    }
  } else {
    const InnerAnonymousControllerContext: ControllerContext = createContext()
    anonymousComponentControllerContextStore.add(InnerAnonymousControllerContext)
    return InnerAnonymousControllerContext
  }
}

const getAllControllerContext = () => {
  const allIterators = concat(controllerContextStore.values(), anonymousComponentControllerContextStore.values())
  return Array.from(allIterators)
}

/** add additional prop through solidjs context
 * @deprecated just use {@link createControllerContext} and {@link useControllerContext}
 */
export function getControllerObjFromControllerContext() {
  const Contexts = getAllControllerContext()
  const contextControllers = Contexts.map(useContext)
  const mergedController = mergeProps(...contextControllers)
  return mergedController
}

/**
 * should handle this only in <Piv>
 * 🤔 maybe it's a bad idea? for it will bring new complication
 * @deprecated just use {@link createControllerContext} and {@link useControllerContext}
 */
export function handlePropsInnerController(props: ValidProps, componentName?: string): ValidProps {
  const inputController = props.innerController as PivProps["innerController"]
  // only check props not props.shadowProps
  if (inputController && Object.keys(inputController).length) {
    const ControllerContext = getControllerContext(componentName)
    const newProps = mergeProps(props, {
      defineOutWrapper: (originalNode) => (
        <ControllerContext.Provider value={inputController}>
          <Fragnment>{originalNode}</Fragnment>
        </ControllerContext.Provider>
      ),
    } as Partial<PivProps>)
    return newProps
  }
  return props
}

export function createControllerContext(componentName: string | undefined, value: ValidController) {
  const ControllerContext = getControllerContext(componentName)
  const ContextProvider = (props: { children: JSXElement }) => (
    <ControllerContext.Provider value={value}>{props.children}</ControllerContext.Provider>
  )
  return ContextProvider
}

/**
 * **Hook**: get target component's controller\
 * use it you may know the stucture, it will cause difficult
 * @param componentName component name (e.g. 'Drawer')
 */
export function useControllerContext<Controller extends ValidController | unknown>(componentName: string) {
  const Context = getControllerContext(componentName, { willAutoCreate: false })
  const controller = Context && useContext(Context)
  return controller as Controller | undefined
}
