import {
  AnyFn,
  AnyObj,
  MayDeepArray,
  MayFn,
  filter,
  flap,
  flapDeep,
  getKeys,
  isObject,
  isString,
  mergeObjectsWithConfigs,
  overwriteFunctionName,
  shrinkFn,
} from '@edsolater/fnkit'
import { CSSAttribute, css } from 'goober'
import { ConfigableFunction, createConfigableFunction } from '../../fnkit/configableFunction'

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

const isTaggedICSSSybol = Symbol('isTaggedICSS')
const toICSSSymbol = Symbol('toICSS') // 🤔 is it necessary?

type RuleCreatorFn = (settings?: AnyObj) => ICSS
type TaggedICSS<T extends AnyFn> = ConfigableFunction<T> & {
  [isTaggedICSSSybol]: true | string
  [toICSSSymbol](): ICSS
  [toICSSSymbol](...additionalSettings: Parameters<T>): ICSS
}

// TODO: imply it !!!
export function injectRuleToGlobal(rule: ICSS) {}
export function createICSS<T extends RuleCreatorFn>(
  rule: T,
  options?: { name?: string; defaultSettings?: Partial<AnyObj>; globalSyle?: ICSS }
): TaggedICSS<any> {
  const factory = createConfigableFunction(
    (settings?: AnyObj) => rule(settings),
    options?.defaultSettings
  ) as unknown as TaggedICSS<T>
  Reflect.set(factory, isTaggedICSSSybol, true)
  Reflect.set(factory, toICSSSymbol, (...args: any[]) => invokeTaggedICSS(factory, ...args))
  // add global
  // rename
  const fn = options?.name ? overwriteFunctionName(factory, options.name) : factory
  return fn
}

export function isTaggedICSS(v: any): v is TaggedICSS<any> {
  return isObject(v) && Reflect.has(v, isTaggedICSSSybol)
}

function invokeTaggedICSS<T extends RuleCreatorFn>(v: TaggedICSS<T>, params?: AnyObj): ICSS {
  return v.config(params as any)()
}

/** for piv to parse icss props */
export function handleICSSProps<Controller extends ValidController | unknown = unknown>(
  cssProp: ICSS<Controller>,
  controller: Controller = {} as Controller
) {
  const cssObjList = flapDeep(cssProp)
    .map((i) => {
      const fn = isTaggedICSS(i) ? invokeTaggedICSS(i as any) : i
      return shrinkFn(fn, [controller])
    })
    .filter((i) => isString(i) || (isObject(i) && getKeys(i).length > 0)) as (CSSObject | string)[]
  const classes = cssObjList.map((i) => (isString(i) ? i : css(i)))
  return classes.join(' ')
}

export function compressICSSToObj<Controller extends ValidController | unknown = unknown>(
  icss: ICSS<Controller>
): ICSSObject<Controller> {
  return (controller: Controller) => {
    const cssObjList = filter(
      flap(icss).map((i) => shrinkFn(i, [controller])),
      isObject
    ) as ICSSObject<Controller>[]
    const l = cssObjList.reduce((acc, cur) => mergeICSSObject<Controller>(acc, cur), {} as ICSSObject<Controller>)
    return shrinkFn(l, [controller])
  }
}

function mergeICSSObject<Controller extends ValidController | unknown = unknown>(
  ...icssEs: ICSSObject<Controller>[]
): ICSSObject<Controller> {
  return (controller: Controller) =>
    mergeObjectsWithConfigs(
      icssEs.map((ic) => shrinkFn(ic, [controller])),
      ({ valueA: v1, valueB: v2 }) => v2 ?? v1
    )
}
