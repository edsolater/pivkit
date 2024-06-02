import { flap, isMeanfulArray, MayArray, MayFn, mergeObjects, shrinkFn, Booleanable } from "@edsolater/fnkit"
import { glob } from "goober"
import { createEffect, createMemo } from "solid-js"
import { KitProps, useKitProps } from "../createKit"
import { useClassRef } from "../domkit"
import { createRef } from "../hooks/createRef"
import { mergeProps, omitProps, parsePivChildren, Piv, PivChild } from "../piv"
import { renderHTMLDOM } from "../piv/propHandlers/renderHTMLDOM"
import { cssVar } from "../styles"
import { cssColors } from "../styles/cssColors"
import { CSSColorString } from "../styles/type"

export interface RadioController {
  click?: () => void
  focus?: () => void
}

export const RadioCSSVariables = {
  mainBgColor: "--Radio-main-bg-color",
  mainTextColor: "--Radio-main-text-color",
  outlineWidth: "--Radio-outline-width",
}

export const RadioState = {
  interactive: "_interactive",
  disabled: "_disabled",
}

export const RadioSize = {
  lg: "_lg",
  md: "_md",
  sm: "_sm",
  xs: "_xs",
}

export const RadioVariant = {
  solid: "_solid",
  outline: "_outline",
  text: "_text",
}

export interface RadioProps {
  /**
   * @default 'solid'
   */
  variant?: "solid" | "outline" | "text"
  /**
   * @default 'md'
   */
  size?: "xs" | "sm" | "md" | "lg"

  /** a short cut for validator */
  disabled?: boolean
  enabled?: boolean
  /** must all condition passed */
  validators?: MayArray<{
    /** must return true to pass this validator */
    should: MayFn<Booleanable>
    // used in "connect wallet" radio, it's order is over props: disabled
    forceInteractive?: boolean
    /**  items are radio's setting which will apply when corresponding validator has failed */
    fallbackProps?: Omit<RadioProps, "validators" | "disabled" | "enabled">
  }>
}

export type RadioKitProps = KitProps<RadioProps, { controller: RadioController }>

/**
 * feat: build-in click ui effect
 */
export function Radio(kitProps: RadioKitProps) {
  const [dom, setDom] = createRef<HTMLInputElement>()
  loadRadioDefaultICSS()
  const innerController: RadioController = {
    click: () => {
      dom()?.click()
    },
    focus: () => {
      dom()?.focus()
    },
  }

  // ---------------- props ----------------
  const { props } = useKitProps(kitProps, {
    controller: () => innerController,
    name: "Radio",
    defaultProps: { variant: "solid", size: "md" },
  })

  // ---------------- validation ----------------
  const failedTestValidator = createMemo(() =>
    isMeanfulArray(props.validators) || props.validators
      ? flap(props.validators!).find(({ should }) => !shrinkFn(should))
      : undefined,
  )
  const mergedProps = mergeProps(props, failedTestValidator()?.fallbackProps)

  const isInteractive = createMemo(
    () =>
      failedTestValidator()?.forceInteractive ||
      (!failedTestValidator() && "enabled" in mergeProps ? mergedProps.enabled : !mergedProps.disabled),
  )
  const isDisabled = createMemo(() => !isInteractive())

  // ---------------- affect disable state to DOM ----------------
  createEffect(() => {
    const el = dom()
    if (!el) return
    if (isDisabled()) {
      el.disabled = true
    } else {
      el.disabled = false
    }
  })

  // ---------------- stateClass sizeClass and variantClass ----------------
  const { setClassRef: setStateClassRef } = useClassRef(
    Object.assign(
      {
        [RadioState.interactive]: isInteractive,
        [RadioState.disabled]: isDisabled,
      },
      Object.fromEntries(
        Object.entries(RadioSize).map(([key, sizeClass]) => [sizeClass, () => (props.size ?? "md") === key]),
      ),
      Object.fromEntries(
        Object.entries(RadioVariant).map(([key, variantClass]) => [
          variantClass,
          () => (props.variant ?? "solid") === key,
        ]),
      ),
    ),
  )
  // const { setClassRef: setSizeStateClassRef } = useClassRef({md:, }, isActive)

  // ---------------- controller ----------------
  const mergedController =
    "innerController" in props ? mergeObjects(props.innerController!, innerController) : innerController

  return (
    <Piv<"input">
      render:self={(selfProps) => renderHTMLDOM("input", selfProps)}
      shadowProps={omitProps(props, "onClick")} // omit onClick for need to invoke the function manually, see below 👇
      onClick={(...args) => isInteractive() && props.onClick?.(...args)}
      htmlProps={{ type: "radio" }}
      domRef={[setDom, setStateClassRef]}
    >
      {parsePivChildren(props.children, mergedController)}
    </Piv>
  )
}

