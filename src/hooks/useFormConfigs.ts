type FormWidgetBoolean =
  | {
      id?: string
      isDisabled?: boolean
      required?: boolean
      /** default is switch */
      kit?: "switch" | "checkbox" | "auto"
      value: boolean
      label?: string
    }
  | boolean

type FormWidgetEnumOptionItem =
  | {
      label?: string
      value: string
    }
  | string
type FormWidgetEnum =
  | {
      id?: string
      isDisabled?: boolean
      required?: boolean
      /** if less than 4 items, default is radio; else, default is select  */
      kit?: "radios" | "select" | "auto"
      options: FormWidgetEnumOptionItem[]
    }
  | FormWidgetEnumOptionItem[]

type FormWidgetText =
  | {
      id?: string
      isDisabled?: boolean
      required?: boolean
      pattern?: RegExp
      /** if less than 3 placeholder words, default is input; else, default is select  */
      kit?: "input" | "textarea" | "auto"
      placeholder?: string
    }
  | string
  | ""

type FormWidgetNumber =
  | {
      id?: string
      isDisabled?: boolean
      required?: boolean
      /** default is number-input */
      kit?: "number-input" | "slider" | "auto"
      n: number
      max?: number
      min?: number
      step?: number
    }
  | number

type FormWidgetRange =
  | {
      id?: string
      isDisabled?: boolean
      required?: boolean
      /** default is number-input */
      kit?: "number-input" | "range-slider" | "auto"
      n1: number
      n2: number
    }
  | [number, number]

type FormWidget = FormWidgetBoolean | FormWidgetEnum | FormWidgetText | FormWidgetNumber | FormWidgetRange

type FormConfig = {
  [FormFieldName: string]: FormWidget
}

export function useFormConfigs(formConfig: FormConfig) {}
