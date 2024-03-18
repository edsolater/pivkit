import { DeKitProps } from "../../../createKit"
import { cssColors, cssDarken, cssOpacity, cssVar } from "../../../styles"
import { LabelKitProps } from "../../Label"
import { HTMLInputRadioKitProps } from "../HTMLInputRadio"
import { RadioKitProps } from "../Radio"

/** {@link RadioKitProps} should extends this  */
export type RadioStyleProps = {}

/**
 * hook for radio's **style**
 */
export function createRadioStyle(params: { props: DeKitProps<RadioKitProps> }) {
  const containerBoxStyleProps = {
    icss: {
      display: "flex",
      gap: ".25em",
      alignItems: "center",
      "&:hover": {
        filter: "brightness(1.1)",
      },
      "&:active": {
        filter: "brightness(1.2)",
      },
      transition: "300ms",
    },
  } satisfies Partial<LabelKitProps>

  const htmlCheckboxStyleProps = {
    icss: {
      position: "absolute",
      border: "0px",
      outline: "none",
      opacity: 0,
      width: "1px",
      height: "1px",
      margin: "-1px",
      overflow: "hidden",
    },
  } satisfies Partial<HTMLInputRadioKitProps>

  // FIXME: why not a createMemo is ok ?
  const radioCheckboxStyleProps = {
    icss: ({ isChecked }) => ({
      "@layer default-variable": {
        "--accent-color": cssColors.accentColor,
        "--accent-color-hover": "dodgerblue",

        "--radio-border": cssColors.accentColor,
        "--radio-border-hover": "dodgerblue",
        "--radio-border-unchecked": cssOpacity(cssDarken(cssVar("--radio-border"), 0.8), 0.2),
      },

      position: "relative",
      display: "grid",
      placeItems: "center",
      height: "60%",
      aspectRatio: "1",
      borderRadius: "999em",
      borderStyle: "solid",

      background: isChecked() ? cssVar("--accent-color") : cssColors.transparent,
      borderColor: isChecked() ? cssVar("--radio-border") : cssVar("--radio-border-unchecked"),
      transition: "60ms",

      "&::before": {
        content: '""',
        display: "block",
        position: "absolute",
        width: "45%",
        aspectRatio: "1",
        borderRadius: "999em",
        backgroundColor: "white",
      },
    }),
  } satisfies Partial<RadioKitProps>

  const radioLabelStyleProps = {
    icss: {},
  } satisfies Partial<LabelKitProps>

  return { containerBoxStyleProps, htmlCheckboxStyleProps, radioCheckboxStyleProps, radioLabelStyleProps }
}
