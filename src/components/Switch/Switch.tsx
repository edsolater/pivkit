import { Accessor } from "solid-js"
import { KitProps, useKitProps } from "../../createKit"
import { createSyncSignal } from "../../hooks/createSyncSignal"
import { Piv } from "../../piv"
import { usePositionTranslate } from "../../webTools/hooks/usePositionTranslate"
import { Box } from "../Boxes"
import { LabelKitProps } from "../Label"
import { HTMLCheckbox, HTMLCheckboxProps } from "./HTMLCheckbox"
import { useSwitchStyle } from "./hooks/useSwitchStyle"

export interface SwitchController {
  isChecked: Accessor<boolean>
}

export type SwitchProps = KitProps<
  {
    isChecked?: boolean
    name?: string
    isDefaultChecked?: boolean
    onChange?(utils: { isChecked: boolean }): void
    /** for Chakra has, so i has */
    "anatomy:ContainerBox"?: LabelKitProps
    /** hidden HTML input(type=checkbox) for aria readbility */
    "anatomy:HTMLCheckbox"?: HTMLCheckboxProps
    /** SwitchThumb */
    "anatomy:Thumb"?: any
  },
  { controller: SwitchController }
>

const selfProps = [
  "isChecked",
  "name",
  "isDefaultChecked",
  "onChange",
  "anatomy:ContainerBox",
  "anatomy:HTMLCheckbox",
  "anatomy:Thumb",
] satisfies (keyof SwitchProps)[]

const accessifyPropNames = ["isChecked", "isDefaultChecked"] satisfies (keyof SwitchProps)[]

export type SwitchDefaultSwitchProps = typeof defaultProps

const defaultProps = {
  isDefaultChecked: false,
} satisfies Partial<SwitchProps>

/**
 * Switch can illustrate a boolean value
 */
export function Switch(rawProps: SwitchProps) {
  const { props, shadowProps, lazyLoadController } = useKitProps(rawProps, {
    name: "Switch",
    defaultProps,
    needAccessify: accessifyPropNames,
    selfProps: selfProps,
  })

  const [isChecked, setIsChecked] = createSyncSignal({
    value: () => props.isChecked ?? props.isDefaultChecked,
    onSetByInner(value) {
      props.onChange?.({ isChecked: value })
    },
  })

  const { wrapperLabelStyleProps, htmlCheckboxStyleProps, switchThumbStyleProps } = useSwitchStyle({ props })

  const { setMotionTargetRef } = usePositionTranslate({ observeOn: isChecked })

  const switchController = {
    isChecked,
  }

  lazyLoadController(switchController)

  return (
    <Box
      debugLog={["icss"]}
      innerController={switchController}
      shadowProps={[wrapperLabelStyleProps, shadowProps, props["anatomy:ContainerBox"]]}
    >
      <HTMLCheckbox
        shadowProps={[htmlCheckboxStyleProps, props["anatomy:HTMLCheckbox"]]}
        innerController={switchController}
        label={props.name}
        defaultChecked={props.isDefaultChecked}
        onClick={() => {
          setIsChecked((b) => !b)
        }}
      />

      {/* SwitchThumb */}
      <Piv
        shadowProps={[switchThumbStyleProps, props["anatomy:Thumb"]]}
        innerController={switchController}
        class="SwitchThumb"
        domRef={setMotionTargetRef}
        icss={[{ display: "grid", placeContent: "center" }]}
        // defineLastChild={({ isChecked }) => {
        //   console.count('rerun thumb child')
        //   return (
        //     <Piv
        //       icss={{
        //         color: isChecked() ? 'dodgerblue' : 'crimson',
        //         width: '0.5em',
        //         height: '0.5em',
        //         backgroundColor: 'currentcolor',
        //         transition: '600ms',
        //       }}
        //     />
        //   )
        // }}
      />
    </Box>
  )
}
