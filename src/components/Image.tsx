import { createEffect, createSignal, onCleanup } from "solid-js"
import { listenDomEvent } from "../webTools"
import { createRef } from "../hooks"
import { renderHTMLDOM } from "../piv/propHandlers/renderHTMLDOM"

import { KitProps, useKitProps } from "../createKit"
import { Piv } from "../piv"
export interface ImageController {}

export interface ImageProps {
  /**
   *  also accept multi srcs
   */
  src?: string | string[]
  fallbackSrc?: string
  /**
   *  for readability
   */
  alt?: string

  // TODO: imply it!!!
  resizeable?: boolean
  /** @default 'lazy' */
  loading?: "lazy" | "eager"

  "css:width"?: string
  "css:height"?: string
}

export type ImageKitProps = KitProps<ImageProps, { controller: ImageController }>

const defaultProps = {} as const satisfies Partial<ImageKitProps>

export type DefaultImageProps = typeof defaultProps
/**
 * if for layout , don't render important content in Box
 * @todo add fallbackSrc
 */
export function Image(rawProps: ImageKitProps) {
  // TODO is load
  const [isLoaded, setIsLoaded] = createSignal(false)
  const [dom, setDom] = createRef<HTMLImageElement>()
  const { props, shadowProps } = useKitProps(rawProps, { name: "Image", defaultProps })

  createEffect(() => {
    const { cancel } = listenDomEvent(dom(), "load", () => {
      setIsLoaded(true)
    })
    onCleanup(cancel)
  })
  /* ---------------------------------- props --------------------------------- */
  return (
    <Piv<"img">
      domRef={setDom}
      class="Image"
      defineSelf={(selfProps) => renderHTMLDOM("img", selfProps)}
      htmlProps={{ src: String(props.src), alt: props.alt, loading: props.loading ?? "lazy" }}
      icss={{
        display: "block",
        opacity: isLoaded() ? undefined : "0",
      }}
      shadowProps={shadowProps}
    />
  )
}
