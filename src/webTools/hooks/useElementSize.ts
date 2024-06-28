import { Accessor, createSignal, batch, createEffect } from "solid-js"

export function useElementSize(ref: Accessor<HTMLElement | undefined>): {
  width: Accessor<number | undefined>
  height: Accessor<number | undefined>
} {
  const [width, setWidth] = createSignal<number>()
  const [height, setHeight] = createSignal<number>()
  const callback = (entry: ResizeObserverEntry) => {
    const w = entry.contentRect.width
    const h = entry.contentRect.height
    batch(() => {
      setWidth(w)
      setHeight(h)
    })
  }
  const observer = new globalThis.ResizeObserver((entries) => {
    entries.forEach((entry) => callback?.(entry))
  })
  createEffect(() => {
    const el = ref()
    if (el) observer.observe(el)
  })

  return { width, height }
}
