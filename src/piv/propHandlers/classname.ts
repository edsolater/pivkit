import { flap, isObjectLike, isTruthy, MayArray, shrinkFn } from "@edsolater/fnkit"
import { LoadController, ValidController } from "../typeTools"

export type ClassName<Controller extends ValidController | unknown = unknown> = LoadController<
  any | { [classname: string]: LoadController<boolean, Controller> },
  Controller
>

export function classname<Controller extends ValidController | unknown = unknown>(
  classNameArray: MayArray<ClassName<Controller>>,
  controller?: Controller,
) {
  return flap(classNameArray)
    .filter(isTruthy)
    .flatMap((classItemFn) => {
      const classItem = shrinkFn(classItemFn, [controller])
      return isObjectLike(classItem)
        ? Object.entries(classItem).map(([classString, condition]) => shrinkFn(condition, [controller]) && classString)
        : classItem
    })
    .join(" ")
}
