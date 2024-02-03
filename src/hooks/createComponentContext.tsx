/****
 *
 * default solidjs's {@link createContext} is readonly
 * {@link createComponentContext} hook is used to create a context with set() , so user can change context value
 *
 ***/

import { AnyObj, omit } from '@edsolater/fnkit'
import { Context, JSXElement, createContext, untrack, useContext } from 'solid-js'
import { SetStoreFunction, createStore } from 'solid-js/store'

type ComponentContext<O extends AnyObj> = Context<{ store: O; set: SetStoreFunction<O> }>

type ComponentContextSetter<O extends AnyObj> = SetStoreFunction<O>

const contextSetter = Symbol('contextSetter')

/**
 * default solidjs's createContext is readonly
 * {@link createComponentContext} hook is used to create a context with set() , so user can change context value
 */
export function createComponentContext<O extends AnyObj>(): ComponentContext<O> {
  const BuildInContext = createContext<{ store: O; set: SetStoreFunction<O> }>({ store: {} as O, set: () => {} })
  const BuildInContextProvider = BuildInContext.Provider
  const ContextProvider = (props: { value: O; children?: JSXElement }) => {
    const [contextValue, setContextValue] = createStore(
      untrack(() => ({ ...props.value })) /* it value without symbol(solid-proxy) */
    )
    return (
      <BuildInContextProvider value={{ store: contextValue, set: setContextValue }}>
        {props.children}
      </BuildInContextProvider>
    )
  }
  // @ts-ignore no need to check
  BuildInContext.Provider = ContextProvider
  return BuildInContext
}

/**
 * {@link useContext} with set() method
 */
export function useComponentContext<O extends AnyObj>(
  context: ComponentContext<O>
): [contextValue: O, setContext: ComponentContextSetter<O>] {
  const { store: contextValue, set: setContext } = useContext(context)
  return [contextValue, setContext]
}

function shakeSymbolKeys<T extends object>(o: T): T {
  const symbolKeys = Object.getOwnPropertySymbols(o)
  return omit(o, symbolKeys as any) as T
}
