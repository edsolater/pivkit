import { createRef } from ".."
import { GestureHoverOptions, GestureHoverStates, useGestureHover } from "../domkit/hooks/useGestureHover"
import { createPlugin } from "../piv"

/**
 *
 * @param options options for useGestureHover
 * @returns
 */
export const useHoverPlugin = createPlugin<Omit<GestureHoverOptions, "el">, GestureHoverStates>((options) => {
  // if this hook need domRef
  const [dom, setDom] = createRef<HTMLElement>()

  // usually, state is created by hook
  const state = useGestureHover({ ...options, el: dom })

  const pluginCore = () => ({ domRef: setDom })
  return {
    plugin: pluginCore,
    state,
  }
})
