import { Accessor, createEffect, onCleanup } from 'solid-js'

type InterSectionObserverCallback<Item extends HTMLElement> = (utils: {
  el: Item
  entry: IntersectionObserverEntry
}) => void

export type ObserveFn<Item extends HTMLElement> = (
  item: Item,
  callback: InterSectionObserverCallback<Item>
) => { abort(): void }

/** **DOM API** */
export function useIntersectionObserver<Item extends HTMLElement>(input: {
  rootRef: Accessor<HTMLElement | undefined>
  disabled?: boolean
  options?: IntersectionObserverInit
}): {
  observe: ObserveFn<Item>
  destory(): void
} {
  const registedCallbacks = new WeakMap<Item, (utils: { el: Item; entry: IntersectionObserverEntry }) => void>()
  let intersectionObserver: IntersectionObserver

  // create IntersectionObserver
  createEffect(() => {
    const rootEl = input.rootRef()
    if (!rootEl) return
    if (input.disabled) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as Item
          const registedCallback = registedCallbacks.get(el)
          registedCallback?.({ el, entry })
        })
      },
      { ...input.options, root: rootEl, rootMargin: input.options?.rootMargin ?? '500px' }
    )
    intersectionObserver = observer
    onCleanup(() => observer.disconnect())
  })

  // method observe item
  const observe = (item: Item, callback: (utils: { el: Item; entry: IntersectionObserverEntry }) => void) => {
    intersectionObserver?.observe(item)
    registedCallbacks.set(item, callback)
    return {
      abort() {
        registedCallbacks.delete(item)
        intersectionObserver?.unobserve(item)
      },
    }
  }

  // method unobserve all items
  const destory = () => {
    intersectionObserver?.disconnect()
  }

  return { observe, destory }
}
