import { isObjectLike } from "@edsolater/fnkit"
import type { PivChild } from "../../../piv"
import { Input } from "../Input"

export type InputDescription = {
  widgetType: "input"
  resultType: string // just for typescript to infer
}

export type InputSchemaOption = {}

export function createInputDescription(options?: InputSchemaOption): InputDescription {
  return { widgetType: "input", resultType: "" }
}

export function createInputFromDescription(description: InputDescription): PivChild {
  return <Input />
}

export function isInputDescription(description: any): description is InputDescription {
  return isObjectLike(description) && (description as any).widgetType === "input"
}
