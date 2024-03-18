import { AnyFn, shrinkFn } from "@edsolater/fnkit"

type PipelineMachine<T> = {
  pipe<F extends AnyFn>(fn: F): PipelineMachine<ReturnType<F>>
  calcValue(): T
}
// can pipe functions like promise::then()
export function makePipline<T>(value: T | (() => T)): PipelineMachine<T> {
  const getValue = () => shrinkFn(value)
  return {
    pipe(fn) {
      return makePipline(() => fn(getValue()))
    },
    calcValue() {
      return getValue()
    },
  }
}
