import { Match, Switch } from "solid-js"
import { Box, Row } from "../Boxes"
import { Input, isInputDescription, type InputDescription } from "../Input"
import { List } from "../List"
import { Text } from "../Text"

type FormRecursiveDescription = {
  widgetType: "_recursive"
  innerForm: FormDescription
}
type FormDescription = InputDescription | FormRecursiveDescription

export type FormSchema = { [key: string]: FormDescription }

function WidgetByFormDescription(props: { description: FormDescription }) {
  return (
    <Switch fallback={null}>
      <Match when={isInputDescription(props.description)}>
        <Input />
      </Match>
    </Switch>
  )
}

function FormSchemaObject(props: { schema: FormSchema }) {
  return (
    <Box>
      <List items={Object.entries(props.schema)}>
        {([key, value]) => (
          <Row>
            <Text>{key}: </Text>
            <WidgetByFormDescription description={value} />
          </Row>
        )}
      </List>
    </Box>
  )
}

export function useFormSchema<T extends FormSchema>(
  schema: T,
  options?: { onDataChange?(payload: { newSchema: T }): void },
) {
  const schemaParsedElement = () => <FormSchemaObject schema={schema} />
  return { schemaParsedElement, schemaData: schema }
}
