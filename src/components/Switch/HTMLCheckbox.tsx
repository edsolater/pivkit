import { KitProps, useKitProps } from "../../createKit"
import { Piv } from "../../piv"
import { renderHTMLDOM } from "../../piv/propHandlers/renderHTMLDOM"

export interface HTMLCheckboxProps {
  label?: string
  defaultChecked?: boolean
}
export type HTMLCheckboxKitProps = KitProps<HTMLCheckboxProps>
export function HTMLCheckbox(kitProps: HTMLCheckboxKitProps) {
  const { props } = useKitProps(kitProps, { name: "HTMLCheckbox" })
  return (
    <Piv
      class="HTMLCheckbox"
      defineSelf={(selfProps) => renderHTMLDOM("input", selfProps)}
      htmlProps={{
        type: "checkbox",
        checked: props.defaultChecked,
        "aria-label": props.label ?? "checkbox",
      }}
      shadowProps={props}
    />
  )
}
