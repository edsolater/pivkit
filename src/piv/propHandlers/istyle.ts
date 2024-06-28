import { MayArray, arrify, mergeObjects, shakeNil, shrinkFn } from "@edsolater/fnkit"
import { JSX } from "solid-js"
import { LoadController, ValidController } from "../typeTools"

export type IStyle<Controller extends ValidController = ValidController> = MayArray<
  LoadController<JSX.HTMLAttributes<any>["style"] | undefined, Controller>
>

export function parseIStyles<Controller extends ValidController = ValidController>(
  styles: IStyle,
  controller: Controller = {} as Controller,
): JSX.HTMLAttributes<any>["style"] | undefined {
  if (!styles) return undefined
  // @ts-expect-error no need to check
  return mergeObjects(...shakeNil(arrify(styles).map((style) => shrinkFn(style, [controller]))))
}
