import type { Meta, StoryObj } from 'storybook-solidjs'
import {
  ViewTransitionSliderBoxExample,
  type ViewTransitionSliderBoxExampleProps,
  defaultProps
} from './ViewTransitionSliderBoxExample'

// More on how to set up stories at: https://storybook.js.org/docs/7.0/solid/writing-stories/introduction
const meta: Meta = {
  title: 'Example/ViewTransitionSliderBox',
  component: ViewTransitionSliderBoxExample,
  tags: ['autodocs'],
  argTypes: {
    // variant: ['solid', 'outline', 'text']
  }
}

// More on writing stories with args: https://storybook.js.org/docs/7.0/solid/writing-stories/args
// see: https://storybook.js.org/docs/essentials/controls#annotation
const primary: StoryObj<ViewTransitionSliderBoxExampleProps> = {
  args: defaultProps
}

export default meta
export { primary }
