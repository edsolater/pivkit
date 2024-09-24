import { children, createEffect, createMemo, on, type Accessor, type JSXElement } from "solid-js"
import { PopoverPanel } from "../components"
import { createDisclosure, createDomRef, createUUID } from "../hooks"
import { createPlugin, type Plugin } from "../piv"
import type { PivChild } from "../piv/typeTools"
import { focusFirstFocusableChild, useGestureHover } from "../webTools"
import { useClick } from "../webTools/hooks/useClick"
import { icssClickable } from "../styles"

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
  $debug?: boolean
  /** REQUIRED */
  popElement: (utils: PopupWidgetPluginController) => JSXElement

  /** if set true, popoverMode must be auto */
  defaultOpen?: boolean

  //TODO: imply it !!
  open?: boolean

  isWrapperAddProps?: boolean

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/popover
   *
   * - auto : The popover is shown when the user interacts with the element, and hidden when the user interacts with a different element.
   * - manual : The popover is shown when the user interacts with the element, and remains visible until the user dismisses it.
   */
  popoverMode?: "auto" /* default */ | "manual"
  triggerBy?: "click" /* default */ | "hover"

  elementHtmlTitle?: string
  /** when open popup, focus on the popup panel's first focusable element child */
  shouldFocusChildWhenOpen?: boolean

  onOpen?: () => void
  onClose?: () => void

  /** usually used for popup/tooltip/dropdown/select */
  popupDirection?: PopupDirection
}

export type PopupWidgetPlugin = Plugin<PopupWidgetPluginOptions>

//TODO: move to pivkit
/** special plugin
 *
 * inner use Popover API
 */
export const withPopupWidget: PopupWidgetPlugin = createPlugin((opts) => {
  const options = opts
  const uuid = createUUID()
  const { dom: triggerDom, setDom: setPopoverTriggerDom } = createDomRef()
  const { dom: contentDom, setDom: setPopoverContentDom } = createDomRef()

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
          focusFirstFocusableChild(contentDom())
        }
      }),
    )
  }

  if (options.$debug) {
    createEffect(() => {
      console.log("isOn(): ", isOn())
    })
  }

  //#region ---------------- how to invoke trigger ----------------
  if (options.triggerBy === "hover") {
    useGestureHover([triggerDom, contentDom], {
      onHoverStart: () => open(),
      onHoverEnd: () => close(),
      endDelay: 0.5,
    })
  } else {
    // default triggerBy: click
    useClick(triggerDom, {
      enabled: () => !isOn(),
      onClick: () => toggle(),
    })
  }
  //#endregion

  return () => ({
    domRef: setPopoverTriggerDom,
    icss: [
      {
        // https://developer.chrome.com/blog/anchor-positioning-api?hl=zh-cn
        anchorName: `--pop-anchor-${uuid}`,
      },
      icssClickable(),
    ],
    htmlProps: "htmlTitle" in options ? { title: options.elementHtmlTitle } : undefined,
    defineNextSibling: (
      <PopoverPanel
        $debug={options.$debug}
        domRef={setPopoverContentDom}
        open={isOn}
        isWrapperAddProps={options.isWrapperAddProps}
        popoverMode={options.popoverMode}
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
            positionArea: options.popupDirection ?? ("bottom span-right" as PopupDirection),
            positionTry: "flip-block, flip-inline",
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
