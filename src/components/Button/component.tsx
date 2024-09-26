import {
  type MayArray,
  type MayFn,
  type Booleanable,
  invoke,
  isMeanfulArray,
  arrify,
  shrinkFn,
  flap,
  mergeObjects,
} from "@edsolater/fnkit"
import { type Accessor, createMemo, createEffect } from "solid-js"
import { loadButtonDefaultICSS } from "./variants"
import { type KitProps, useKitProps } from "../../createKit"
import { createRef, createLazyMemo } from "../../hooks"
import { mergeProps, Piv, renderHTMLDOM, omitProps, shrinkPivChildren, type PivProps } from "../../piv"
import { icssClickable } from "../../styles"
import { useClassRef } from "../../webTools"

export interface ButtonState {
  /** button is active. detected by `props:isActive` */
  isActive: Accessor<boolean>
}
export interface ButtonController extends ButtonState {
  click: () => void
  focus: () => void
}

export const ButtonCSSVariables = {
  mainBgColor: "--Button-bg",
  mainTextColor: "--Button-text",
  hoverBgColor: "--Button-hover-bg",
  outlineWidth: "--Button-outline-width",
}

export const ButtonStateNames = {
  interactive: "interactive", // default
  disabled: "disabled",
}

export const ButtonVariantNames = {
  solid: "solid", // default
  outline: "outline",
  ghost: "ghost",
  plain: "plain", // have button's feature but no outside appearance

  // ---------------- size ----------------
  lg: "lg",
  md: "md", // default
  sm: "sm",
  xs: "xs",
}

export interface ButtonProps {
  /**
   * @default ['solid','md']
   */
  variant?: MayArray<keyof typeof ButtonVariantNames>  // TODO: maybe just use icss is ok here

  /** button is clicked */
  isActive?: boolean

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

export type ButtonKitProps = KitProps<
  ButtonProps,
  { controller: ButtonController; noNeedDeAccessifyProps: ["variant"] }
>
/**
 * feat: build-in click ui effect
 */

export function Button(kitProps: ButtonKitProps) {
  const [dom, setDom] = createRef<HTMLButtonElement>()
  invoke(loadButtonDefaultICSS, undefined, { once: true })

  // ---------------- props ----------------
  const { props, loadController } = useKitProps(kitProps, {
    name: "Button",
    noNeedDeAccessifyChildren: true,
    noNeedDeAccessifyProps: ["variant", "children"], // TODO: should be a build-in noAccessify
  })

  const innerController: ButtonController = {
    isActive: createLazyMemo(() => Boolean(props.isActive)),
    click: () => {
      dom()?.click()
    },
    focus: () => {
      dom()?.focus()
    },
  }
  loadController(innerController)

  // ---------------- validation ----------------
  const failedTestValidator = createMemo(() =>
    isMeanfulArray(props.validators) || props.validators
      ? arrify(props.validators!).find(({ should }) => !shrinkFn(should))
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

  const userInputVariants = flap(props.variant ?? []) as string[]
  // ---------------- stateClass sizeClass and variantClass ----------------
  const { setClassRef: setStateClassRef } = useClassRef(
    Object.assign(
      {
        // [ButtonState.interactive]: isInteractive,
        [ButtonStateNames.disabled]: isDisabled,
      },
      Object.fromEntries(
        Object.entries(ButtonVariantNames).map(([key, variantClass]) => [
          variantClass,
          () => userInputVariants.includes(key),
        ]),
      ),
    ),
  )

  return (
    <Piv<"button">
      defineSelf={(selfProps) => renderHTMLDOM("button", selfProps)}
      shadowProps={omitProps(props, "onClick")} // omit onClick for need to invoke the function manually, see below 👇
      onClick={(arg) => {
        if (!isInteractive()) return
        if ("onClick" in props) {
          const { ev } = arg
          ev.stopPropagation()
          props.onClick?.(mergeObjects(arg, innerController))
        }
      }}
      icss={icssClickable}
      domRef={[setDom, setStateClassRef]}
    >
      {shrinkPivChildren(props.children, [innerController])}
    </Piv>
  )
}
