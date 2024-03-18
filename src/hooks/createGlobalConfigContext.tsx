import { AnyObj } from "@edsolater/fnkit"
import { createContext, useContext } from "solid-js"
import { createStore, produce } from "solid-js/store"

export function createGlobalConfigContext<Config extends AnyObj>(defaultGlobalConfig: Config) {
  const [storedGlobalConfig, setStoredGlobalConfig] = createStore<Config>(defaultGlobalConfig as any)
  const context = createContext(defaultGlobalConfig)

  // setStore has produce in it
  function setAppConfig(change: (config: Config) => void) {
    setStoredGlobalConfig(produce(change))
  }

  function useGlobalConfigContext() {
    const appConfig = useContext(context)
    return { appConfig, setAppConfig }
  }

  function GlobalConfigProvider(props: { children?: any }) {
    // set = setStoredGlobalConfig
    return <context.Provider value={storedGlobalConfig}>{props.children}</context.Provider>
  }

  return {
    /** just a normal context */
    GlobalConfigProvider,
    useGlobalConfigContext,
    setStoredGlobalConfig,
    storedGlobalConfig,
  }
}
