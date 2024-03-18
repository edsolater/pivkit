import type { Meta, StoryObj } from "storybook-solidjs"
import {
  ViewTransitionSliderBoxExample,
  type ViewTransitionSliderBoxExampleProps,
  defaultProps,
} from "./ViewTransitionSliderBoxExample"

const meta: Meta = {
  title: "Example/ViewTransitionSliderBox",
  component: ViewTransitionSliderBoxExample,
  tags: ["autodocs"],
  argTypes: {
    // variant: ['solid', 'outline', 'text']
  },
}

const primary: StoryObj<ViewTransitionSliderBoxExampleProps> = {
  args: defaultProps,
}

// More on how to set up stories at: https://storybook.js.org/docs/7.0/solid/writing-stories/introduction
export default meta

// More on writing stories with args: https://storybook.js.org/docs/7.0/solid/writing-stories/args
// see: https://storybook.js.org/docs/essentials/controls#annotation
export { primary }
