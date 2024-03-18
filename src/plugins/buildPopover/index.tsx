import { Accessor, createEffect, onCleanup } from "solid-js"
import { createRef } from "../.."
import { addEventListener } from "../../domkit"
import { useGestureHover } from "../../domkit/hooks/useGestureHover"
import { createTrigger } from "../../hooks/utils/createTrigger"
import { ICSS, PivProps, createPlugin } from "../../piv"
import { PopoverLocationHookOptions, usePopoverLocation } from "./usePopoverLocation"
import { PopPortal } from "../../components/PopPortal"

export type PopoverPluginOptions = Omit<PopoverLocationHookOptions, "isTriggerOn" | "buttonDom" | "panelDom"> & {
  /** @default 'hover' */
  triggerBy?: "hover" | "click"
  defaultOpen?: boolean | Accessor<boolean>
}

/**
 * **headless Hooks**
 * only logic not style
 * when hooks startWith 'make', it means u can use this hook to make a composition of component by plugins
 * @returns
 * - buttonPlugin(Piv): plugin for trigger
 * - popoverPlugin(Piv): plugin for popover
 * - info: accessors about trigger and popover
 */
export function buildPopover(options?: PopoverPluginOptions) {
  const { close, open, toggle, isTriggerOn } = createTrigger({ defaultState: options?.defaultOpen ?? false })

  const [buttonDom, setButtonDom] = createRef<HTMLElement>()
  const [panelDom, setPanelDom] = createRef<HTMLElement>()

  // invoke trigger
  if (options?.triggerBy === "hover") {
    useGestureHover({
      el: buttonDom,
      onHoverStart: open,
      onHoverEnd: close,
    })
  }

  /**
   * in {@link popoverTriggerPlugin}\
   * plugin registerer for trigger
   * @example
   * <Button plugin={buttonPlugin} />
   */
  const popoverTriggerPlugin = createPlugin(() => () => {
    return {
      domRef: setButtonDom,
      onClick: toggle,
    } satisfies Partial<PivProps>
  })

  /**
   * in {@link popoverTriggerPlugin}\
   * plugin registerer for popover content
   * @example
   * <Box plugin={popoverTargetPlugin}>Popover Content</Box>
   */
  const popoverPanelPlugin = createPlugin(
    () => () => {
      // listen to popover toggle event and reflect to trigger state
      createEffect(() => {
        const el = panelDom()
        if (!el) return
        const { abort } = addEventListener(el, "toggle", ({ ev }) => {
          // @ts-expect-error force
          const { newState } = ev as { newState: "open" | "closed" }
          if (newState === "open") {
            open()
          } else {
            close()
          }
        })
        onCleanup(abort)
      })
      const { coorStyle } = usePopoverLocation({
        buttonDom: buttonDom,
        panelDom: panelDom,
        isTriggerOn,
        ...options,
      })
      return {
        get ["render:outWrapper"]() {
          console.log("✅ pick popover plugin")
          return (originalNode) => {
            console.log("✅ load popover plugin")
            return <PopPortal name="popovers">{originalNode}</PopPortal>
          }
        },
        domRef: setPanelDom,
        get if() {
          return isTriggerOn
        },
        get style() {
          return coorStyle()
        },
        get icss() {
          return {
            display: isTriggerOn() ? undefined : "none",
            position: "fixed",
            /** https://semi.design/zh-CN/basic/tokens#z-index */
            zIndex: 1000,
            "@starting-style &": { scale: 0 },
            transition: "500ms",
          } satisfies ICSS
        },
        // htmlProps: { popover: 'manual' } as any, //  lack of correct html type,
      } satisfies Partial<PivProps>
    },
    { name: "popoverPanel" },
  )

  /**
   * in {@link popoverTriggerPlugin}\
   *  public accessors
   */
  const pluginState = {
    buttonDom,
    panelDom,
    isTriggerOn,

    /** open the popover panel */
    open: open,
    close: close,
  }

  return {
    state: pluginState,
    plugins: {
      /** when trigger is invoked, panel will show  */
      trigger: popoverTriggerPlugin,
      panel: popoverPanelPlugin,
    },
  }
}
