import { isObject, pipeFns, withAddDefault, type AnyObj } from "@edsolater/fnkit"
import { createMemo, JSX, Show, type Accessor, type JSXElement } from "solid-js"
import { useKitProps, type KitProps } from "../createKit"
import { createComponentContext, useComponentContext } from "../hooks"
import { AddProps } from "../piv"

const FormFactoryContext = createComponentContext<{ obj: object }>()
/** a special component for creating element tree by pure js data
 *
 * @todo: how to turn pure object tree to component tree ?
 *
 * @example use object config
 * <FormFactory
 *  formObj={innerItemData}
 *  keyOrder={["name", "tags"]}
 *  widgetMap={{
 *    comment: (value) => <Text>{value}</Text>,
 *  }}
 *>
 * @example use sub-component
 * <FormFactory formObj={innerItemData}>
 *   <FormFactoryBlock name="comment">{(value) => <Text>{value}</Text>}</FormFactoryBlock>
 * </FormFactory>
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
  widgetMap?: { [K in keyof T]?: (value: T[K]) => JSXElement }
  children?: JSXElement
}) {
  return (
    <FormFactoryContext.Provider value={{ obj: props.formObj }}>
      {props.widgetMap
        ? (props.keyOrder
            ? Object.entries(props.formObj).sort(([keyA], [keyB]) =>
                props.keyOrder?.includes(keyA) && props.keyOrder.includes(keyB)
                  ? props.keyOrder.indexOf(keyA) - props.keyOrder.indexOf(keyB)
                  : 0,
              )
            : Object.entries(props.formObj)
          ).map(([key, value]) => props.widgetMap?.[key]?.(value))
        : undefined}
      {props.children}
    </FormFactoryContext.Provider>
  )
}

type FormFactoryBlockProps<F extends keyof T, T extends AnyObj> = {
  name: F
  children: (currentValue: Accessor<T[F]>) => JSXElement

  /**
   *  always shown even value is undefined
   * @default true
   */
  visiable?: boolean

  /**
   * usually **no need** to set this. it will cover automaticly.
   * by default when value is not undefined, component will show
   */
  visiableWhen?: (currentValue: Accessor<T[F]>) => any

  /** applied when currnetValue is undefined (often this is a placeholder) */
  defaultValue?: T[F]
}

export function FormFactoryBlock<T extends AnyObj, F extends keyof T>(
  kitProps: KitProps<FormFactoryBlockProps<F, T>, { noNeedDeAccessifyProps: ["children", "visiableWhen"] }>,
) {
  const { props, methods, shadowProps } = useKitProps(kitProps, {
    noNeedDeAccessifyProps: ["children", "when"],
    defaultProps: {
      visiable: true,
    },
  })
  const [contextStore] = useComponentContext(FormFactoryContext)
  const newValue = createMemo(() => contextStore.obj[props.name as keyof any])
  const enabled = createMemo(() => {
    if (props.visiable) return true
    if (methods.visiableWhen) return methods.visiableWhen?.(newValue)
    // when value is not undefined, component will show
    return "defaultValue" in props || props.name in contextStore.obj
  })
  return (
    <Show when={enabled()}>
      <AddProps shadowProps={shadowProps}>
        {kitProps.children(pipeFns(newValue, withAddDefault(props.defaultValue, { applyWhen: "falsy" })))}
      </AddProps>
    </Show>
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
