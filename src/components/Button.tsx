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

export interface ButtonController {
  click?: () => void
  focus?: () => void
}

export const ButtonCSSVariables = {
  mainBgColor: "--Button-main-bg-color",
  mainTextColor: "--Button-main-text-color",
  outlineWidth: "--Button-outline-width",
}

export const ButtonState = {
  interactive: "_interactive", // default
  disabled: "_disabled",
}

export const ButtonSize = {
  lg: "_lg",
  md: "_md", // default
  sm: "_sm",
  xs: "_xs",
}

export const ButtonVariant = {
  solid: "_solid", // default
  outline: "_outline",
  text: "_text",
}

export interface ButtonProps {
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
    // used in "connect wallet" button, it's order is over props: disabled
    forceInteractive?: boolean
    /**  items are button's setting which will apply when corresponding validator has failed */
    fallbackProps?: Omit<ButtonProps, "validators" | "disabled" | "enabled">
  }>
}

export type ButtonKitProps = KitProps<ButtonProps, { controller: ButtonController }>

/**
 * feat: build-in click ui effect
 */
export function Button(kitProps: ButtonKitProps) {
  const [dom, setDom] = createRef<HTMLButtonElement>()
  loadButtonDefaultICSS()
  const innerController: ButtonController = {
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
    name: "Button",
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
        // [ButtonState.interactive]: isInteractive,
        [ButtonState.disabled]: isDisabled,
      },
      Object.fromEntries(Object.entries(ButtonSize).map(([key, sizeClass]) => [sizeClass, () => props.size === key])),
      Object.fromEntries(
        Object.entries(ButtonVariant).map(([key, variantClass]) => [variantClass, () => props.variant === key]),
      ),
    ),
  )
  // const { setClassRef: setSizeStateClassRef } = useClassRef({md:, }, isActive)

  // ---------------- controller ----------------
  const mergedController =
    "innerController" in props ? mergeObjects(props.innerController!, innerController) : innerController

  return (
    <Piv<"button">
      render:self={(selfProps) => renderHTMLDOM("button", selfProps)}
      shadowProps={omitProps(props, "onClick")} // omit onClick for need to invoke the function manually, see below 👇
      onClick={(...args) => isInteractive() && props.onClick?.(...args)}
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

let hasLoadButtonDefaultICSS = false

/**
 * use global css to style basic button theme
 */
function loadButtonDefaultICSS() {
  if (!hasLoadButtonDefaultICSS) {
    glob({
      "@layer kit-theme": {
        ".Button": {
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
          [`&.${ButtonState.disabled}`]: {
            opacity: ".3",
            cursor: "not-allowed",
          },
          [`&.${ButtonSize.xs}`]: {
            padding: "2px 6px",
            fontSize: "12px",
            borderRadius: "4px",
            [ButtonCSSVariables.outlineWidth]: "0.5px",
          },
          [`&.${ButtonSize.sm}`]: {
            padding: "8px 16px",
            fontSize: "14px",
            borderRadius: "8px",
            [ButtonCSSVariables.outlineWidth]: "1px",
          },
          [`:is(&.${ButtonSize.md}, &${Object.values(ButtonSize)
            .map((c) => `:not(.${c})`)
            .join("")})`]: {
            padding: "10px 16px",
            fontSize: "16px",
            borderRadius: "8px",
            [ButtonCSSVariables.outlineWidth]: "2px",
          },
          [`&.${ButtonSize.xs}`]: {
            padding: "2px 6px",
            fontSize: "12px",
            borderRadius: "4px",
            [ButtonCSSVariables.outlineWidth]: "0.5px",
          },
          [`:is(&.${ButtonVariant.solid}, &${Object.values(ButtonVariant)
            .map((c) => `:not(.${c})`)
            .join("")})`]: {
            backgroundColor: cssColors.component_button_bg_primary,
            "&:hover": {
              filter: "brightness(95%)",
            },
            "&:active": {
              transform: "scale(0.98)",
              filter: "brightness(90%)",
            },
          },
          [`&.${ButtonVariant.outline}`]: {
            backgroundColor: cssColors.transparent,
            outline: `${cssVar(ButtonCSSVariables.outlineWidth)} solid ${cssColors.component_button_bg_primary}`,
            outlineOffset: `calc(-1 * ${cssVar(ButtonCSSVariables.outlineWidth)})`,
            "&:hover": {
              backgroundColor: opacityCSSColor(cssColors.component_button_bg_primary, 0.15),
            },
          },
          [`&.${ButtonVariant.text}`]: {
            backgroundColor: cssColors.transparent,
            "&:hover": {
              backgroundColor: opacityCSSColor(cssColors.component_button_bg_primary, 0.15),
            },
          },
        },
      },
    })
    hasLoadButtonDefaultICSS = true
  }
}
