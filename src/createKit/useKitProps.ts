import {
  LazyLoadObj,
  MayArray,
  arrify,
  createObjectWhenAccess,
  hasProperty,
  mergeObjects,
  pipeDo,
  shrinkFn,
  type AnyFn
} from "@edsolater/fnkit"
import { DeAccessifyProps, accessifyProps, getUIKitTheme, hasUIKitTheme } from ".."
import { getPropsFromAddPropContext } from "../piv/AddProps"
import { getControllerObjFromControllerContext } from "../piv/ControllerContext"
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
  /** @deprecated */
  lazyLoadController(controller: Controller | ((props: ParsedKitProps<DeAccessifyProps<P>>) => Controller)): void
  contextController: any // no need to infer this type for you always force it !!!
  // TODO: imply it !!! For complicated DOM API always need this, this is a fast shortcut
  // componentRef
} {
  type RawProps = DeAccessifyProps<P>

  // TODO: should move to getParsedKitProps
  // wrap controllerContext based on props:innerController is only in `<Piv>`
  const mergedContextController = createObjectWhenAccess(getControllerObjFromControllerContext)

  // if (propContextParsedProps.children === 'PropContext can pass to deep nested components') {
  //   console.log('kitProps raw: ', { ...propContextParsedProps })
  // }
  const { loadController: lazyLoadController, getControllerCreator } = createComponentController<RawProps, Controller>(
    rawOptions,
  )

  const options = mergeObjects(
    { controller: (props: ParsedKitProps<RawProps>) => getControllerCreator(props) },
    rawOptions,
  )
  const { props, methods, shadowProps, loadController } = useKitPropParser(kitProps, options)

  // for options' controller
  if (hasProperty(rawOptions, "controller")) loadController(shrinkFn(rawOptions!.controller))

  return {
    props,
    methods,
    shadowProps,
    loadController,
    lazyLoadController: (controller: Controller | ((props: ParsedKitProps<RawProps>) => Controller)) => {
      lazyLoadController(controller)
      loadController(controller)
    },
    contextController: mergedContextController,
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
  const controller1 = options?.controller ? createObjectWhenAccess(() => options.controller!(parsedProps2)) : {}

  // const startTime = performance.now()
  // merge kit props
  const parsedProps1 = pipeDo(
    kitProps,
    //handle context props
    (props) => mergeProps(props, getPropsFromPropContextContext({ componentName: options?.name })),
    // handle addPropContext props
    (props) => mergeProps(props, getPropsFromAddPropContext({ componentName: options?.name })),
    // get defaultProps from uikitTheme
    (props) => (options?.name && hasUIKitTheme(options.name) ? mergeProps(getUIKitTheme(options.name), props) : props),
    // get default props
    (props) => (options?.defaultProps ? addDefaultPivProps(props, options.defaultProps) : props),
    // parse shadowProps of **options**
    (props) => handleShadowProps(props, options?.selfProps), // TODO: assume can't be promisify
    // parse plugin of **options**
    (props) =>
      handlePluginProps(
        props,
        () => options?.plugin,
        () => hasProperty(options, "plugin"),
      ), // defined-time (parsing option)
    // parse component name of **options**
    (props) => (hasProperty(options, "name") ? mergeProps(props, { class: options!.name }) : props), // defined-time (parsing option)

    (props) => handleShadowProps(props, options?.selfProps), // outside-props-run-time(parsing props) // TODO: assume can't be promisify
    (props) => handlePluginProps(props), // outside-props-run-time(parsing props) // TODO: assume can't be promisify  //<-- bug is HERE!!, after this, class is doubled
    (props) => handlePivkitCallbackProps(props), // outside-props-run-time(parsing props) // TODO: assume can't be promisify
  ) as any /* too difficult to type */

  let loadController: AnyFn = () => {}
  if (hasProperty(kitProps, "ref")) {
    loadController = (controller) => {
      arrify(kitProps.ref).forEach((ref) => ref?.(shrinkFn(controller)))
    }
  }

  // TODO: don't use controllerRef, use ref instead
  const controller = parsedProps1.innerController
    ? mergeObjects(controller1, parsedProps1.innerController)
    : controller1
  // inject controller to props:innerController (📝!!!important notice, for lazyLoadController props:innerController will always be a prop of any component useKitProps)
  const shadowProps = mergeObjects(parsedProps1, { innerController: controller } as PivProps)
  const parsedProps2 = pipeDo(parsedProps1, (props) => {
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
  if (hasProperty(kitProps, "controllerRef") && controller) loadPropsControllerRef(parsedProps2, controller)

  // in design, is it good?🤔
  // registerControllerInCreateKit(proxyController, rawProps.id)

  return { props: parsedProps2, methods: parsedProps1, shadowProps, loadController }
}

/**
 * section 2: load controller
 */
function createComponentController<
  RawProps extends ValidProps,
  Controller extends ValidController | unknown,
>(options?: { debugName?: string }) {
  const controllerFaker = new LazyLoadObj<(props: ParsedKitProps<RawProps>) => Controller>()
  const loadController = (inputController: Controller | ((props: ParsedKitProps<RawProps>) => Controller)) => {
    const controllerCreator = typeof inputController === "function" ? inputController : () => inputController
    if (options?.debugName === "debug") console.log("controllerCreator: ", inputController)
    //@ts-expect-error unknown ?
    controllerFaker.load(controllerCreator)
    if (options?.debugName === "debug")
      console.log("2: ", controllerFaker.spawn(), controllerFaker.spawn() === controllerCreator)
  }
  return {
    loadController,
    getControllerCreator: (props: ParsedKitProps<RawProps>) =>
      controllerFaker.hasLoaded() ? controllerFaker.spawn()?.(props) : { hello: "say" },
  }
}

export type DeKitProps<
  P extends ValidProps,
  Controller extends ValidController = ValidController,
  DefaultProps extends Partial<DeAccessifyProps<P>> = {},
> = ParsedKitProps<AddDefaultPivProps<DeAccessifyProps<P>, DefaultProps>> &
  Omit<PivProps<HTMLTag, Controller>, keyof DeAccessifyProps<P>>

