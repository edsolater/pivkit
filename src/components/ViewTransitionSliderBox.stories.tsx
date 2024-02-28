import type { Meta, StoryObj } from 'storybook-solidjs'
import { ViewTransitionSliderBox } from './ViewTransitionSliderBox'

// More on how to set up stories at: https://storybook.js.org/docs/7.0/solid/writing-stories/introduction
const meta = {
  title: 'Example/ViewTransitionSliderBox',
  component: ViewTransitionSliderBox,
  tags: ['autodocs'],
  argTypes: {
    // variant: ['solid', 'outline', 'text']
  }
} satisfies Meta<typeof ViewTransitionSliderBox>

export default meta

type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/7.0/solid/writing-stories/args
// see: https://storybook.js.org/docs/essentials/controls#annotation
export const Primary: Story = {
  args: {
    children: 'button',
  }
}
