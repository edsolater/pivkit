import {
  AnyFn,
  AnyObj,
  MayDeepArray,
  MayFn,
  createConfigableFunction,
  filter,
  flap,
  flapDeep,
  isObject,
  isString,
  mergeObjectsWithConfigs,
  overwriteFunctionName,
  shrinkFn,
  type ConfigableFunction,
} from "@edsolater/fnkit"
import { CSSAttribute, css } from "goober"
// just for type, just use goober is not enough
import type * as CSS from "csstype" // or it will have bug when `pnpm build`

type ValidController = AnyObj
type LoadController<Target, Controller extends ValidController | unknown = unknown> = MayFn<Target, [Controller]>
export type ICSSObject<Controller extends ValidController | unknown = unknown> = LoadController<CSSObject, Controller> // rename  for ICSSObject may be a superset of CSSObject

// export type CSSObject = JSX.CSSProperties & {
//   '&:hover'?: JSX.CSSProperties
//   //TODO
// }
export type CSSObject = CSSAttribute

export type ICSS<Controller extends ValidController | unknown = unknown> = MayDeepArray<
  LoadController<boolean | string | number | null | undefined, Controller> | ICSSObject<Controller>
>

const isTaggedICSSSymbol = Symbol("isTaggedICSS")
const toICSSSymbol = Symbol("toICSS") // 🤔 is it necessary?

type RuleCreatorFn = (settings?: AnyObj) => ICSS
export type TaggedICSS<T extends AnyFn> = ConfigableFunction<T> & {
  [isTaggedICSSSymbol]: true | string
  [toICSSSymbol](): ICSS
  [toICSSSymbol](...additionalSettings: Parameters<T>): ICSS
}

export function createICSS<T extends RuleCreatorFn>(
  rule: T,
  options?: { name?: string; defaultSettings?: Partial<AnyObj>; globalStyle?: ICSS },
): TaggedICSS<T> {
  const factory = createConfigableFunction(
    (settings?: AnyObj) => rule(settings),
    options?.defaultSettings,
  ) as unknown as TaggedICSS<T>
  Reflect.set(factory, isTaggedICSSSymbol, true)
  Reflect.set(factory, toICSSSymbol, (...args: any[]) => invokeTaggedICSS(factory, ...args))
  // add global
  // rename
  const fn = options?.name ? overwriteFunctionName(factory, options.name) : factory
  return fn
}

export function isTaggedICSS(v: any): v is TaggedICSS<any> {
  return isObject(v) && Reflect.has(v, isTaggedICSSSymbol)
}

function invokeTaggedICSS<T extends RuleCreatorFn>(v: TaggedICSS<T>, params?: AnyObj): ICSS {
  return v.config(params as any)()
}

// sometimes we need to use icss in a non-component-show-time
export function attachIcssToElement(el: HTMLElement, icss: ICSS) {
  el.classList.add(handleICSSProps(icss))
  return { dispose: () => el.classList.remove(handleICSSProps(icss)) }
}

/** for piv to parse icss props */
export function handleICSSProps<Controller extends ValidController | unknown = unknown>(
  cssProp: ICSS<Controller>,
  controller: Controller = {} as Controller,
  debug?: boolean,
) {
  if (debug) {
    return ""
  }
  let outputClassName = ""
  for (const i of flapDeep(cssProp)) {
    const fn = isTaggedICSS(i) ? invokeTaggedICSS(i as any) : i
    const shrinked = shrinkFn(fn, [controller])
    if (!shrinked || (!isString(shrinked) && !isObject(shrinked))) continue

    const className = isString(shrinked) ? shrinked : css(shrinked as any as any)
    outputClassName += (outputClassName ? " " : "") + className
  }

  return outputClassName
}

/**
 * ICSS => string(class-name)
 * you can parse icss not in component-show-time to speed up
 */
export function parseICSSToClassName<Controller extends ValidController | unknown = unknown>(
  icss: ICSS<Controller>,
  controller?: Controller,
) {
  return handleICSSProps(icss, controller)
}

export function compressICSSToObj<Controller extends ValidController | unknown = unknown>(
  icss: ICSS<Controller>,
): ICSSObject<Controller> {
  return (controller: Controller) => {
    const cssObjList = filter(
      flap(icss).map((i) => shrinkFn(i, [controller])),
      isObject,
    ) as ICSSObject<Controller>[]
    const l = cssObjList.reduce((acc, cur) => mergeICSSObject<Controller>(acc, cur), {} as ICSSObject<Controller>)
    return shrinkFn(l, [controller])
  }
}

