import { Booleanable, MayArray, MayFn, flap, isMeanfulArray, mergeObjects, shrinkFn } from "@edsolater/fnkit"
import { createEffect, createMemo } from "solid-js"
import { KitProps, useKitProps } from "../createKit"
import { useClassRef } from "../domkit"
import { createRef } from "../hooks/createRef"
import { Piv, mergeProps, omitProps, parsePivChildren } from "../piv"
import { renderHTMLDOM } from "../piv/propHandlers/renderHTMLDOM"
import { cssVar } from "../styles"
import { cssColors } from "../styles/cssColors"
import { CSSColorString } from "../styles/type"
import { addGlobalCSS } from "../utils/cssGlobalStyle"

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
  interactive: "interactive", // default
  disabled: "disabled",
}

export const ButtonSize = {
  lg: "lg",
  md: "md", // default
  sm: "sm",
  xs: "xs",
}

export const ButtonVariant = {
  solid: "solid", // default
  outline: "outline",
  ghost: "ghost",
}

export interface ButtonProps {
  /**
   * @default 'solid'
   */
  variant?: keyof typeof ButtonVariant
  /**
   * @default 'md'
   */
  size?: keyof typeof ButtonSize

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
      onClick={(...args) => {
        if (!isInteractive()) return
        if ("onClick" in props) {
          const { ev } = args[0]
          ev.stopPropagation()
          props.onClick?.(...args)
        }
      }}
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
    addGlobalCSS(`
      @layer kit-theme {
        .Button {
          transition: 50ms cubic-bezier(0.22, 0.61, 0.36, 1); 
          border: none;
          color: ${cssColors.component_button_text_primary};
          cursor: pointer;
          user-select: none;
          width: max-content;
          display: inline-grid;
          gap: 4px;
          place-content: center;
          font-size: 16px;
          border-radius: 8px;
          font-weight: 500;
          &.${ButtonState.disabled} {
            opacity: .3;
            cursor: not-allowed;
          }
          &.${ButtonSize.xs} {
            padding: 2px 6px;
            font-size: 12px;
            border-radius: 4px;
            ${ButtonCSSVariables.outlineWidth}: 0.5px;
          }
          &.${ButtonSize.sm} {
            padding: 6px 12px;
            font-size: 14px;
            border-radius: 8px;
            ${ButtonCSSVariables.outlineWidth}: 1px;
          }
          :is(&.${ButtonSize.md}, &${Object.values(ButtonSize)
            .map((c) => `:not(.${c})`)
            .join("")}) {
            padding: 10px 16px;
            font-size: 16px;
            border-radius: 8px;
            ${ButtonCSSVariables.outlineWidth}: 2px;
          }
          &.${ButtonSize.lg} {
            //TODO: fixme
            padding: 14px 24px;
            font-size: 16px;
            border-radius: 12px;
            ${ButtonCSSVariables.outlineWidth}: 2px;
          }
          &:is(&.${ButtonVariant.solid}, &${Object.values(ButtonVariant)
            .map((c) => `:not(.${c})`)
            .join("")}) {
            background-color: ${cssColors.component_button_bg_primary};
            &:hover {
              filter: brightness(95%);
            }
            &:active {
              transform: scale(0.98);
              filter: brightness(90%);
            }
          }
          &.${ButtonVariant.outline} {
            background-color: ${cssColors.transparent};
            outline: ${cssVar(ButtonCSSVariables.outlineWidth)} solid ${cssColors.component_button_bg_primary};
            outline-offset: calc(-1 * ${cssVar(ButtonCSSVariables.outlineWidth)});
            &:hover {
              background-color: ${opacityCSSColor(cssColors.component_button_bg_primary, 0.15)};
            }
          }
          &.${ButtonVariant.ghost} {
            background-color: ${cssColors.transparent};
            color: currentcolor;
          }
        }
      }
    `)
    hasLoadButtonDefaultICSS = true
  }
}
