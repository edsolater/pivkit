import { ViewTransitionSliderBox } from "./ViewTransitionSliderBox"
import { createEffect, createSignal } from "solid-js"

export type ViewTransitionSliderBoxExampleProps = {
  triggerIsOn?: boolean
}
export const defaultProps: ViewTransitionSliderBoxExampleProps = {
  triggerIsOn: true,
}
export function ViewTransitionSliderBoxExample(props: ViewTransitionSliderBoxExampleProps) {
  const [contentIndex, setContentIndex] = createSignal(0)
  createEffect(() => {
    setContentIndex(Number(props.triggerIsOn))
  })
  return <ViewTransitionSliderBox contentIndex={contentIndex()}>{contentIndex()}</ViewTransitionSliderBox>
}
