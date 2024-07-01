import { Box } from "./Boxes"
import { LoopKitProps, Loop } from "./Loop"

export function List<T>(kitProps: LoopKitProps<T>) {
  return <Loop $isList renderWrapper={Box} {...kitProps} />
}
