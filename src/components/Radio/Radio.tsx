import { Accessor } from "solid-js"
import { KitProps, useKitProps } from "../../createKit"
import { createSyncSignal } from "../../hooks/createSyncSignal"
import { Piv, PivProps } from "../../piv/Piv"
import { ValidController } from "../../piv/typeTools"
import { Label, LabelKitProps } from "../Label"
import { LabelBox, LabelBoxKitProps } from "../LabelBox"
import { HTMLInputRadio, HTMLInputRadioProps } from "./HTMLInputRadio"
import { createRadioStyle } from "./hooks/createRadioStyle"

export interface RadioController {
  option: string
  isChecked: Accessor<boolean>
  check: () => void
  uncheck: () => void
}

type RadioProps<Controller extends ValidController> = {
  option: string
  isChecked?: boolean
  onChange?(utils: { option: string; isChecked: boolean }): void
  "anatomy:ContainerBox"?: LabelBoxKitProps
  "anatomy:HTMLRadio"?: HTMLInputRadioProps
  "anatomy:Checkbox"?: PivProps<"div", Controller>
  "anatomy:Option"?: LabelKitProps
}

export type RadioKitProps<Controller extends ValidController = RadioController> = KitProps<
  RadioProps<Controller>,
  { controller: Controller }
>

const selfProps = ["isChecked", "option", "onChange"] satisfies (keyof RadioKitProps)[]

export type RadioDefaultRadioProps = typeof defaultProps

const defaultProps = {
  isChecked: false,
} satisfies Partial<RadioKitProps>

/**
 * Radio can illustrate a boolean value
 */
export function Radio(kitProps: RadioKitProps) {
  const { props, shadowProps, lazyLoadController } = useKitProps(kitProps, {
    name: "Radio",
    defaultProps,
    selfProps: selfProps,
  })

  const [isChecked, setIsChecked] = createSyncSignal({
    getValueFromOutside: () => props.isChecked,
    onInvokeSetter(value) {
      props.onChange?.({ isChecked: value, option: props.option ?? "" })
    },
  })

  const check = () => setIsChecked(true)
  const uncheck = () => setIsChecked(false)

  const { containerBoxStyleProps, htmlCheckboxStyleProps, radioCheckboxStyleProps, radioLabelStyleProps } =
    createRadioStyle({ props })

  const radioController = {
    isChecked,
    check,
    uncheck,
    get option() {
      return props.option
    },
  }

  lazyLoadController(radioController)

  return (
    <LabelBox shadowProps={[containerBoxStyleProps, shadowProps, props["anatomy:ContainerBox"]]}>
      <HTMLInputRadio
        shadowProps={[htmlCheckboxStyleProps, props["anatomy:HTMLRadio"]]}
        innerController={radioController}
        label={props.option}
        defaultChecked={props.isChecked}
        onClick={() => {
          setIsChecked((b) => !b)
        }}
      />

      {/* Radio Checkbox */}
      <Piv
        shadowProps={[radioCheckboxStyleProps, props["anatomy:Checkbox"]]}
        innerController={radioController}
        class="RadioCheckbox"
        icss={[{ display: "grid", placeContent: "center" }]}
      />

      {/* Radio Label */}
      <Label shadowProps={[radioLabelStyleProps, props["anatomy:Option"]]}>{props.option}</Label>
    </LabelBox>
  )
}
