import { isObjectLike } from "@edsolater/fnkit"
import type { PivChild } from "../../../piv"
import { Input } from "../../Input/Input"
import type { BasicFormDescription } from "./type"
import { formDescriptionSymbol, isFormDescription } from "."

export interface InputDescription extends BasicFormDescription {
  widgetType: "input"
  resultType: string // just for typescript to infer
}

export type InputSchemaOption = {}

export function createInputDescription(options?: InputSchemaOption): InputDescription {
  return { [formDescriptionSymbol]: true, widgetType: "input", resultType: "" }
}

export function createInputFromDescription(description: InputDescription): PivChild {
  return <Input />
}

export function isInputDescription(description: any): description is InputDescription {
  return isFormDescription(description) && (description as any).widgetType === "input"
}
