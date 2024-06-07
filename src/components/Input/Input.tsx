import { cacheFn, hasProperty, mergeObjects, runtimeObject } from "@edsolater/fnkit"
import { Accessor, createEffect, createMemo, createSignal, on } from "solid-js"
import { KitProps, useKitProps } from "../../createKit"
import { useElementFocus } from "../../domkit"
import { createDomRef, useShortcutsRegister } from "../../hooks"
import { createDisclosure } from "../../hooks/createDisclosure"
import { createRef } from "../../hooks/createRef"
import { Piv, PivChild, PivProps, parseICSSToClassName } from "../../piv"
import { renderHTMLDOM } from "../../piv/propHandlers/renderHTMLDOM"
import { cssOpacity } from "../../styles"
import { ElementRefs, getElementFromRefs } from "../../utils"
import { DeAccessifyProps } from "../../utils/accessifyProps"
import { Box } from "../Boxes"

export interface InputController {
  text: string
  /** set Input Value */
  setText(newText: string | undefined | ((oldText: string | undefined) => string | undefined)): void
  isFocused: Accessor<boolean>
}

export type InputProps = {
  /**
   * will not apply default icss: `min-width: 10em`
   * input will auto widen depends on content Text
   * @todo
   */
  isFluid?: boolean
  // -------- handle by useInputInnerValue --------
  /** only after `<Input>` created */
  defaultValue?: string
  /** when change, affact to ui*/
  value?: string
  autoFocus?: boolean
  placeholder?: string
  /** default is true */
  disableOutsideValueUpdateWhenUserInput?: boolean
  disableUserInput?: boolean
  // TODO: imply it !!!
  disableOutSideValue?: boolean
  /** disabled = disableOutSideValue + disableUserInput */
  disabled?: boolean
  // only user can trigger this callback
  onUserInput?(text: string | undefined, controller: InputController): void
  // only program can trigger this callback
  onProgramInput?(text: string | undefined, controller: InputController): void
  // onUserInput + onProgramInput
  onInput?(text: string | undefined, controller: InputController & { byUser: boolean }): void
  onEnter?(text: string | undefined, controller: InputController): void
  renderPrefix?: PivChild
  renderSuffix?: PivChild
}

export type InputKitProps = KitProps<InputProps, { controller: InputController }>

/**
 * if for layout , don't render important content in Box
 * TODO: enter should send related button, but shift+enter should "just enter"
 */
export function Input(rawProps: InputKitProps) {
  const { dom: inputBodyDom, setDom: setInputBodyDom } = createDomRef<HTMLInputElement>()
  const isFocused = useElementFocus(inputBodyDom)

  const controller = runtimeObject<InputController>({
    text: () => innerText(),
    setText: () => updateText,
    isFocused: () => isFocused,
  })


  const { props, shadowProps, loadController } = useKitProps(rawProps, {
    name: "Input",
    controller: () => controller,
  })
  loadController(controller)

  const [additionalProps, { innerText, updateText }] = useInputInnerValue(props, controller)
  useShortcutsRegister(
    inputBodyDom,
    {
      "Input Enter": {
        shortcut: "Enter",
        action: () => {
          props.onEnter?.(innerText(), controller)
        },
      },
    },
    { when: isFocused, enabled: !hasProperty(props, "onEnter") },
  )

  // ---------------- auto focus ----------------
  if (props.autoFocus) useAutoFocus(inputBodyDom)

  return (
    <Box shadowProps={shadowProps} icss={basicInputICSS}>
      {props.renderPrefix}
      <Piv<"input">
        shadowProps={additionalProps()}
        domRef={setInputBodyDom}
        htmlProps={{
          placeholder: props.placeholder,
          autofocus: props.autoFocus,
        }}
        render:self={(selfProps) => renderHTMLDOM("input", selfProps)}
        icss={[
          { flex: 1, background: "transparent", minWidth: props.isFluid ? undefined : "14em" },
          /* initialize */
          { border: "none", outline: "none", padding: "4px", fontSize: "0.8333em" },
        ]}
      />
      {props.renderSuffix}
    </Box>
  )
}

const basicInputICSS = cacheFn(() =>
  parseICSSToClassName({
    display: "flex",
    border: "solid",
    borderColor: cssOpacity("currentcolor", 0.2),
    transition: "200ms",
    "&:focus-within": { borderColor: "currentcolor" },
  }),
)

