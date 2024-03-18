import { KitProps, useKitProps } from "../../createKit"
import { ICSSGridItemOption, ICSSGridOption, icssGrid } from "../../styles/icssRules"
import { getICSSFromProps } from "../../utils/getICSSFromProps"
import { Box, BoxProps } from "./Box"

export type GridBoxProps = {
  [K in keyof ICSSGridOption as `icss:${K}`]?: ICSSGridOption[K]
} & BoxProps

/**
 * if for layout , don't render important content in GridBox
 * it's icss: props is from {@link ICSSGridOption}
 */
export function Grid(rawProps: KitProps<GridBoxProps>) {
  const { shadowProps, props } = useKitProps(rawProps, { name: "Grid" })
  const icssOption = getICSSFromProps(props)
  return <Box shadowProps={shadowProps} icss={icssGrid(icssOption)} />
}