export function mergeICSSObject<Controller extends ValidController | unknown = unknown>(
  ...icssEs: ICSSObject<Controller>[]
): ICSSObject<Controller> {
  return (controller: Controller) =>
    mergeObjectsWithConfigs(
      icssEs.map((ic) => shrinkFn(ic, [controller])),
      ({ valueA: v1, valueB: v2 }) => v2 ?? v1,
    )
}

/**
 * @example
 * {_background_j: "var(--bg1)", _background_k: "var(--bg2)", background: "var(--bg3)", _background_: "var(--bg4)"} => {background: "vat(--bg3), var(--bg1), var(--bg2), var(--bg4)"}
 * *j k is just sault
 */
function collapseMergeableCSSValue(icssRule: ICSSObject): ICSSObject {
  const needMerge = Object.keys(icssRule).some((k) => k.startsWith("_"))
  if (!needMerge) return icssRule

  const resultIcss: ICSSObject = {}
  for (const [key, value] of Object.entries(icssRule)) {
    if (key.startsWith("_background_")) {
      resultIcss.background = resultIcss.background ? resultIcss.background + "," + value : value
    } else if (key.startsWith("_boxShadow_")) {
      resultIcss.boxShadow = resultIcss.boxShadow ? resultIcss.boxShadow + "," + value : value
    } else if (key.startsWith("_animation_")) {
      resultIcss.animation = resultIcss.animation ? resultIcss.animation + "," + value : value
    } else if (key.startsWith("_transition_")) {
      resultIcss.transition = resultIcss.transition ? resultIcss.transition + "," + value : value
    } else if (key.startsWith("_translate_")) {
      resultIcss.translate = resultIcss.translate ? combineTwoCSSTranslateValue(resultIcss.translate, value) : value
    } else if (key.startsWith("_rotate_")) {
      resultIcss.rotate = resultIcss.rotate ? combineTwoCSSRotateValue(resultIcss.rotate, value) : value
    } else if (key.startsWith("_scale_")) {
      resultIcss.scale = resultIcss.scale ? combineTwoCSSScaleValue(resultIcss.scale, value) : value
    } else if (key.startsWith("_transform_")) {
      resultIcss.transform = resultIcss.transform ? resultIcss.transform + " " + value : value
    } else if (key.startsWith("_filter_")) {
      resultIcss.filter = resultIcss.filter ? resultIcss.filter + " " + value : value
    } else if (key.startsWith("_backdropFilter_")) {
      resultIcss.backdropFilter = resultIcss.backdropFilter ? resultIcss.backdropFilter + " " + value : value
    } else {
      resultIcss[key] = value
    }
  }
  return resultIcss
}

/**
 * basic utils
 */
function isMeaningfullCSSValue(v: string | number | undefined) {
  return Boolean(v && v != "0")
}

/** utils for {@link collapseMergeableCSSValue} */
function combineTwoCSSTranslateValue(oldCssValue: string | undefined, newCssValue: string): string {
  const [oldX = "", oldY = ""] = (oldCssValue ?? "").split(" ")
  const [newX = "", newY = ""] = newCssValue.split(" ")
  const mergedX =
    isMeaningfullCSSValue(oldX) && isMeaningfullCSSValue(newX)
      ? `calc(${oldX} + ${newX})`
      : isMeaningfullCSSValue(newX)
        ? newX
        : oldX
  const mergedY =
    isMeaningfullCSSValue(oldY) && isMeaningfullCSSValue(newY)
      ? `calc(${oldY} + ${newY})`
      : isMeaningfullCSSValue(newY)
        ? newY
        : oldY
  return `${mergedX} ${mergedY}`.trim()
}

/** utils for {@link collapseMergeableCSSValue} */
function combineTwoCSSRotateValue(oldCssValue: string | undefined, newCssValue: string): string {
  const merged =
    isMeaningfullCSSValue(oldCssValue) && isMeaningfullCSSValue(newCssValue)
      ? `calc(${oldCssValue} + ${newCssValue})`
      : isMeaningfullCSSValue(newCssValue)
        ? newCssValue
        : oldCssValue ?? ""
  return merged
}

/** utils for {@link collapseMergeableCSSValue} */
function combineTwoCSSScaleValue(oldCssValue: string | number | undefined, newCssValue: string): string | number {
  const merged =
    isMeaningfullCSSValue(oldCssValue) && isMeaningfullCSSValue(newCssValue)
      ? `calc(${oldCssValue} * ${newCssValue})`
      : isMeaningfullCSSValue(newCssValue)
        ? newCssValue
        : oldCssValue ?? ""
  return merged
}
