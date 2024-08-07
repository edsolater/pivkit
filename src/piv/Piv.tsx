import { MayArray, MayFn, arrify, pipeDo, shakeUndefinedItem } from "@edsolater/fnkit"
import { JSX, JSXElement } from "solid-js"
import {
  ClassName,
  HTMLProps,
  ICSS,
  IStyle,
  OnClickPayloads,
  PluginCoreFn,
  Pluginable,
  handlePluginProps,
  handleShadowProps,
} from "./propHandlers"
import type { PivkitCallback } from "./propHandlers/mergifyProps"
import { renderHTMLDOM } from "./propHandlers/renderHTMLDOM"
import { HTMLTag, PivChild, ValidController } from "./typeTools"
import { omitProps } from "./utils"

type BooleanLike = any

export interface PivProps<TagName extends HTMLTag = HTMLTag, Controller extends ValidController = ValidController> {
  /** if is settled and is false , only it's children will render */
  if?: MayFn<BooleanLike>
  /** if is settled and is false , only it's children will render */
  ifSelfShown?: MayFn<BooleanLike>

  debugLog?: (keyof PivProps)[]

  /**
   * auto merge by shadowProps
   * @todo: use ref instead of domRef
   */
  domRef?: MayArray<CallbackRef<any> | null | undefined>

  /** old controllerRef, but `controllerRef` is not strightforward */
  ref?: MayArray<CallbackRef<any> | null | undefined>

  /**
   * auto merge by shadowProps
   * if it's in shadow props, it will merge with exist props
   */
  class?: MayArray<ClassName<Controller>>

  /**
   * id for `useComponentByID`
   * so others can access component's controller without set `props:controllerRef` to component, this have to have access to certain component instance
   */
  id?: string

  onClick?: PivkitCallback<(utils: OnClickPayloads<Controller>) => void> // for accessifyProps, onClick can't be array

  /**
   * auto merge by shadowProps
   * if it's in shadow props, it will merge with exist props
   */
  icss?: ICSS<Controller>

  /**
   * auto merge by shadowProps
   * if it's in shadow props, it will merge with exist props
   */
  style?: IStyle<Controller>

  /**
   * auto merge by shadowProps
   * if it's in shadow props, it will merge with exist props
   *
   * htmlProps can't have controller, because if this props be a function. there is no way to detect which props it will finnaly use
   */
  htmlProps?: HTMLProps<TagName>

  children?: PivChild<unknown extends Controller ? any : Controller> // any is convient for <Piv>

  /**
   * auto merge by shadowProps
   * high priority
   */
  shadowProps?: MayArray<any /* too difficult to type */>

  // /** low priority */
  // outsideProps?: MayArray<any /* too difficult to type */>

  /**
   * auto merge by shadowProps
   * special: every kit baseon <Piv> should support this prop
   */
  plugin?: MayArray<Pluginable<any> | PluginCoreFn>

  // -------- special prop --------

  /** only passed in parent component, innerController will pass to deeper () */
  innerController?: MayArray<object>

  /** @example
   * const Button = () => <Piv as={(parsedPivProps) => <button {...parsedPivProps} />} />
   */
  as?: any // TODO: imply it // 💡soft `define-self`, props will merge other than cover

  defineOutWrapper?: MayArray<DangerousWrapperNodeFn>
  defineSelf?: (selfProps: PivProps<any, any>) => JSX.Element // assume a function return ReactNode is a Component
  definePrevSibling?: MayArray<PivChild<Controller>>
  defineNextSibling?: MayArray<PivChild<Controller>>
  defineFirstChild?: MayArray<PivChild<Controller>>
  defineLastChild?: MayArray<PivChild<Controller>>
}

type DangerousWrapperNodeFn = (originalChildren: JSXElement) => JSXElement // change outter wrapper element

export type CallbackRef<T> = (el: T) => void // not right

export const arriablePivPropsNames = [
  "domRef",
  "ref",
  "class",
  "htmlProps",
  "icss",
  "onClick",

  "plugin",
  "shadowProps",

  "style",
  "debugLog",

  "defineOutWrapper",
  "definePrevSibling",
  "defineNextSibling",
  "defineSelf",
  "defineFirstChild",
  "defineLastChild",
] satisfies (keyof PivProps<any>)[]

export const pivPropsNames = [
  "id",
  "if",
  "ifSelfShown",
  "children",

  "innerController",
  ...arriablePivPropsNames,
] satisfies (keyof PivProps<any>)[]

export const Piv = <TagName extends HTMLTag = HTMLTag, Controller extends ValidController = ValidController>(
  kitProps: PivProps<TagName, Controller>,
) => {
  // 📝 defineOutWrapper may in showProps or plugin. so need to handle it first
  const props = pipeDo(kitProps, handleShadowProps, handlePluginProps, handleShadowProps)
  return "defineOutWrapper" in props ? renderWithOutWrapper(props) : renderWithNormalPivProps(props)
}

function renderWithNormalPivProps(rawProps?: Omit<PivProps<any, any>, "plugin" | "shadowProps">) {
  if (!rawProps) return
  if ("defineNextSibling" in rawProps || "definePrevSibling" in rawProps) {
    return shakeUndefinedItem(
      [rawProps.definePrevSibling, renderHTMLDOM("div", rawProps), rawProps.defineNextSibling].flat(),
    ) as JSXElement
  } else {
    return renderHTMLDOM("div", rawProps)
  }
}

function renderWithOutWrapper(props: PivProps<any, any>): JSXElement {
  console.log("detect defineOutWrapper") // FIXME: <-- why not detected?
  return arrify(props["defineOutWrapper"]).reduce(
    (prevNode, getWrappedNode) => (getWrappedNode ? getWrappedNode(prevNode) : prevNode),
    (() => renderWithNormalPivProps(omitProps(props, "defineOutWrapper"))) as unknown as JSXElement, // 📝 wrap function to let not solidjs read at once when array.prototype.reduce not finish yet
  )
}
