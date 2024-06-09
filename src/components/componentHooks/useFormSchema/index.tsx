import { isObjectLike, type Optional } from "@edsolater/fnkit"
import { Match, Switch, createEffect, createSignal, on } from "solid-js"
import { useKitProps, type KitProps } from "../../../createKit"
import { createRef } from "../../../hooks"
import { Row } from "../../Boxes"
import { Input, type InputController } from "../../Input"
import { List } from "../../List"
import { Text } from "../../Text"
import { isInputDescription } from "./inputFormDescription"
import { FormDescription, GetSchemaData, type FormSchema } from "./type"
export * from "./inputFormDescription"
export * from "./recursiveFormDescription"
export * from "./type"

export const formDescriptionSymbol = Symbol("formDescription")

export function isFormDescription(description: any): description is FormDescription {
  return isObjectLike(description) && description[formDescriptionSymbol] === true
}

type WidgetByDescriptionProps = {
  description: FormDescription
  onWidgetDataChange?: (payload: { data: unknown }) => void
}
type WidgetByDescriptionController = {
  resetInnerDeep(): void
}

function WidgetByDescription(
  kitProps: KitProps<WidgetByDescriptionProps, { controller: WidgetByDescriptionController }>,
) {
  const { props, shadowProps, lazyLoadController, loadController } = useKitProps(kitProps)
  const [widgetRef, setRef] = createRef<InputController>()
  const controller: WidgetByDescriptionController = {
    resetInnerDeep() {
      widgetRef()?.setText?.(undefined)
    },
  }
  loadController(controller)
  return (
    <Switch fallback={null}>
      <Match when={isInputDescription(props.description)}>
        <Input
          shadowProps={shadowProps}
          ref={setRef}
          onInput={(inputText) => {
            props.onWidgetDataChange?.({ data: inputText })
          }}
        />
      </Match>
    </Switch>
  )
}

type SchemaOjectProps = {
  schema: FormSchema

  onDataChange?(payload: { newSchemaData: any }): void
}
type SchemaOjectController = {
  resetInner(): void
}

function SchemaObject(kitProps: KitProps<SchemaOjectProps, { controller: SchemaOjectController }>) {
  const { props, shadowProps, loadController } = useKitProps(kitProps, {
    name: "SchemaObject",
    debugName: "debug",
  })
  const [innerSchemaData, setInnerSchemaData] = createSignal<object>({})
  const [widgetControllerRefs, setRef] = createRef<WidgetByDescriptionController[]>({ defaultValue: [] })

  const controller: SchemaOjectController = {
    resetInner() {
      setInnerSchemaData(() => ({}))
      widgetControllerRefs().forEach((ref) => ref.resetInnerDeep())
    },
  }

  loadController(controller)
  // kitProps.ref?.(controller)
  createEffect(on(innerSchemaData, (newSchemaData) => props.onDataChange?.({ newSchemaData })))

  return (
    <List
      shadowProps={shadowProps}
      items={Object.entries(props.schema)}
      icss={{ display: "flex", flexDirection: "column", gap: "4px" }}
    >
      {([key, value]) => (
        <Row icss={{ gap: "4px" }}>
          <Text>{key}: </Text>
          <WidgetByDescription
            ref={(controller) => {
              setRef([...widgetControllerRefs(), controller])
            }}
            description={value}
            onWidgetDataChange={({ data }) => {
              setInnerSchemaData((d) => ({ ...d, [key]: data }))
            }}
          />
        </Row>
      )}
    </List>
  )
}

export type SchemaParserProps<T extends FormSchema> = {
  schema: T
  onDataChange?(payload: { newSchema: any }): void
}

export type SchemaParserController<T extends FormSchema> = {
  schemaData(): GetSchemaData<T>
  reset(): void
  canSubmit(): boolean
  setData(data: Partial<GetSchemaData<T>>): void
}

export function SchemaParser<T extends FormSchema>(
  kitProps: KitProps<SchemaParserProps<T>, { controller: SchemaParserController<T> }>,
) {
  const { props, shadowProps, loadController } = useKitProps(kitProps, { name: "FormCreator" })
  const initSchemaData = {} as GetSchemaData<T>
  const [schemaData, setSchemaData] = createSignal<GetSchemaData<T>>(initSchemaData)
  const [schemaObjectRef, setRef] = createRef<SchemaOjectController>()

  const controller: SchemaParserController<T> = {
    schemaData,
    reset() {
      setSchemaData(() => initSchemaData)
      schemaObjectRef()?.resetInner()
    },
    canSubmit() {
      return schemaData() !== initSchemaData && Object.keys(schemaData()).length > 0
    },
    setData(data) {
      setSchemaData((c) => ({ ...c, data })) // CONTINUE HERE
    },
  }

  loadController(controller)
  return (
    <SchemaObject
      shadowProps={shadowProps}
      schema={props.schema}
      ref={setRef}
      onDataChange={({ newSchemaData }) => {
        setSchemaData(newSchemaData)
        props?.onDataChange?.({ newSchema: newSchemaData })
      }}
    />
  )
}
