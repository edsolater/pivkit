import { createDomRef } from '@edsolater/pivkit'
import useResizeObserver from './useResizeObserver'

// used in props:ref so can have multiple features
export function useElementResize<El extends HTMLElement>(
  callback?: (utilities: { entry: ResizeObserverEntry; el: El }) => unknown,
): { ref: (el: El) => void; destory: () => void } {
  const { dom, setDom } = createDomRef<El>()
  const { destory } = useResizeObserver(dom, callback)
  return { ref: setDom, destory }
}
