import { Accessor, createEffect } from 'solid-js'

/**
 * only itself(ref)
 *
 * this hooks build on assumption: resize of a child will resize his parent. so just observe it's parent node.
 *
 * ResizeObserver is invoked AFTER the DOM is painted.
 * @param ref
 * @param callback
 */
export default function useResizeObserver<El extends HTMLElement>({
  ref,
  callback,
}: {
  ref: Accessor<El | undefined>
  callback?: (utilities: { entry: ResizeObserverEntry; el: El }, observer: ResizeObserver) => unknown
}) {
  const resizeObserver =
    'ResizeObserver' in globalThis
      ? new globalThis.ResizeObserver((entries, observer) => {
          entries.forEach((entry) => callback?.({ entry, el: entry.target as any }, observer))
        })
      : undefined

  function observe(ref: Accessor<El | undefined>) {
    const el = ref()
    if (!el) return
    resizeObserver?.observe(el)
  }

  createEffect(() => {
    observe(ref)
  }, [ref])

  const destory = () => {
    resizeObserver?.disconnect()
  }
  return { destory, observe }
}
