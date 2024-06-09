import { formDescriptionSymbol } from "."

import type { InputDescription } from "./inputFormDescription"

//TODO Feature: imply this recursive loop
export interface FormRecursiveDescription extends BasicFormDescription {
  widgetType: "_recursive"
  resultType: object // just for typescript to infer
  children: FormSchema
}

export type BasicFormDescription = {
  [formDescriptionSymbol]: true
  widgetType: string
  resultType: unknown
}

export type FormDescription = InputDescription | FormRecursiveDescription

export type FormSchema = { [key: string]: FormDescription }

export type GetSchemaData<T extends FormSchema> = {
  [K in keyof T]: T[K]["resultType"] | undefined
}
