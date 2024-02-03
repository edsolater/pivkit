import { AnyFn, AnyObj, MayFn } from '@edsolater/fnkit'
import { JSX, JSXElement } from 'solid-js'

export type ValidProps = Record<keyof any, Exclude<any, Promise<any>>>

/**
 * includes component controller and component methods
 */
export type ValidController = AnyObj

export type HTMLTag = keyof JSX.HTMLElementTags
/**
 * auto omit P2's same name props
 */
export type ExtendsProps<
  P1 extends ValidProps,
  P2 extends ValidProps = {},
  P3 extends ValidProps = {},
  P4 extends ValidProps = {},
> = P1 & Omit<P2, keyof P1> & Omit<P3, keyof P1 | keyof P2> & Omit<P4, keyof P1 | keyof P2 | keyof P3>

export type RawChild = JSXElement | string | number | boolean | null | undefined
export type PivChild<Controller extends ValidController = ValidController> =
  | RawChild
  | ((controller: Controller) => RawChild)
  | PivChild<Controller>[]
/**
 * recursively
 * we use signal to make reading code clearer, as getter is magic, it's confusing in large APP, so
 *
 * object literal or array type will inner be signal, not container
 */
export type SignalizeProps<T extends object | undefined> = {
  [K in keyof T]: T[K] extends AnyFn ? T[K] : () => T[K]
}

export type LoadController<Target, Controller extends ValidController | unknown = unknown> = MayFn<Target, [Controller]>
