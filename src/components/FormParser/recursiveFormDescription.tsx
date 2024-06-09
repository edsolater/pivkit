import { FormDescription } from "./type"
import { formDescriptionSymbol } from "."

export function createFormDescription(): FormDescription {
  return {
    [formDescriptionSymbol]: true,
    widgetType: "_recursive",
    resultType: {},
    children: {},
  }
}
