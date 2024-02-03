/**
 * utils in this folder can be used to override the default theme of the component
 */

import { get, has } from '../fnkit/itemMethods'
import { ButtonKitProps, InputKitProps } from '../components'
import { ValidProps } from '../piv'

export type UIKitThemeConfig = {
  Button?: ButtonKitProps
  Input?: InputKitProps
} & Record<string, any>

/** @todo it should be a context store, so can config it in runTime  */
const themeConfigStore: UIKitThemeConfig = {}

/** should load this before use UIKit */
export function configUIKitTheme(config: UIKitThemeConfig) {
  Object.assign(themeConfigStore, config)
}

/**
 * will return the theme config of the component
 * @param componentName this name defined in useKitProp's option name
 * @returns
 */
export function getUIKitTheme(componentName: string): ValidProps {
  return get(themeConfigStore, componentName)
}

/** related to {@link getUIKitTheme} */
export function hasUIKitTheme(componentName: string): boolean {
  return has(themeConfigStore, componentName)
}
