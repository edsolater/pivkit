import { MayArray, MayFn, arrify, pipeDo } from "@edsolater/fnkit"
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
  icss?: ICSS<any>

  /**
   * auto merge by shadowProps
   * if it's in shadow props, it will merge with exist props
   */
  style?: IStyle<any>

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

  /** only passed in parent component */
  /**
   * @deprecated
   */
  innerController?: Controller

  /** @example
   * const Button = () => <Piv as={(parsedPivProps) => <button {...parsedPivProps} />} />
   */
  as?: any // TODO: imply it // 💡soft `render-self`, props will merge other than cover
  "render:self"?: (selfProps: PivProps<any, any>) => JSX.Element // assume a function return ReactNode is a Component

  /**
   * auto merge by shadowProps
   * change outter wrapper element
   */
  "render:outWrapper"?: MayArray<DangerousWrapperNodeFn>

  "render:firstChild"?: MayArray<PivChild<Controller>>

  "render:lastChild"?: MayArray<PivChild<Controller>>
}

type DangerousWrapperNodeFn = (originalChildren: JSXElement) => JSXElement // change outter wrapper element

export type CallbackRef<T> = (el: T) => void // not right

export const pivPropsNames = [
  "id",
  "if",
  "ifSelfShown",

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

  "innerController",
  "children",

  "render:self",
  "render:outWrapper",
  "render:firstChild",
  "render:lastChild",
] satisfies (keyof PivProps<any>)[]

export const Piv = <TagName extends HTMLTag = HTMLTag, Controller extends ValidController = ValidController>(
  kitProps: PivProps<TagName, Controller>,
) => {
  // 📝 render:outWrapper may in showProps or plugin. so need to handle it first
  const props = pipeDo(kitProps, handleShadowProps, handlePluginProps, handleShadowProps)
  return "render:outWrapper" in props ? handlePropRenderOutWrapper(props) : handleNormalPivProps(props)
}

function handleNormalPivProps(rawProps?: Omit<PivProps<any, any>, "plugin" | "shadowProps">) {
  if (!rawProps) return

  return renderHTMLDOM("div", rawProps)
}

function handlePropRenderOutWrapper(props: PivProps<any, any>): JSXElement {
  console.log("detect render:outWrapper") // FIXME: <-- why not detected?
  return arrify(props["render:outWrapper"]).reduce(
    (prevNode, getWrappedNode) => (getWrappedNode ? getWrappedNode(prevNode) : prevNode),
    (() => handleNormalPivProps(omitProps(props, "render:outWrapper"))) as unknown as JSXElement, // 📝 wrap function to let not solidjs read at once when array.prototype.reduce not finish yet
  )
}
