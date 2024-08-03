import {
  LazyLoadObj,
  MayArray,
  arrify,
  createObjectWhenAccess,
  hasProperty,
  mergeObjects,
  pipeDo,
  shrinkFn,
  type AnyFn,
} from "@edsolater/fnkit"
import { DeAccessifyProps, accessifyProps, getUIKitTheme, hasUIKitTheme } from ".."
import { getPropsFromAddPropContext } from "../piv/AddProps"
import { createControllerContext, getControllerObjFromControllerContext } from "../piv/ControllerContext"
import { PivProps } from "../piv/Piv"
import { getPropsFromPropContextContext } from "../piv/PropContext"
import { loadPropsControllerRef } from "../piv/propHandlers/children"
import { handlePluginProps } from "../piv/propHandlers/handlePluginProps"
import { handlePivkitCallbackProps } from "../piv/propHandlers/mergifyProps"
import { Pluginable } from "../piv/propHandlers/plugin"
import { handleShadowProps } from "../piv/propHandlers/shadowProps"
import { HTMLTag, ValidController, ValidProps } from "../piv/typeTools"
import { mergeProps } from "../piv/utils"
import { AddDefaultPivProps, addDefaultPivProps } from "../piv/utils/addDefaultProps"
import { omitItem } from "./utils"
import type { JSXElement } from "solid-js"

/** used for {@link useKitProps}'s option */
export type KitPropsOptions<
  KitProps extends ValidProps,
  Controller extends ValidController | unknown = unknown,
  DefaultProps extends Partial<KitProps> = {},
> = {
  name?: string

  /** just use loadController of output of useKitProps */
  controller?: (
    props: ParsedKitProps<KitProps>,
  ) => any /* use any to avoid this type check (type check means type infer) */
  defaultProps?: DefaultProps
  plugin?: MayArray<Pluginable<any>>
  /** default is false
   * @deprecated use `needAccessify` instead
   */
  noNeedDeAccessifyChildren?: boolean
  /**
   * by default, all will check to Accessify
   * like webpack include
   */
  needAccessify?: string[]
  /**
   * by default, all will check to Accessify
   * like webpack exclude
   */
  noNeedDeAccessifyProps?: string[]
  /**
   * detect which props is shadowProps\
   * not selfProps means it's shadowProps\
   * by default, all props are shadowProps(which can pass to shadowProps="")
   */
  selfProps?: string[]
  /** start with debug is special */
  debugName?: string
}

/** return type of useKitProps */
export type ParsedKitProps<RawProps extends ValidProps> = Omit<RawProps, "plugin" | "shadowProps">

/**
 * **core function**
 * exported props -- all props will be accessied (but props is a proxy, so it's not actually accessied)
 * exported methods -- all methods will NOT be accessied (but it is also a proxy)
 *
 * return multi; not just props
 */
// TODO: should has controllerContext to accept controllers
export function useKitProps<
  P extends ValidProps,
  Controller extends ValidController = ValidController,
  DefaultProps extends Partial<DeAccessifyProps<P>> = {},
>(
  kitProps: P,
  rawOptions?: KitPropsOptions<DeAccessifyProps<P>, Controller, DefaultProps>,
): {
  /** not declared self props means it's shadowProps */
  shadowProps: any
  /**
   * TODO: access the props of this will omit the props of output:shadowProps
   */
  props: DeKitProps<P, Controller, DefaultProps>
  /**
   * TODO: access the props of this will omit the props of output:shadowProps
   * will not inject controller(input function will still be function, not auto-invoke, often used in `on-like` or )
   */
  methods: AddDefaultPivProps<P, DefaultProps>
  loadController(controller: Controller): void
  /** @deprecated just for old component. use {@link loadControllerForKitParser} instead */
  lazyLoadController(controller: Controller | ((props: ParsedKitProps<DeAccessifyProps<P>>) => Controller)): void
  parentContextControllers: any // no need to infer this type for you always force it !!!
  // TODO: imply it !!! For complicated DOM API always need this, this is a fast shortcut
  // componentRef
  // ControllerContextProvider: (props: { children: JSXElement }) => JSXElement
} {
  type RawProps = DeAccessifyProps<P>

  // TODO: should move to getParsedKitProps
  // wrap controllerContext based on props:innerController is only in `<Piv>`

  // if (propContextParsedProps.children === 'PropContext can pass to deep nested components') {
  //   console.log('kitProps raw: ', { ...propContextParsedProps })
  // }
  const { loadController: loadControllerForContext, getLoadedController } = createComponentControllerLoader<
    RawProps,
    Controller
  >(rawOptions)

  const options = mergeObjects(
    { controller: (props: ParsedKitProps<RawProps>) => getLoadedController(props) },
    rawOptions,
  )

  const {
    props,
    methods,
    shadowProps,
    loadController: loadControllerForKitParser,
  } = useKitPropParser(kitProps, options)

  // for options' controller
  if (hasProperty(rawOptions, "controller")) loadControllerForKitParser(shrinkFn(rawOptions!.controller))

  const loadController = (outsideFilledController: Controller) => {
    const newMerged =
      "innerController" in methods
        ? mergeObjects(...arrify(methods.innerController), outsideFilledController)
        : outsideFilledController
    loadControllerForContext(newMerged)
    loadControllerForKitParser(newMerged)
  }

  return {
    props,
    methods,
    shadowProps,
    loadController: loadController,
    lazyLoadController: loadController,
    get parentContextControllers() {
      return createObjectWhenAccess(getControllerObjFromControllerContext)
    },
    // get ControllerContextProvider() {
    //   return createControllerContext(options.name, getLoadedController(props))
    // },
  }
}

