import { PivChild, Piv } from "../../../piv"
import { RadioController, RadioKitProps } from ".."

/**
 * component plugin
 * can render radio Thumb
 * @todo it should be plugin
 */
export function renderRadioThumb(
  renderContent: PivChild<RadioController> = ({ isChecked }) => (
    <Piv
      icss={{
        color: isChecked() ? "dodgerblue" : "crimson",
        width: "0.5em",
        height: "0.5em",
        backgroundColor: "currentcolor",
        transition: "600ms",
        borderRadius: "999px",
      }}
    />
  ),
): RadioKitProps["shadowProps"] {
  return {
    "anatomy:Thumb": {
      "render:lastChild": renderContent,
    },
  }
}
