import { arrify, shrinkFn, type Booleanable, type MayArray, type MayFn } from "@edsolater/fnkit"
import { createEffect, createSignal } from "solid-js"
import type { Accessify } from "../utils"

type ValidatorOption<V> = {
  value: Accessify<V>
  /** a short cut for validator */
  disabled?: Accessify<boolean>
  enabled?: Accessify<boolean>
  /** must all condition passed */
  validatorRules?: MayArray<{
    name: string
    /** must return true to pass this validator */
    should: MayFn<Booleanable, [value: V]>
  }>
  onValid?(): void
  onInvalid?(option: { name: string }): void
}

export function useValidators<V>(options: ValidatorOption<V>) {
  const [isValid, setIsValid] = createSignal(true)

  function check(): boolean {
    if (shrinkFn(options.disabled)) return false
    if (shrinkFn(options.enabled)) return true
    const value = shrinkFn(options.value)
    const isAllValid = arrify(options?.validatorRules).every((validator) => {
      if (!validator) return true
      const isValid = shrinkFn(validator.should, [value])
      if (!isValid) {
        options.onInvalid?.({ name: validator.name })
      }
      return isValid
    })
    if (isAllValid) {
      options.onValid?.()
    }
    return isAllValid
  }

  createEffect(() => {
    setIsValid(check())
  })
  
  return isValid
}