/**
 * parse some special props of component. such as shadowProps, plugin, controller, etc.
 */
//TODO: should not build-in parse controllerRef
// TODO: should optional props accept promisify input
function useKitPropParser<
  RawProps extends ValidProps,
  Controller extends ValidController = ValidController,
  DefaultProps extends Partial<RawProps> = {},
>(
  // too difficult to type here
  kitProps: any,
  options?: KitPropsOptions<RawProps, Controller, DefaultProps>,
): {
  props: ParsedKitProps<AddDefaultPivProps<RawProps, DefaultProps>> &
    Omit<PivProps<HTMLTag, Controller>, keyof RawProps>
  methods: AddDefaultPivProps<RawProps, DefaultProps>
  shadowProps: any
  loadController: AnyFn
} {
  const controllerFromOptions = options?.controller
    ? createObjectWhenAccess(() => options.controller!(deAccessfiedProps))
    : {}

  // merge kit props
  const preparsedProps = pipeDo(
    kitProps,
    // (context) handle context props
    (props) => mergeProps(props, getPropsFromPropContextContext({ componentName: options?.name })),
    // (context) handle addPropContext props
    (props) => mergeProps(props, getPropsFromAddPropContext({ componentName: options?.name })),
    // (global config) get defaultProps from uikitTheme
    (props) => (options?.name && hasUIKitTheme(options.name) ? mergeProps(getUIKitTheme(options.name), props) : props),
    // (useKitProps's option) get default props
    (props) => (options?.defaultProps ? addDefaultPivProps(props, options.defaultProps) : props),
    // (useKitProps's option) parse plugin
    (props) =>
      handlePluginProps(
        props,
        () => options?.plugin,
        () => hasProperty(options, "plugin"),
      ), // defined-time (parsing option)
    // (useKitProps's option) component name
    (props) => (hasProperty(options, "name") ? mergeProps(props, { class: options!.name }) : props), // defined-time (parsing option)
    // (runtime props) parse shadowProps
    (props) => handleShadowProps(props, options?.selfProps), // outside-props-run-time(parsing props) // TODO: assume can't be promisify
    // (runtime props) parse plugin
    (props) => handlePluginProps(props), // outside-props-run-time(parsing props) // TODO: assume can't be promisify  //<-- bug is HERE!!, after this, class is doubled
    // (runtime props) parse onXxxx callbacks
    (props) => handlePivkitCallbackProps(props), // outside-props-run-time(parsing props) // TODO: assume can't be promisify
  ) as any /* too difficult to type */

  let loadController: AnyFn = () => {}

  if (hasProperty(kitProps, "ref") || hasProperty(kitProps, "controllerRef")) {
    loadController = (controller) => {
      const refReceivers = arrify(kitProps.ref).concat(arrify(kitProps.controllerRef))
      refReceivers.forEach((ref) => ref?.(shrinkFn(controller)))
    }
  }

  // TODO: don't use controllerRef, use ref instead. because `ref` name is more user-friendly
  const controller = preparsedProps.innerController
    ? mergeObjects(controllerFromOptions, preparsedProps.innerController)
    : controllerFromOptions

  // inject controller to props:innerController (📝!!!important notice, for lazyLoadController props:innerController will always be a prop of any component useKitProps)
  const needPassDownProps = mergeProps(preparsedProps, { innerController: controller } as PivProps)

  const deAccessfiedProps = pipeDo(preparsedProps, (props) => {
    const verboseAccessifyPropNames =
      options?.needAccessify ??
      (options?.noNeedDeAccessifyChildren
        ? omitItem(Object.getOwnPropertyNames(props), ["children"])
        : Object.getOwnPropertyNames(props))
    const needAccessifyProps = options?.noNeedDeAccessifyProps
      ? omitItem(verboseAccessifyPropNames, options.noNeedDeAccessifyProps)
      : verboseAccessifyPropNames
    return accessifyProps(props, controller, needAccessifyProps, Boolean(options?.debugName))
  }) as any /* too difficult to type */

  // fullfill input props:controllerRef
  if (hasProperty(kitProps, "controllerRef") && controller) loadPropsControllerRef(deAccessfiedProps, controller)

  // in design, is it good?🤔
  // registerControllerInCreateKit(proxyController, rawProps.id)

  return { props: deAccessfiedProps, methods: preparsedProps, shadowProps: needPassDownProps, loadController }
}

/**
 * section 2: load controller
 */
function createComponentControllerLoader<
  RawProps extends ValidProps,
  Controller extends ValidController | unknown,
>(options?: { debugName?: string }) {
  const controllerLazyLoadObj = new LazyLoadObj<(props: ParsedKitProps<RawProps>) => Controller>()
  const loadController = (inputController: Controller | ((props: ParsedKitProps<RawProps>) => Controller)) => {
    const controllerLoadFn = typeof inputController === "function" ? inputController : () => inputController
    //@ts-expect-error unknown ?
    controllerLazyLoadObj.load(controllerLoadFn)
  }
  return {
    loadController,
    getLoadedController: (props: ParsedKitProps<RawProps>) =>
      controllerLazyLoadObj.hasLoaded() ? controllerLazyLoadObj.spawn()?.(props) : { hello: "say" },
  }
}

export type DeKitProps<
  P extends ValidProps,
  Controller extends ValidController = ValidController,
  DefaultProps extends Partial<DeAccessifyProps<P>> = {},
> = ParsedKitProps<AddDefaultPivProps<DeAccessifyProps<P>, DefaultProps>> &
  Omit<PivProps<HTMLTag, Controller>, keyof DeAccessifyProps<P>>
