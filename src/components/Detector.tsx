import { createEffect, onCleanup, type Accessor } from "solid-js"
import { KitProps, useKitProps } from "../createKit"
import { createDisclosure, createDomRef } from "../hooks"
import { AddProps, Piv } from "../piv"
import { PivChild } from "../piv/typeTools"
import { listenDomEvent } from "../webTools"

export type DetectorProps = {
  children(payload: { isHovered: Accessor<boolean> }): PivChild
}

export type DetectorKitProps = KitProps<DetectorProps, { noNeedDeAccessifyProps: ["children"] }>

/**
 * <Detector> is a <AddProps> wrapper
 * to detect hover state, or other state
 * @example:
 * <Detector>
 *  {({ isHovered }) => <Box icss={{ color: isHovered() ? "red" : "blue" }} />}
 * </Detector>
 */
export function Detector(kitProps: DetectorKitProps) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "Detector", noNeedDeAccessifyProps: ["children"] })
  const { dom, setDom } = createDomRef()
  const [isHovered, { set }] = createDisclosure(false)

  createEffect(() => {
    const el = dom()
    if (!el) return

    // core of detect hover state
    // TODO: pointer move is not detected yet
    const subscription1 = listenDomEvent(el, "pointerenter", () => set(true))
    onCleanup(() => subscription1.cancel)
    const subscription2 = listenDomEvent(el, "pointerleave", () => set(false))
    onCleanup(() => subscription2.cancel)
  })

  return (
    <AddProps shadowProps={shadowProps} domRef={setDom}>
      {props.children({ isHovered })}
    </AddProps>
  )
}
