import {
  arrify,
  type Booleanable,
  invoke,
  isMeanfulArray,
  type MayArray,
  type MayFn,
  mergeObjects,
  shrinkFn,
  wrapArr,
} from "@edsolater/fnkit"
import { type Accessor, createEffect, createMemo } from "solid-js"
import { type KitProps, useKitProps } from "../../createKit"
import { createLazyMemo, createRef } from "../../hooks"
import { mergeProps, omitProps, Piv, renderHTMLDOM, shrinkPivChildren } from "../../piv"
import { icssClickable } from "../../styles"
import { useClassRef } from "../../webTools"
import { type ButtonVariant, getIcssPluginByVariant, loadButtonDefaultICSS } from "./variants"

export interface ButtonState {
  /** button is active. detected by `props:isActive` */
  isActive: Accessor<boolean>
}

type BasicController = {
  el(): HTMLButtonElement | undefined
}

export interface ButtonController extends ButtonState, BasicController {
  click: () => void
  focus: () => void
}

export const ButtonStateNames = {
  interactive: "interactive", // default
  disabled: "disabled",
}

export interface ButtonProps {
  variant?: ButtonVariant

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

export type ButtonKitProps = KitProps<ButtonProps, { controller: ButtonController }>
/**
 * feat: build-in click ui effect
 */

export function Button(kitProps: ButtonKitProps) {
  const [dom, setDom] = createRef<HTMLButtonElement>()
  invoke(loadButtonDefaultICSS, undefined, { once: true })

  // ---------------- props ----------------
  const { props, shadowProps, loadController } = useKitProps(kitProps, {
    name: "Button",
    noNeedDeAccessifyChildren: true,
  })

  const vairantIcssPlugins = getIcssPluginByVariant(props.variant)

  const controller: ButtonController = {
    el: dom,
    isActive: createLazyMemo(() => Boolean(props.isActive)),
    click: () => {
      dom()?.click()
    },
    focus: () => {
      dom()?.focus()
    },
  }
  loadController(controller)

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

  // ---------------- stateClass sizeClass and variantClass ----------------
  const { setClassRef: setStateClassRef } = useClassRef(
    Object.assign({
      // [ButtonState.interactive]: isInteractive,
      [ButtonStateNames.disabled]: isDisabled,
    }),
  )

  return (
    <Piv<"button">
      shadowProps={omitProps(shadowProps, "onClick")} // omit onClick for need to invoke the function manually, see below 👇
      defineSelf={(selfProps) => renderHTMLDOM("button", selfProps)}
      onClick={(arg) => {
        if (!isInteractive()) return
        if ("onClick" in props) {
          const { ev } = arg
          ev.stopPropagation()
          props.onClick?.(mergeObjects(arg, controller))
        }
      }}
      icss={[icssClickable, ...vairantIcssPlugins]}
      domRef={[setDom, setStateClassRef]}
    >
      {shrinkPivChildren(props.children, [controller])}
    </Piv>
  )
}

function multiMapByRule<T, R>(arr: T[], fn: (item: T) => R): R[] {
  return arr.map(fn)
}
