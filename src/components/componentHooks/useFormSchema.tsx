import { Match, Switch, createEffect, createSignal, on } from "solid-js"
import { Row } from "../Boxes"
import { Input, isInputDescription, type InputDescription } from "../Input"
import { List } from "../List"
import { Text } from "../Text"

type FormRecursiveDescription = {
  widgetType: "_recursive"
  innerForm: FormDescription
}
type FormDescription = InputDescription | FormRecursiveDescription

export type FormSchema = { [key: string]: FormDescription }

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
  options?: { onDataChange?(payload: { newSchema: unknown }): void }, // TODO: type unknown
) {
  const initSchemaData = {}
  const [schemaData, setSchemaData] = createSignal<object>(initSchemaData)
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
      setSchemaData(initSchemaData)
    },
  }
}
