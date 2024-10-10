import { shrinkFn, type MayFn } from "@edsolater/fnkit"
import { withPopupWidget, type PopupDirection } from "../../plugins"
import { Text } from "../Text"
import { TooltipPanel } from "../Tooltip"

/**
 * @example
 * <Button
*    plugin={withTooltip({ text: "show iframe", popupDirection: "bottom" })}
*    onClick={handleToggleIframePreview}
*  >
*    <Icon name="show-iframe" src={"/icons/preview.svg"} />
*  </Button>
 */
export const withTextTooltip = ({ text, popupDirection }: { text: MayFn<string>; popupDirection?: PopupDirection }) =>
  withPopupWidget.config({ // TODO: i think config is a poor design. `withPopupWidget` is a descriptive variable name.  but `config` is not very descriptive
    // TODO: should show with hover
    shouldFocusChildWhenOpen: true,
    popupDirection: popupDirection,
    elementHtmlTitle: shrinkFn(text),
    triggerBy: "hover",
    popElement: () => (
      <TooltipPanel>
        <Text>{text}</Text>
      </TooltipPanel>
    ),
  })
