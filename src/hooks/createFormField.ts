import { isUndefined } from '@edsolater/fnkit'
import { Accessify, createSyncSignal, deAccessify } from '..'
import { Accessor } from 'solid-js'

export type FormField<T> = {
  value: Accessor<T>
  setValue: (to: T) => void
  isEmpty: Accessor<boolean>
  isValid: Accessor<boolean>
}

export type UseFormFieldOptions<T> = {
  name: string
  value?: Accessify<T>
  onChange?(value: T): void

  // if not specified, value will always be considered as valid
  validRule?(value: any): boolean
}

/**
 * hold form value
 * @param opts init confit
 */
export function createFormField<T>(opts: Omit<UseFormFieldOptions<T | undefined>, 'value'>): FormField<T | undefined>
export function createFormField<T>(opts: Omit<UseFormFieldOptions<T>, 'value'> & { value: Accessify<T> }): FormField<T>
export function createFormField(opts: UseFormFieldOptions<any>): FormField<any> {
  const [value, setValue] = createSyncSignal({
    getValueFromOutside: () => deAccessify(opts.value),
    onInvokeSetter: (to) => {
      opts.onChange?.(to)
    },
  })
  const isEmpty = () => {
    const v = value()
    return isUndefined(v) || v === ''
  }
  const isValid = () => (opts.validRule ? opts.validRule(value()) : true)

  return { value, setValue, isEmpty, isValid }
}
