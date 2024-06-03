import { isObjectLike } from "@edsolater/fnkit"
import { Match, Switch, createEffect, createSignal, on } from "solid-js"
import { Row } from "../../Boxes"
import { Input } from "../../Input"
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

function WidgetByFormDescription(props: {
  description: FormDescription
  onWidgetDataChange?: (payload: { data: unknown }) => void
}) {
  return (
    <Switch fallback={null}>
      <Match when={isInputDescription(props.description)}>
        <Input
          onInput={(inputText) => {
            props.onWidgetDataChange?.({ data: inputText })
          }}
        />
      </Match>
    </Switch>
  )
}

function FormSchemaObject(props: { schema: FormSchema; onDataChange?(payload: { newSchemaData: any }): void }) {
  const [innerSchemaData, setSchemaData] = createSignal<object>({})
  createEffect(on(innerSchemaData, (newSchemaData) => props.onDataChange?.({ newSchemaData })))
  return (
    <List items={Object.entries(props.schema)} icss={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {([key, value]) => (
        <Row icss={{ gap: "4px" }}>
          <Text>{key}: </Text>
          <WidgetByFormDescription
            description={value}
            onWidgetDataChange={({ data }) => {
              setSchemaData((d) => ({ ...d, [key]: data }))
            }}
          />
        </Row>
      )}
    </List>
  )
}

export function useFormSchema<T extends FormSchema>(
  schema: T,
  options?: { onDataChange?(payload: { newSchema: GetSchemaData<T> }): void }, // TODO: type unknown
) {
  const initSchemaData = {} as GetSchemaData<T>
  const [schemaData, setSchemaData] = createSignal<GetSchemaData<T>>(initSchemaData)
  const schemaParsedElement = () => (
    <FormSchemaObject
      schema={schema}
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
    },
  }
}
