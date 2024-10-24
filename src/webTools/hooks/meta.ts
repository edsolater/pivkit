import { createEffect } from "solid-js"

export function useMetaTitle(title?: string) {
  createEffect(() => {
    if (globalThis.document && title) Reflect.set(globalThis.document ?? {}, "title", title)
  })
}
