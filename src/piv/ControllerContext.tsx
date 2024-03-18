import { Context, createContext, useContext } from "solid-js"
import { PivProps, ValidController, ValidProps, mergeProps } from "."
import { Fragnment } from "./Fragnment"
import { WeakerMap, WeakerSet } from "@edsolater/fnkit"
import { contactIterableIterators } from "../fnkit/contactIterableIterators"

type ControllerContext = Context<ValidController | undefined>
type ComponentName = string

// same component share same ControllerContext
const controllerContextStore = new WeakerMap<ComponentName, ControllerContext>()
const anonymousComponentControllerContextStore = new WeakerSet<ControllerContext>()

/**
 * will auto-create
 * same componentName will output same context
 */
function getControllerContext(name?: ComponentName) {
  if (name) {
    if (controllerContextStore.has(name)) {
      return controllerContextStore.get(name)!
    } else {
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
  const allIterators = contactIterableIterators(
    controllerContextStore.values(),
    anonymousComponentControllerContextStore.values(),
  )
  return Array.from(allIterators)
}

const getControllerContextByComponentName = (name: ComponentName) => controllerContextStore.get(name)

/** add additional prop through solidjs context */
export function getControllerObjFromControllerContext() {
  const Contexts = getAllControllerContext()
  const contextControllers = Contexts.map(useContext)
  const mergedController = mergeProps(...contextControllers)
  return mergedController
}

/** should handle this only in <Piv>
 * 🤔 maybe it's a bad idea? for it will bring new complication
 */
export function handlePropsInnerController(props: ValidProps, componentName?: string): ValidProps {
  const inputController = props.innerController as PivProps["innerController"]
  // only check props not props.shadowProps
  if (inputController && Object.keys(inputController).length) {
    const ControllerContext = getControllerContext(componentName)
    const newProps = mergeProps(props, {
      "render:outWrapper": (originalNode) => {
        console.log("parse outWrapper", 33)
        return (
          <ControllerContext.Provider value={inputController}>
            <Fragnment>{originalNode}</Fragnment>
          </ControllerContext.Provider>
        )
      },
    } as Partial<PivProps>)
    return newProps
  }
  return props
}

/**
 * **Hook**: get target component's controller\
 * use it you may know the stucture, it will cause difficult
 * @param componentName component name (e.g. 'Drawer')
 */
export function useContextController<Controller extends ValidController | unknown>(componentName: string) {
  const Context = getControllerContextByComponentName(componentName)
  const controller = Context && useContext(Context)
  return controller as Controller | undefined
}
