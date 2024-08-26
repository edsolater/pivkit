import { addDefaultProperties } from "@edsolater/fnkit"
import { createEffect, createMemo, on, type Accessor } from "solid-js"
import type { PivChild } from "../piv/typeTools"
import { PopoverPanel } from "../components"
import { createUUID, createDomRef, createDisclosure } from "../hooks"
import { createPlugin, type Plugin } from "../piv"
import { focusFirstFocusableChild } from "../webTools"

export type PopupWidgetPluginController = {
  isOpen: Accessor<boolean>
  openPopup: () => void
  closePopup: () => void
  togglePopup: () => void
}

/** for {@link PopupDirection} */
type BaseDir = "top" | "bottom" | "left" | "right" | "center"
/** just util for {@link PopupDirection} */
type NoSameDirection<D extends BaseDir> = D extends "top" | "bottom"
  ? "left" | "right"
  : D extends "left" | "right"
    ? "top" | "bottom"
    : never
export type PopupDirection =
  | BaseDir
  | `${BaseDir} ${"center" | NoSameDirection<BaseDir> | `span-${NoSameDirection<BaseDir>}`}`

export type PopupWidgetPluginOptions = {
  /** REQUIRED */
  popElement: (utils: PopupWidgetPluginController) => PivChild

  defaultOpen?: boolean

  //TODO: imply it !!
  open?: boolean

  noStyle?: boolean

  isWrapperAddProps?: boolean
  /** user can close popup panel when user click the outside */
  canBackdropClose?: boolean

  /** when open popup, focus on the popup panel's first focusable element child */
  shouldFocusChildWhenOpen?: boolean

  onOpen?: () => void
  onClose?: () => void

  /** usually used for popup/tooltip/dropdown/select */
  popupDirection?: PopupDirection
}

export type PopupWidgetPlugin = Plugin<PopupWidgetPluginOptions>

//TODO: move to pivkit
/** special plugin */
export const withPopupWidget: PopupWidgetPlugin = createPlugin((opts) => {
  const options = addDefaultProperties(opts, { noStyle: true })
  const uuid = createUUID()
  const { dom: popoverTriggerDom, setDom: setPopoverTriggerDom } = createDomRef()
  const { dom: popoverContentDom, setDom: setPopoverContentDom } = createDomRef()

  const [isOn, { toggle, open, close }] = createDisclosure(options.defaultOpen, {
    onToggle(toOpen) {
      if (toOpen) {
        options.onOpen?.()
      } else {
        options.onClose?.()
      }
    },
  })

  const controller: PopupWidgetPluginController = {
    isOpen: isOn,
    openPopup: open,
    closePopup: close,
    togglePopup: toggle,
  }

  const gapInfo = createMemo(() => getPanelGapDirection(options.popupDirection ?? "bottom span-right"))

  if (options.shouldFocusChildWhenOpen) {
    createEffect(
      on(isOn, (on) => {
        if (on) {
          focusFirstFocusableChild(popoverContentDom())
        }
      }),
    )
  }

  return () => ({
    domRef: setPopoverTriggerDom,
    icss: {
      // https://developer.chrome.com/blog/anchor-positioning-api?hl=zh-cn
      anchorName: `--pop-anchor-${uuid}`,
    },
    onClick: ({ ev }) => {
      open()
    },
    defineNextSibling: (
      <PopoverPanel
        domRef={setPopoverContentDom}
        open={isOn}
        isWrapperAddProps={options.isWrapperAddProps}
        canBackdropClose={options.canBackdropClose}
        icss={[
          {
            marginRight: gapInfo().leftHaveGap ? "8px" : undefined,
            marginLeft: gapInfo().rightHaveGap ? "8px" : undefined,
            marginBottom: gapInfo().topHaveGap ? "8px" : undefined,
            marginTop: gapInfo().bottomHaveGap ? "8px" : undefined,

            position: "fixed",
            positionAnchor: `--pop-anchor-${uuid}`,
            // top: "anchor(top)",
            // left: "anchor(left)",
            // right: "anchor(right)",
            // bottom: "anchor(bottom)",
            insetArea: options.popupDirection ?? ("bottom span-right" as PopupDirection),
            positionTryOptions: "flip-block, flip-inline",
          },
        ]}
        onClose={() => {
          close()
        }}
      >
        {options.popElement(controller)}
      </PopoverPanel>
    ),
  })
})

/**
 * get gap from  input direction
 * @param popupDirection
 * @returns gap info
 */
function getPanelGapDirection(popupDirection: PopupDirection): {
  leftHaveGap: boolean
  rightHaveGap: boolean
  topHaveGap: boolean
  bottomHaveGap: boolean
} {
  return {
    topHaveGap: /(?<![\w-])top(?![\w-])/.test(popupDirection),
    bottomHaveGap: /(?<![\w-])bottom(?![\w-])/.test(popupDirection),
    leftHaveGap: /(?<![\w-])left(?![\w-])/.test(popupDirection),
    rightHaveGap: /(?<![\w-])right(?![\w-])/.test(popupDirection),
  }
}
