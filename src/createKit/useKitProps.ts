import { hasProperty, MayArray, mergeObjects, pipe } from '@edsolater/fnkit'
import { DeAccessifyProps, getUIKitTheme, hasUIKitTheme, accessifyProps } from '..'
import { getPropsFromAddPropContext } from '../piv/AddProps'
import { getControllerObjFromControllerContext } from '../piv/ControllerContext'
import { registerControllerInCreateKit } from '../piv/hooks/useComponentController'
import { PivProps } from '../piv/Piv'
import { getPropsFromPropContextContext } from '../piv/PropContext'
import { loadPropsControllerRef } from '../piv/propHandlers/children'
import { handlePluginProps } from '../piv/propHandlers/handlePluginProps'
import { handleMergifyOnCallbackProps } from '../piv/propHandlers/mergifyProps'
import { Plugin } from '../piv/propHandlers/plugin'
import { handleShadowProps } from '../piv/propHandlers/shadowProps'
import { HTMLTag, ValidController, ValidProps } from '../piv/typeTools'
import { mergeProps } from '../piv/utils'
import { AddDefaultPivProps, addDefaultPivProps } from '../piv/utils/addDefaultProps'
import { omitItem } from './utils'
import { LazyLoadObj, runtimeObjectFromAccess } from '../fnkit'

/** used for {@link useKitProps}'s option */
export type KitPropsOptions<
  KitProps extends ValidProps,
  Controller extends ValidController | unknown = unknown,
  DefaultProps extends Partial<KitProps> = {}
