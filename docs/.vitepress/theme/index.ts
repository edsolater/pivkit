import DefaultTheme from "vitepress/theme"
import { Tag } from "../../../src/components/Tag"

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component("Tag", Tag)
  },
}
