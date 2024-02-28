import { Box } from './Boxes'
import { ViewTransitionSliderBox } from './ViewTransitionSliderBox'
import { Show, createEffect, createSignal } from 'solid-js'

export type ViewTransitionSliderBoxExampleProps = {
  triggerIsOn?: boolean
}

export const defaultProps: ViewTransitionSliderBoxExampleProps = {
  triggerIsOn: true
}

export function ViewTransitionSliderBoxExample(props: ViewTransitionSliderBoxExampleProps) {
  const [contentIndex, setContentIndex] = createSignal(0)
  createEffect(() => {
    setContentIndex(Number(props.triggerIsOn))
  })
  return (
    <ViewTransitionSliderBox contentIndex={contentIndex()}>
      <Show when={contentIndex() === 0}>
        <Box icss={{ width: '20em', height: '10em', background: 'dodgerblue', color: 'white' }}>content 0</Box>
      </Show>
      <Show when={contentIndex() === 1}>
        <Box icss={{ width: '20em', height: '10em', background: 'crimson', color: 'white' }}>content 1</Box>
      </Show>
    </ViewTransitionSliderBox>
  )
}
