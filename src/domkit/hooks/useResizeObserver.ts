import { Accessor, createEffect, on } from 'solid-js'
import { ElementRefs, getElementFromRefs } from '../../utils'

/**
 * only itself(ref)
 *
 * this hooks build on assumption: resize of a child will resize his parent. so just observe it's parent node.
 *
 * @param refs
 * @param callback
 */
export default function useResizeObserver<El extends HTMLElement>(
  refs: Accessor<ElementRefs>,
  callback?: (utilities: { entry: ResizeObserverEntry; el: El }) => unknown
): { destory: () => void } {
  const resizeObserver =
    'ResizeObserver' in globalThis
      ? new globalThis.ResizeObserver((entries) => {
          entries.forEach((entry) => callback?.({ entry, el: entry.target as any }))
        })
      : undefined

  createEffect(() => {
    if (!resizeObserver) return
    if (!('observe' in resizeObserver)) return
    for (const el of getElementFromRefs(refs())) {
      if (el) {
        resizeObserver.observe(el)
      }
    }
  })

  const destory = () => {
    resizeObserver?.disconnect()
  }
  return { destory }
}
