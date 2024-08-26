import { useKitProps, type KitProps } from "../createKit"
import { icssCardPanel } from "../styles"
import { Panel } from "./Boxes"

export type TooltipPanelController = {}
export type TooltipPanelProps = {
  variant?: "no-style"
}
export function TooltipPanel(kitProps: KitProps<TooltipPanelProps, { controller: TooltipPanelController }>) {
  const { loadController, props, shadowProps } = useKitProps(kitProps, { name: "Tooltip" })
  return (
    <Panel
      shadowProps={shadowProps}
      icss={props.variant === "no-style" ? undefined : [icssCardPanel, { paddingBlock: "8px", borderRadius: "8px" }]}
    >
      {props.children}
    </Panel>
  )
}