/**
 * @todo TEMP, currently force it, should use NPM css color utils
 */
export function opacityCSSColor(cssColor: CSSColorString, /* 0~1 */ opacity: number) {
  return cssColor === cssColors.component_button_bg_primary ? "#7c859826" /* 0.15 */ : `${cssColor}${opacity}` //TODO: temp
}

let hasLoadRadioDefaultICSS = false

/**
 * use global css to style basic radio theme
 */
function loadRadioDefaultICSS() {
  if (!hasLoadRadioDefaultICSS) {
    glob({
      "@layer kit-theme": {
        ".Radio": {
          transition: "50ms cubic-bezier(0.22, 0.61, 0.36, 1)", // make it's change smooth
          border: "none",
          color: cssColors.component_button_text_primary, // light mode
          cursor: "pointer",
          userSelect: "none",
          width: "max-content",
          display: "inline-grid",
          gap: "4px",
          placeContent: "center",
          fontSize: "16px",
          borderRadius: "8px",
          fontWeight: "500",
          [`&.${RadioState.disabled}`]: {
            opacity: ".3",
            cursor: "not-allowed",
          },
          [`&.${RadioSize.xs}`]: {
            padding: "2px 6px",
            fontSize: "12px",
            borderRadius: "4px",
            [RadioCSSVariables.outlineWidth]: "0.5px",
          },
          [`&.${RadioSize.sm}`]: {
            padding: "8px 16px",
            fontSize: "14px",
            borderRadius: "8px",
            [RadioCSSVariables.outlineWidth]: "1px",
          },
          [`&.${RadioSize.md}`]: {
            padding: "10px 16px",
            fontSize: "16px",
            borderRadius: "8px",
            [RadioCSSVariables.outlineWidth]: "2px",
          },
          [`&.${RadioSize.xs}`]: {
            padding: "2px 6px",
            fontSize: "12px",
            borderRadius: "4px",
            [RadioCSSVariables.outlineWidth]: "0.5px",
          },
          [`&.${RadioVariant.solid}`]: {
            backgroundColor: cssColors.component_button_bg_primary,
            "&:hover": {
              filter: "brightness(95%)",
            },
            "&:active": {
              transform: "scale(0.98)",
              filter: "brightness(90%)",
            },
          },
          [`&.${RadioVariant.outline}`]: {
            backgroundColor: cssColors.transparent,
            outline: `${cssVar(RadioCSSVariables.outlineWidth)} solid ${cssColors.component_button_bg_primary}`,
            outlineOffset: `calc(-1 * ${cssVar(RadioCSSVariables.outlineWidth)})`,
            "&:hover": {
              backgroundColor: opacityCSSColor(cssColors.component_button_bg_primary, 0.15),
            },
          },
          [`&.${RadioVariant.text}`]: {
            backgroundColor: cssColors.transparent,
            "&:hover": {
              backgroundColor: opacityCSSColor(cssColors.component_button_bg_primary, 0.15),
            },
          },
        },
      },
    })
    hasLoadRadioDefaultICSS = true
  }
}
