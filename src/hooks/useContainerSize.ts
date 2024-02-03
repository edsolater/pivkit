import { createEffect, createSignal } from 'solid-js'
import { createDomRef } from '..'

/** detect container's size so inner layout can change according to it's context */
export function useContainerSize(options?: { initWidth?: number; initHeight?: number }) {
  const { dom, setDom } = createDomRef()
  const [width, setWidth] = createSignal(options?.initWidth ?? window.innerWidth)
  const [height, setHeight] = createSignal(options?.initHeight ?? window.innerHeight)
  const resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const { width, height } = entry.contentRect
      setWidth(width)
      setHeight(height)
    }
  })
  createEffect(() => {
    const el = dom()
    if (el?.parentElement) {
      resizeObserver.observe(el.parentElement)
    }
  })
  return {
    sizeDetectRef: setDom,
    containerWidth: width,
    containerHeight: height,
  }
}
