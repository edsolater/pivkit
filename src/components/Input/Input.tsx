import { cacheFn, hasProperty, mergeObjects, runtimeObject, shrinkFn } from "@edsolater/fnkit"
import { Accessor, createEffect, createMemo, createSignal, on, onCleanup } from "solid-js"
import { KitProps, useKitProps } from "../../createKit"
import { listenDomEvent, useElementFocus } from "../../webTools"
import { createDomRef, createHistoryAccessor, useHistoryComparer, useShortcutsRegister } from "../../hooks"
import { createRef } from "../../hooks/createRef"
import { Piv, parseICSSToClassName, type PivProps } from "../../piv"
import { renderHTMLDOM } from "../../piv/propHandlers/renderHTMLDOM"
import { cssOpacity } from "../../styles"
import { ElementRefs, getElementFromRefs } from "../../utils"
import { type Accessify } from "../../utils/accessifyProps"
import { Box } from "../Boxes"

export interface InputController {
  text: string | undefined
  /** set Input Value */
  setText(newText: string | undefined | ((oldText: string | undefined) => string | undefined)): void
  isFocused: Accessor<boolean>
}

// TODO: too complicated!! should easier
export interface InputProps {
  /**
   * will not apply default icss: `min-width: 10em`
   * input will auto widen depends on content Text
   * @todo
   */
  isFluid?: boolean
  propsofInnerInput?: PivProps<"input">
  // -------- handle by useInputInnerValue --------
  /** only after `<Input>` created */
  defaultValue?: string
  /** when change, affact to ui*/
  value?: string
  autoFocus?: boolean

