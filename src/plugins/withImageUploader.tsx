import { createEffect, onCleanup, type Accessor, type JSXElement } from "solid-js"
import { PluginWrapper } from "../components"
import { type KitProps, useKitProps } from "../createKit"
import { createDomRef, createSyncSignal } from "../hooks"
import { createPlugin, type PivProps, type Plugin } from "../piv"
import { cssOpacity } from "../styles"

export type ImageUploaderPluginController = {
  isEnabled: Accessor<boolean>
}

export type ImageUploaderPluginOptions = {
  /** for debug */
  $debug?: string
  /**
   * directly can type , or only type when js callback was trigger.
   * usually, u should pass a accessor as a signal
   **/
  isEnabled?: boolean
  /** with onEnabledChange, it will be a two-way binding */
  onEnabledChange?: (isEnabled: boolean) => void
  /** when innerText is empty. placeholderText will always has .4 opacity */
  placeholder?: string
  onImagePaste?: (imageBlob: Blob) => void
  /**
   * start edit when click
   * @default true
   */
  startEditWhenClick?: boolean
  /**
   * use more strightforward enter to
   * @default true
   */
  okWhenTypeEnter?: boolean
  /** init cursor position
   * @default "end"
   */
  initEditCursorPlacement?: "start" | "end"
}

export type ImageUploaderPluginKitOptions = KitProps<ImageUploaderPluginOptions>

//TODO: contentimageUploader should also be a buildin plugin in `<Text />`
/** special plugin */
export const withImageUploader: Plugin<ImageUploaderPluginKitOptions, ImageUploaderPluginController> = createPlugin(
  (kitOptions) => {
    const { props: options } = useKitProps(kitOptions, {
      defaultProps: {
        startEditWhenClick: true,
        okWhenTypeEnter: true,
        initEditCursorPlacement: "end",
      },
    })
    const { dom: selfDom, setDom: setSelfDom } = createDomRef()

    createEffect(() => {
      const el = selfDom()
      if (!el) return
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            const imageElement = Array.from(mutation.addedNodes).find(isHTMLImg) as HTMLImageElement
            const src = getImageSrc(imageElement)
            const blob = base64ImageStringToBlob(src)
            options.onImagePaste?.(blob)
          }
        })
      })
      observer.observe(el, { childList: true })
      onCleanup(() => {
        observer.disconnect()
      })
    })

    const [inPluginEnabled, setIsPluginEnabled] = createSyncSignal({
      value: () => Boolean(options.isEnabled),
      onSet(value) {
        options.onEnabledChange?.(value)
      },
    })

    return {
      plugin: () =>
        ({
          domRef: (el) => setSelfDom(el),
          htmlProps: {
            contentEditable: "inherit",
          },
          icss: () => ({
            "&:empty": {
              color: cssOpacity("currentColor", 0.4),
              "&::before": {
                content: "attr(data-placeholder)",
              },
            },
          }),
        }) as PivProps,
      state: { isEnabled: inPluginEnabled },
    }
  },
)

/** component version of {@link withImageUploader} */
export function ImageUploaderPluginWrapper(
  rawProps: Omit<ImageUploaderPluginKitOptions, "children"> & {
    children?: (state: ImageUploaderPluginController) => JSXElement
  },
) {
  return (
    <PluginWrapper plugin={withImageUploader} isEnabled={rawProps.isEnabled} onImagePaste={rawProps.onImagePaste}>
      {rawProps.children}
    </PluginWrapper>
  )
}

/**
 * Retrieves the source URL of an image element.
 *
 * @param img - The HTMLImageElement to retrieve the source URL from.
 * @returns The source URL of the image.
 */
function getImageSrc(img: HTMLImageElement) {
  return img.src
}

/**
 *
 * Checks if a given node is an instance of HTMLImageElement.
 *
 * @param node - The node to check.
 * @returns True if the node is an instance of HTMLImageElement, false otherwise.
 */
const isHTMLImg = (node: Node): boolean => node instanceof HTMLImageElement

/**
 * util function
 *
 * Converts a prefixed base64 image string to a Blob object.
 *
 * @param base64String - The base64 image string to convert.
 * @returns A Blob object representing the image.
 * @throws {Error} If the base64 image string is invalid.
 * @example
 * const base64String = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAABkCAYAAABue..."
 * const blob = base64ImageStringToBlob(base64String)
 */
function base64ImageStringToBlob(base64String: string) {
  const matches = base64String.match(/^data:image\/([a-zA-Z0-9]+);base64,/)
  if (!matches) {
    throw new Error("Invalid base64 image string")
  }
  const imageType = matches[1]
  const unprefixedBase64Data = base64String.replace(/^data:image\/[a-zA-Z0-9]+;base64,/, "")
  return base64ToBlob(unprefixedBase64Data, `image/${imageType}`)
}

/**
 * util function
 *
 * Converts a raw base64 string to a Blob object.
 *
 * @param base64String - The base64 string to convert.
 * @param type - The MIME type of the resulting Blob object.
 * @returns A Blob object representing the converted base64 string.
 *
 * @example
 * const base64String = "iVBORw0KGgoAAAANSUhEUgAAABQAAABkCAYAAABue..."
 * const blob = base64ToBlob(base64String, "image/png")
 */
function base64ToBlob(base64String: string, type: string) {
  const binStr = atob(base64String)
  const len = binStr.length
  const arr = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    arr[i] = binStr.charCodeAt(i)
  }
  return new Blob([arr], { type })
}
