import { defineConfig } from "vitepress"
import solidPlugin from "vite-plugin-solid"
import type MarkdownIt from "markdown-it"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Hello world",
  description: "A easy-to-read specification",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Examples", link: "/markdown-examples" },
    ],

    sidebar: [
      {
        text: "Examples",
        items: [
          { text: "Markdown Examples", link: "/markdown-examples" },
          { text: "Runtime API Examples", link: "/api-examples" },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/vuejs/vitepress" }],
  },
  vite: {
    plugins: [solidPlugin()],
  },
  markdown: {
    config: (md) => {
      md.use(markdownItCustomTag)
    },
  },
})
function markdownItCustomTag(md: MarkdownIt) {
  // 自定义解析 <tag>xxxx</tag> 语法
  md.block.ruler.before("html_block", "custom_tag", (state, startLine, endLine, silent) => {
    const start = state.bMarks[startLine] + state.tShift[startLine]
    const max = state.eMarks[startLine]

    const line = state.src.slice(start, max).trim()

    // 匹配 <tag> 和 </tag>
    if (!line.startsWith("<tag>") || !line.endsWith("</tag>")) {
      return false
    }

    const tagContent = line.slice(5, -6).trim() // 提取 <tag> 和 </tag> 中的内容

    if (silent) {
      return true
    }

    // 打开标签 token
    const token = state.push("custom_tag_open", "Tag", 1)
    token.markup = "<tag>"
    token.content = tagContent
    token.block = true

    // 标签中的内容
    const contentToken = state.push("inline", "", 0)
    contentToken.content = tagContent
    contentToken.children = []

    // 关闭标签 token
    state.push("custom_tag_close", "Tag", -1)

    state.line = startLine + 1
    return true
  })

  // 渲染规则，确保返回字符串
  md.renderer.rules.custom_tag_open = function () {
    return `<Tag variant="solid">` // 返回 HTML 片段字符串
  }

  md.renderer.rules.custom_tag_close = function () {
    return `</Tag>` // 返回关闭标签的字符串
  }
}
