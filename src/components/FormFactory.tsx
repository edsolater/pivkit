import { isObject } from "@edsolater/fnkit"
import { JSX, type JSXElement } from "solid-js"

/** a special component for creating element tree by pure js data
 *
 * @todo: how to turn pure object tree to component tree ?
 */
export function FormFactory<T extends Record<string, any>>(props: {
  /**
   * @example
   * {
   *  name: "John",
   * }
   */
  formObj: T

  /**
   * object sometimes is orderless, so you can specify the order of keys manually
   * @example
   * ["name", "category", "price"]
   */
  keyOrder?: (keyof T)[]

  /**
   * JSXElement ----> render a JSXElement \
   * object or array ----> pass through the factory function again \
   * primitive value ----> render in original jsx rule
   * @example
   * widgetMap={{ comment: (value) => <Text>{value}</Text> }}
   */
  widgetMap: { [K in keyof T]?: (value: T[K]) => JSXElement }
}) {
  return (
    <>
      {(props.keyOrder
        ? Object.entries(props.formObj).sort(
            ([keyA], [keyB]) => props.keyOrder!.indexOf(keyA) - props.keyOrder!.indexOf(keyB),
          )
        : Object.entries(props.formObj)
      ).map(([key, value]) => props.widgetMap[key]?.(value))}
    </>
  )
}

function getByPath(obj: object, path: (string | number | symbol)[]) {
  let currentObj = obj
  for (const key of path) {
    if (!isObject(currentObj)) break
    currentObj = currentObj[key]
  }
  return currentObj
}

function isJSXElement(v: any): v is JSX.Element {
  return isObject(v) && "type" in v && v.type !== undefined
}