function useAutoFocus(refs: ElementRefs) {
  createEffect(() => {
    const els = getElementFromRefs(refs)
    els.forEach((el) => {
      if (el) {
        focusElement(el)
      }
    })
  })
}

function focusElement(el: HTMLElement) {
  el.focus()
}

/**
 *  handle `<Input>`'s value
 */
function useInputInnerValue(props: DeAccessifyProps<InputKitProps>, controller: InputController) {
  const [inputRef, setInputRef] = createRef<HTMLInputElement>()
  // if user is inputing or just input, no need to update upon out-side value
  const [isFocused, { open: focusInput, close: unfocusInput }] = createDisclosure()
  // store inner value for
  const [cachedOutsideValue, setCachedOutsideValue] = createSignal(props.defaultValue ?? props.value)

  /** DOM content */
  const [innerText, setInnerText] = createSignal(props.defaultValue ?? props.value)

  const updateTextDOMContent = (newText: string | undefined) => {
    const el = inputRef()
    if (el) {
      el.value = newText ?? ""
      setInnerText(newText)
      props.onProgramInput?.(newText, controller)
      props.onInput?.(newText, mergeObjects(controller, { byUser: false }))
    }
  }

  // handle outside value change (will stay selection offset effect)
  const updateTextDOM = (newValue: string | undefined) => {
    const el = inputRef()
    const canChangeInnerValue = !(isFocused() && props.disableOutsideValueUpdateWhenUserInput)
    if (canChangeInnerValue && el) {
      const prevCursorOffsetStart = el.selectionStart ?? 0
      const prevCursorOffsetEnd = el.selectionEnd ?? 0
      const prevRangeDirection = el.selectionDirection ?? undefined
      const prevValue = cachedOutsideValue()
      // set real value by DOM API, for restore selectionRange
      updateTextDOMContent(newValue)
      const needUpdate = prevValue !== newValue && prevValue && newValue

      // restore selectionRange
      if (needUpdate) {
        const isCursor = prevCursorOffsetEnd === prevCursorOffsetStart
        const isCursorAtTail = isCursor && prevCursorOffsetEnd === prevValue.length
        const hasSelectAll = prevCursorOffsetStart === 0 && prevCursorOffsetEnd === prevValue.length
        if (isCursorAtTail) {
          // stay  end
          el.setSelectionRange(newValue.length, newValue.length) // to end
        } else if (hasSelectAll) {
          // stay select all
          el.setSelectionRange(prevCursorOffsetStart, newValue.length, prevRangeDirection) // to end
        } else {
          // stay same range offset
          el.setSelectionRange(prevCursorOffsetStart, prevCursorOffsetEnd, prevRangeDirection)
        }
      }
    }
    // in any case, it will update inner's js cachedOutsideValue
    setCachedOutsideValue(newValue)
  }

  // reflect default text in init lifecycle
  createEffect(on(inputRef, () => updateTextDOMContent(innerText())))

  // handle outside value change (consider selection offset)
  createEffect(
    on(
      () => props.value,
      (newValue) => {
        updateTextDOM(newValue)
      },
    ),
  )

  // update when lose focus
  createEffect(
    on(
      () => isFocused() === false,
      () => {
        setCachedOutsideValue(props.value)
      },
    ),
  )

  const additionalProps = createMemo(
    () =>
      ({
        domRef: setInputRef,
        htmlProps: {
          disabled: props.disabled,
          onBeforeInput: (ev: Event) => {
            // onBeforeInput to prevent user input
            if (props.disableUserInput) {
              ev.preventDefault()
            }
          },
          onInput: (e: Event) => {
            const text = (e.target as HTMLInputElement).value
            setInnerText(text)
            props.onInput?.(text, mergeObjects(controller, { byUser: true }))
            props.onUserInput?.(text, controller)
          },
          onFocus: focusInput,
          onBlur: unfocusInput,
        },
      }) as PivProps<"input">,
  )
  return [
    additionalProps,
    {
      innerText,
      updateText: updateTextDOMContent,
      cachedOutsideValue,
      isFocused,
      focusInput,
      unfocusInput,
      setCachedOutsideValue,
    },
  ] as const
}