  placeholder?: string
  /** disabled = disableOutSideValue + disableUserInput */
  disabled?: boolean
  // onUserInput + onProgramInput
  onInput?(text: string | undefined, controller: InputController & { byUser: boolean }): void
  onEnter?(text: string | undefined, controller: InputController): void
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
    setText: () => setText,
    isFocused: () => isFocused,
  })

  const { props, shadowProps, loadController } = useKitProps(rawProps, { name: "Input" })
  loadController(controller)

  const { innerText, setText, setDomRef } = useInputValue({
    value: () => props.value,
    defaultValue: () => props.defaultValue,
    onInput: (text, { byUser }) => props.onInput?.(text, mergeObjects(controller, { byUser })),
    onEnter: (text) => props.onEnter?.(text, controller),
  })

  // ---------------- auto focus ----------------
  if (props.autoFocus) useAutoFocus(inputBodyDom)

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
    { enabled: !hasProperty(props, "onEnter") },
  )

  return (
    <Box shadowProps={shadowProps} icss={basicInputICSS}>
      <Piv<"input">
        shadowProps={props.propsofInnerInput}
        domRef={[setInputBodyDom, setDomRef]}
        htmlProps={{
          placeholder: props.placeholder,
          autofocus: props.autoFocus,
        }}
        defineSelf={(selfProps) => renderHTMLDOM("input", selfProps)}
        icss={[
          { flex: 1, background: "transparent", minWidth: props.isFluid ? undefined : "14em" },
          /* initialize */
          { border: "none", outline: "none", padding: "4px", fontSize: "0.8333em" },
        ]}
      />
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

// /**
//  *  handle `<Input>`'s value(merge from bonsai)
//  */
// function useInputValue(props: DeAccessifyProps<InputKitProps>, controller: InputController) {
//   const [inputRef, setInputRef] = createRef<HTMLInputElement>()
//   // if user is inputing or just input, no need to update upon out-side value
//   const [isFocused, { open: focusInput, close: unfocusInput }] = createDisclosure()

//   const inputDefaultValue = props.defaultValue ?? props.value
//   console.log('inputDefaultValue: ', inputDefaultValue)
//   // store inner value for
//   const [cachedOutsideValue, setCachedOutsideValue] = createSignal(inputDefaultValue)

//   /** DOM content */
//   const [innerText, setInnerText] = createSignal(inputDefaultValue)

//   const updateTextDOMContent = (newText: string | undefined) => {
//     const el = inputRef()
//     if (el) {
//       el.value = newText ?? ""
//       setInnerText(newText)
//       props.onProgramInput?.(newText, controller)
//       props.onInput?.(newText, mergeObjects(controller, { byUser: false }))
//     }
//   }

//   // handle outside value change (will stay selection offset effect)
//   const updateTextDOM = (newValue: string | undefined) => {
//     const el = inputRef()
//     const canChangeInnerValue = !(isFocused() && props.disableOutsideValueUpdateWhenUserInput)
//     if (canChangeInnerValue && el) {
//       const prevCursorOffsetStart = el.selectionStart ?? 0
//       const prevCursorOffsetEnd = el.selectionEnd ?? 0
//       const prevRangeDirection = el.selectionDirection ?? undefined
//       const prevValue = cachedOutsideValue()
//       // set real value by DOM API, for restore selectionRange
//       updateTextDOMContent(newValue)
//       const needUpdate = prevValue !== newValue && prevValue && newValue

//       // restore selectionRange
//       if (needUpdate) {
//         const isCursor = prevCursorOffsetEnd === prevCursorOffsetStart
//         const isCursorAtTail = isCursor && prevCursorOffsetEnd === prevValue.length
//         const hasSelectAll = prevCursorOffsetStart === 0 && prevCursorOffsetEnd === prevValue.length
//         if (isCursorAtTail) {
//           // stay  end
//           el.setSelectionRange(newValue.length, newValue.length) // to end
//         } else if (hasSelectAll) {
//           // stay select all
//           el.setSelectionRange(prevCursorOffsetStart, newValue.length, prevRangeDirection) // to end
//         } else {
//           // stay same range offset
//           el.setSelectionRange(prevCursorOffsetStart, prevCursorOffsetEnd, prevRangeDirection)
//         }
//       }
//     }
//     // in any case, it will update inner's js cachedOutsideValue
//     setCachedOutsideValue(newValue)
//   }

//   // reflect default text in init lifecycle
//   createEffect(on(inputRef, () => updateTextDOMContent(innerText())))

//   // handle outside value change (consider selection offset)
//   createEffect(
//     on(
//       () => props.value,
//       (newValue) => {
//         updateTextDOM(newValue)
//       },
//     ),
//   )

//   // update when lose focus
//   createEffect(
//     on(
//       () => isFocused() === false,
//       () => {
//         setCachedOutsideValue(props.value)
//       },
//     ),
//   )

//   const additionalProps = createMemo(
//     () =>
//       ({
//         domRef: setInputRef,
//         htmlProps: {
//           disabled: props.disabled,
//           onBeforeInput: (ev: Event) => {
//             // onBeforeInput to prevent user input
//             if (props.disableUserInput) {
//               ev.preventDefault()
//             }
//           },
//           onInput: (e: Event) => {
//             const text = (e.target as HTMLInputElement).value
//             setInnerText(text)
//             props.onInput?.(text, mergeObjects(controller, { byUser: true }))
//             props.onUserInput?.(text, controller)
//           },
//           onFocus: focusInput,
//           onBlur: unfocusInput,
//         },
//       }) as PivProps<"input">,
//   )
//   return [
//     additionalProps,
//     {
//       innerText,
//       updateText: updateTextDOMContent,
//       cachedOutsideValue,
//       isFocused,
//       focusInput,
//       unfocusInput,
//       setCachedOutsideValue,
//     },
//   ] as const
// }

function useInputValue(props: {
  value?: Accessify<string | undefined>
  defaultValue?: Accessify<string | undefined>
  onInput?(text: string | undefined, payload: { byUser: boolean }): void
  onEnter?(text: string | undefined): void
}) {
  const [inputRef, setInputRef] = createRef<HTMLInputElement>()

  const inputDefaultValueAccessor = createMemo(() => shrinkFn(props.defaultValue))
  const inputValueAccessor = createMemo(() => shrinkFn(props.value))

  const [jsInnerText, setJSInnerText] = createSignal(inputDefaultValueAccessor() ?? inputValueAccessor())
  const [domInnerText, setDomInnerText] = createSignal(jsInnerText())

  const jsInnerTextHistory = createHistoryAccessor(jsInnerText)
  const domInnerTextHistory = createHistoryAccessor(domInnerText)
  const { aIsNewer: isInputFromBrowser } = useHistoryComparer(jsInnerTextHistory, domInnerTextHistory)

  // props.value -> jsInnerText
  createEffect(
    on(
      inputValueAccessor,
      (v) => {
        setJSInnerText(v)
      },
      { defer: true },
    ),
  )

  /** REFLECT real DOM's value -> {@link domInnerText} */
  createEffect(
    on(inputRef, () => {
      const { cancel } = listenDomEvent(inputRef(), "input", ({ el, ev }) => {
        if (!el) return
        const value = el.value
        if (domInnerText() !== value) {
          setDomInnerText(value)
        }
      })
      onCleanup(cancel)
    }),
  )

  /** REFLECT {@link domInnerText} -> real DOM's value */
  createEffect(
    on(domInnerText, (value) => {
      const el = inputRef()
      if (!el) return
      const realDOMValue = el?.value
      if (el && value != realDOMValue) {
        el.value = value ?? ""
      }
    }),
  )

  // sync domInnerValue with jsInnerText
  createEffect(
    on(domInnerText, (v) => {
      setJSInnerText(v)
    }),
  )
  createEffect(
    on(jsInnerText, (v) => {
      setDomInnerText(v)
    }),
  )

  // handle onInput by jsInnerText
  createEffect(
    on(
      jsInnerText,
      (value) => {
        props.onInput?.(value, { byUser: isInputFromBrowser() })
      },
      { defer: true },
    ),
  )

  // handle dom keyboard:enter
  createEffect(
    on(inputRef, (el) => {
      const { cancel } = listenDomEvent(el, "keydown", ({ ev }) => {
        if (ev.key === "Enter") {
          props.onEnter?.(jsInnerText())
        }
      })
      onCleanup(cancel)
    }),
  )

  return { setDomRef: setInputRef, innerText: jsInnerText, setText: setJSInnerText }
}
