import { createSignal } from 'solid-js'
import { Box } from './Boxes'
import { Button } from './Button'
import { ViewTransitionSliderBox } from './ViewTransitionSliderBox'

export type ViewTransitionSliderBoxExampleProps = {}

export const defaultProps: ViewTransitionSliderBoxExampleProps = {}

export function ViewTransitionSliderBoxExample(props: ViewTransitionSliderBoxExampleProps) {
  const [contentIndex, setContentIndex] = createSignal(0)
  const [count, setCount] = createSignal(0)
  return (
    <Box>
      <ViewTransitionSliderBox contentIndex={contentIndex()}>
        <Box
          icss={{
            width: '20em',
            height: '10em',
            background: count() % 2 === 0 ? 'crimson' : 'dodgerblue',
            color: 'white'
          }}
        >
          content {count()}
        </Box>
      </ViewTransitionSliderBox>

      <Button
        onClick={() => {
          setContentIndex((n) => n + 1)
          setTimeout(() => {
            setCount((c) => c + 1)
          }, 0)
        }}
      >
        Increase Count
      </Button>
    </Box>
  )
}
