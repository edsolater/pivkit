import { isObjectLike } from "@edsolater/fnkit"
import { Match, Switch, createEffect, createSignal, on } from "solid-js"
import { useKitProps, type KitProps } from "../../../createKit"
import { createControllerRef, createRef } from "../../../hooks"
import { Box, Row } from "../../Boxes"
import { Input, type InputController } from "../../Input"
import { List } from "../../List"
import { Text } from "../../Text"
import { isInputDescription } from "./inputFormDescription"
import { FormDescription, FormSchema, GetSchemaData } from "./type"
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
  reset(): void
}

function WidgetByDescription(
  kitProps: KitProps<WidgetByDescriptionProps, { controller: WidgetByDescriptionController }>,
) {
  const { props, shadowProps, lazyLoadController } = useKitProps(kitProps)
  const [widgetRef, setRef] = createControllerRef<InputController>()
  const controller: WidgetByDescriptionController = {
    reset() {
      console.log("reset")
      widgetRef.setText?.(undefined)
    },
  }
  lazyLoadController(() => controller)
  return (
    <Switch fallback={null}>
      <Match when={isInputDescription(props.description)}>
        <Input
          shadowProps={shadowProps}
          controllerRef={setRef}
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
  reset(): void
}

function SchemaObject(KitProps: KitProps<SchemaOjectProps, { controller: SchemaOjectController }>) {
  const { props, shadowProps, lazyLoadController } = useKitProps(KitProps)
  const [innerSchemaData, setInnerSchemaData] = createSignal<object>({})
  const [widgetControllerRefs, setRef] = createRef<WidgetByDescriptionController[]>({ defaultValue: [] })

  createEffect(on(innerSchemaData, (newSchemaData) => props.onDataChange?.({ newSchemaData })))

  const controller: SchemaOjectController = {
    reset() {
      setInnerSchemaData(() => ({}))
      widgetControllerRefs().forEach((ref) => ref.reset())
    },
  }

  lazyLoadController(controller)

  return (
    <Box>
      <List
        shadowProps={shadowProps}
        items={Object.entries(props.schema)}
        icss={{ display: "flex", flexDirection: "column", gap: "4px" }}
      >
        {([key, value]) => (
          <Row icss={{ gap: "4px" }}>
            <Text>{key}: </Text>
            <WidgetByDescription
              controllerRef={(controller) => {
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
    </Box>
  )
}

export function useFormSchema<T extends FormSchema>(
  schema: T,
  options?: { onDataChange?(payload: { newSchema: GetSchemaData<T> }): void }, // TODO: type unknown
) {
  const initSchemaData = {} as GetSchemaData<T>
  const [schemaData, setSchemaData] = createSignal<GetSchemaData<T>>(initSchemaData)
  const [schemaObjectRef, setRef] = createRef<SchemaOjectController>()
  const schemaParsedElement = () => (
    <SchemaObject
      schema={schema}
      controllerRef={(c) => {
        // load controller but not worked
        console.log("schemaObject controller ref: ", Object.keys(c))
        return setRef(c)
      }}
      onDataChange={({ newSchemaData }) => {
        setSchemaData(newSchemaData)
        options?.onDataChange?.({ newSchema: newSchemaData })
      }}
    />
  )
  return {
    schemaParsedElement,
    schemaData,
    reset() {
      setSchemaData(() => initSchemaData)
      console.log("start reset 0", schemaObjectRef())
      schemaObjectRef()?.reset()
    },
  }
}
