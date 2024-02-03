import { AnyFn, MayArray, MayDeepArray } from '@edsolater/fnkit'
import { AccessifyProps } from '..'
import { CRef, PivProps } from '../piv/Piv'
import { MergifyProps } from '../piv/propHandlers/mergifyProps'
import { GetPluginParams, Plugin } from '../piv/propHandlers/plugin'
import { HTMLTag, ValidController, ValidProps } from '../piv/typeTools'
import { OmitItem } from './utils'

/**
 * - auto add `plugin` `shadowProps` `_promisePropsConfig` `controller` props
 * - auto add Div's props
 * - auto pick plugin prop if specified plugin
 * @todo also promisify?
 */
type KitPropsInstance<
  RawProps extends ValidProps,
  Controller extends ValidController,
  Plugins extends MayDeepArray<Plugin<any>>,
  TagName extends HTMLTag,
  NeedAccessifyProps extends keyof RawProps,
> = AccessifyProps<Pick<RawProps, NeedAccessifyProps>, Controller> &
  Omit<RawProps, NeedAccessifyProps> &
  Omit<PivProps<TagName, Controller>, keyof RawProps | 'plugin' | 'shadowProps'> &
  Omit<GetPluginParams<Plugins>, keyof RawProps | 'plugin' | 'shadowProps'> &
  Omit<
    {
      plugin?: PivProps['plugin']
      shadowProps?: PivProps['shadowProps'] // component must merged before `<Div>`

      // shadowProps?: MayArray<KitPropsInstance<RawProps, Controller, Plugins, TagName, NeedAccessifyProps> | undefined> // component must merged before `<Div>`
      // -------- additional --------
      // auto inject controller to it
      controllerRef?: CRef<Controller>
    },
    keyof RawProps
  >
/** build KitProps for outside use */

export type KitProps<
  RawProps extends ValidProps = {},
  O extends {
    /** will auto-add props: */
    controller?: ValidController
    plugin?: MayArray<Plugin<any>>
    htmlPropsTagName?: HTMLTag
    // default is auto detect, only set when auto is not ok
    needAccessifyProps?: (keyof RawProps)[]
    /** should also set in {@link useKitProps}'s options' `prop:noNeedDeAccessifyProps`  */
    noNeedDeAccessifyProps?: (keyof RawProps)[]
  } = {},
> = KitPropsInstance<
  MergifyProps<RawProps>,
  NonNullable<O['controller']>,
  NonNullable<O['plugin']>,
  NonNullable<O['htmlPropsTagName']>,
  NonNullable<
    OmitItem<
      O['needAccessifyProps'] extends string[] ? O['needAccessifyProps'][number] : keyof RawProps,
      O['noNeedDeAccessifyProps'] extends string[] ? O['noNeedDeAccessifyProps'][number] : undefined
    >
  >
>