> = {
  name?: string

  controller?: (
    props: ParsedKitProps<KitProps>
  ) => any /* use any to avoid this type check (type check means type infer) */
  defaultProps?: DefaultProps
  plugin?: MayArray<Plugin<any>>
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
export type ParsedKitProps<RawProps extends ValidProps> = Omit<RawProps, 'plugin' | 'shadowProps'>

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
  DefaultProps extends Partial<DeAccessifyProps<P>> = {}
>(
  kitProps: P,
  options?: KitPropsOptions<DeAccessifyProps<P>, Controller, DefaultProps>
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
  lazyLoadController(controller: Controller | ((props: ParsedKitProps<DeAccessifyProps<P>>) => Controller)): void
  contextController: any // no need to infer this type for you always force it !!!
  // TODO: imply it !!! For complicated DOM API always need this, this is a fast shortcut
  // componentRef
} {
  type RawProps = DeAccessifyProps<P>

  // TODO: should move to getParsedKitProps
  // wrap controllerContext based on props:innerController is only in `<Piv>`
  const mergedContextController = runtimeObjectFromAccess(getControllerObjFromControllerContext)

  // if (propContextParsedProps.children === 'PropContext can pass to deep nested components') {
  //   console.log('kitProps raw: ', { ...propContextParsedProps })
  // }
  const { loadController, getControllerCreator } = createComponentController<RawProps, Controller>()
  const newOptions = mergeObjects(
    { controller: (props: ParsedKitProps<RawProps>) => getControllerCreator(props) },
    options
  )
  const { props, methods, shadowProps } = getParsedKitProps(kitProps, newOptions) as any

  return {
    props,
    methods,
    shadowProps,
    lazyLoadController: loadController,
    contextController: mergedContextController
  }
}

/**
 * parse some special props of component. such as shadowProps, plugin, controller, etc.
 */
function getParsedKitProps<
  RawProps extends ValidProps,
  Controller extends ValidController = ValidController,
  DefaultProps extends Partial<RawProps> = {}
>(
  // too difficult to type here
  rawProps: any,
  options?: KitPropsOptions<RawProps, Controller, DefaultProps>
): {
  props: ParsedKitProps<AddDefaultPivProps<RawProps, DefaultProps>> &
    Omit<PivProps<HTMLTag, Controller>, keyof RawProps>
  methods: AddDefaultPivProps<RawProps, DefaultProps>
  shadowProps: any
} {
  const proxyController = options?.controller
    ? runtimeObjectFromAccess(() => options.controller!(accessifiedProps))
    : {}

  // const startTime = performance.now()
  // merge kit props
  const methods = pipe(
    rawProps,
    //handle context props
    (props) => mergeProps(props, getPropsFromPropContextContext({ componentName: options?.name })),
    // handle addPropContext props
    (props) => mergeProps(props, getPropsFromAddPropContext({ componentName: options?.name })),
    // get defaultProps from uikitTheme
    (props) => (options?.name && hasUIKitTheme(options.name) ? mergeProps(getUIKitTheme(options.name), props) : props),
    // get default props
    (props) => (options?.defaultProps ? addDefaultPivProps(props, options.defaultProps) : props),
    (props) => handleShadowProps(props, options?.selfProps), // outside-props-run-time // TODO: assume can't be promisify
    // parse plugin of **options**
    (props) =>
      handlePluginProps(
        props,
        () => options?.plugin,
        () => hasProperty(options, 'plugin')
      ), // defined-time (parsing option)
    (props) => (hasProperty(options, 'name') ? mergeProps(props, { class: options!.name }) : props), // defined-time (parsing option)
    (props) => handleShadowProps(props, options?.selfProps), // outside-props-run-time(parsing props) // TODO: assume can't be promisify
    (props) => handlePluginProps(props), // outside-props-run-time(parsing props) // TODO: assume can't be promisify  //<-- bug is HERE!!, after this, class is doubled
    /**
     * handle `merge:` props
     * not elegent to have this, what about export a function `flagMerge` to make property can merge each other? 🤔
     */
    (props) => handleMergifyOnCallbackProps(props)
  ) as any /* too difficult to type */

  const controller = methods.innerController ? mergeObjects(proxyController, methods.innerController) : proxyController
  // inject controller to props:innerController (📝!!!important notice, for lazyLoadController props:innerController will always be a prop of any component useKitProps)
  const shadowProps = mergeObjects(methods, { innerController: controller } as PivProps)
  const accessifiedProps = pipe(methods, (props) => {
    const verboseAccessifyProps =
      options?.needAccessify ??
      (options?.noNeedDeAccessifyChildren
        ? omitItem(Object.getOwnPropertyNames(props), ['children'])
        : Object.getOwnPropertyNames(props))
    const needAccessifyProps = options?.noNeedDeAccessifyProps
      ? omitItem(verboseAccessifyProps, options.noNeedDeAccessifyProps)
      : verboseAccessifyProps
    return accessifyProps(props, controller, needAccessifyProps, Boolean(options?.debugName))
  }) as any /* too difficult to type */

  // fullfill input props:controllerRef
  if (controller) loadPropsControllerRef(accessifiedProps, proxyController)

  registerControllerInCreateKit(proxyController, rawProps.id)

  return { props: accessifiedProps, methods, shadowProps }
}

/**
 * section 2: load controller
 */
function createComponentController<RawProps extends ValidProps, Controller extends ValidController | unknown>() {
  const controllerFaker = new LazyLoadObj<(props: ParsedKitProps<RawProps>) => Controller>()
  const loadController = (inputController: Controller | ((props: ParsedKitProps<RawProps>) => Controller)) => {
    const controllerCreator = typeof inputController === 'function' ? inputController : () => inputController
    //@ts-expect-error unknown ?
    controllerFaker.load(controllerCreator)
  }
  return {
    loadController,
    getControllerCreator: (props: ParsedKitProps<RawProps>) =>
      controllerFaker.hasLoaded()
        ? controllerFaker.spawn()(props)
        : {
            /* if don't invoke lazyLoadController, use this default empty  */
          }
  }
}

export type DeKitProps<
  P extends ValidProps,
  Controller extends ValidController = ValidController,
  DefaultProps extends Partial<DeAccessifyProps<P>> = {}
> = ParsedKitProps<AddDefaultPivProps<DeAccessifyProps<P>, DefaultProps>> &
  Omit<PivProps<HTMLTag, Controller>, keyof DeAccessifyProps<P>>
