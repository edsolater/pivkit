import { isObjectLike } from "@edsolater/fnkit"
import { Match, Switch, createEffect, createSignal, on } from "solid-js"
import { useKitProps, type KitProps } from "../../createKit"
import { createRef } from "../../hooks"
import { Row } from "../Boxes"
import { Input, type InputController } from "../Input"
import { Loop } from "../Loop"
import { Text } from "../Text"
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
  reset(): void
  setValue(value: any): void
}

function WidgetByDescription(
  kitProps: KitProps<WidgetByDescriptionProps, { controller: WidgetByDescriptionController }>,
) {
  const { props, shadowProps, loadController } = useKitProps(kitProps)
  const [widgetRef, setRef] = createRef<InputController>()
  const controller: WidgetByDescriptionController = {
    reset() {
      widgetRef()?.setText?.(undefined)
    },
    setValue(value) {
      widgetRef()?.setText?.(value)
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
  const [schemaData, setSchemaData] = createSignal(initSchemaData)
  const [widgetControllerRefs, setRef] = createRef<{ key: string; controller: WidgetByDescriptionController }[]>({
    defaultValue: [],
  })

  const controller: SchemaParserController<T> = {
    schemaData,
    reset() {
      setSchemaData(() => initSchemaData)
      widgetControllerRefs().forEach((ref) => ref.controller.reset())
    },
    canSubmit() {
      return schemaData() !== initSchemaData && Object.keys(schemaData()).length > 0
    },
    setData(data) {
      setSchemaData((c) => ({ ...c, ...data }))
      widgetControllerRefs().forEach((ref) => ref.controller.setValue(data[ref.key]))
    },
  }

  loadController(controller)

  createEffect(on(schemaData, (newSchema) => props.onDataChange?.({ newSchema })))
  return (
    <Loop
      shadowProps={shadowProps}
      items={Object.entries(props.schema)}
      icss={{ display: "flex", flexDirection: "column", gap: "4px" }}
    >
      {([key, value]) => (
        <Row icss={{ gap: "4px" }}>
          <Text>{key}: </Text>
          <WidgetByDescription
            ref={(controller) => {
              setRef([...widgetControllerRefs(), { key, controller }])
            }}
            description={value}
            onWidgetDataChange={({ data }) => {
              setSchemaData((d) => ({ ...d, [key]: data }))
            }}
          />
        </Row>
      )}
    </Loop>
  )
}
