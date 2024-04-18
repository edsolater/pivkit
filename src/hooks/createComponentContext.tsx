/****
 *
 * default solidjs's {@link createContext} is readonly
 * {@link createComponentContext} hook is used to create a context with set() , so user can change context value
 *
 ***/

import { AnyObj, omit } from "@edsolater/fnkit"
import { Context, JSXElement, createContext, untrack, useContext } from "solid-js"
import { SetStoreFunction, createStore } from "solid-js/store"

type ComponentContext<O extends AnyObj> = Omit<Context<{ store: O; set: SetStoreFunction<O> }>, "Provider"> & {
  Provider: (props: { value: O; children?: JSXElement }) => JSXElement
}

type ComponentContextSetter<O extends AnyObj> = SetStoreFunction<O>

const contextSetter = Symbol("contextSetter")

/**
 * default solidjs's createContext is readonly
 * {@link createComponentContext} hook is used to create a context with set() , so user can change context value
 */
export function createComponentContext<O extends AnyObj>(): ComponentContext<O> {
  const Context = createContext<{ store: O; set: SetStoreFunction<O> }>({ store: {} as O, set: () => {} })
  const OriginalContextProvider = Context.Provider
  const ContextProvider = (props: { value: O; children?: JSXElement }) => {
    const [contextValue, setContextValue] = createStore(
      untrack(() => ({ ...props.value })) /* it value without symbol(solid-proxy) */,
    )
    return (
      <OriginalContextProvider value={{ store: contextValue, set: setContextValue }}>
        {props.children}
      </OriginalContextProvider>
    )
  }
  // @ts-ignore no need to check
  Context.Provider = ContextProvider
  return Context as any as ComponentContext<O>
}

/**
//  * @deprecated just use {@link useComponentContext}
* {@link useContext} with set() method
 * @return a pair: [contextValue, setContextValue]
 */
export function useComponentContext<O extends AnyObj>(
  context: ComponentContext<O>,
): [contextValue: O, setContext: ComponentContextSetter<O>] {
  // @ts-ignore force
  const { store: contextValue, set: setContext } = useContext(context)
  return [contextValue, setContext]
}

function shakeSymbolKeys<T extends object>(o: T): T {
  const symbolKeys = Object.getOwnPropertySymbols(o)
  return omit(o, symbolKeys as any) as T
}
