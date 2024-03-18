import { KitProps, useKitProps } from "../../createKit"
import { Piv } from "../../piv"
import { renderHTMLDOM } from "../../piv/propHandlers/renderHTMLDOM"

export interface HTMLInputRadioProps {
  label?: string
  defaultChecked?: boolean
}
export type HTMLInputRadioKitProps = KitProps<HTMLInputRadioProps>
export function HTMLInputRadio(kitProps: HTMLInputRadioKitProps) {
  const { props } = useKitProps(kitProps, { name: "HTMLInputRadio" })
  return (
    <Piv
      class="HTMLCheckbox"
      render:self={(selfProps) => renderHTMLDOM("input", selfProps)}
      htmlProps={{
        type: "radio",
        checked: props.defaultChecked,
        "aria-label": props.label ?? "radio",
      }}
      shadowProps={props}
    />
  )
}
