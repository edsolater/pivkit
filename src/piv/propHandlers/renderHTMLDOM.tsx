import { AnyObj } from "@edsolater/fnkit"
import { JSX, JSXElement, Show } from "solid-js"
import type { PivProps } from "../Piv"
import type { HTMLTag } from "../typeTools"
import { domMap } from "./domMap"
import { NativeProps, parsePivProps } from "./parsePivProps"

function getSolidJSXNode(type: HTMLTag, parsedProps: NativeProps, additionalProps?: AnyObj): JSX.Element | undefined {
  const node = domMap[type](parsedProps, additionalProps)
  return node
}

/**
 * handle props:if and props:ifSelfShown
 */
export const renderHTMLDOM = (
  type: HTMLTag,
  rawProps: PivProps<any, any>,
  additionalProps?: Record<any, any>,
): JSXElement => {
  const { props, ifOnlyNeedRenderChildren, ifOnlyNeedRenderSelf, selfCoverNode } = parsePivProps(rawProps)

  if (selfCoverNode) return selfCoverNode

  if (ifOnlyNeedRenderChildren === undefined && ifOnlyNeedRenderSelf === undefined) {
    // most case
    return getSolidJSXNode(type, props, additionalProps)
  } else if (ifOnlyNeedRenderSelf === undefined) {
    return <Show when={ifOnlyNeedRenderChildren}>{getSolidJSXNode(type, props, additionalProps)}</Show>
  } else if (ifOnlyNeedRenderChildren === undefined) {
    return (
      <>
        <Show when={ifOnlyNeedRenderSelf}>{getSolidJSXNode(type, props, additionalProps)}</Show>
        <Show when={() => !ifOnlyNeedRenderSelf()}>{props.children}</Show>
      </>
    )
  } else {
    return (
      <Show when={ifOnlyNeedRenderChildren}>
        <Show when={ifOnlyNeedRenderSelf}>{getSolidJSXNode(type, props, additionalProps)}</Show>
        <Show when={() => !ifOnlyNeedRenderSelf()}>{props.children}</Show>
      </Show>
    )
  }
}

export const renderAsHTMLMain = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("main", selfProps, additionalProps)
export const renderAsHTMLDiv = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("div", selfProps, additionalProps)
export const renderAsHTMLSpan = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("span", selfProps, additionalProps)
export const renderAsHTMLP = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("p", selfProps, additionalProps)
export const renderAsHTMLButton = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("button", selfProps, additionalProps)
export const renderAsHTMLInput = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("input", selfProps, additionalProps)
export const renderAsHTMLForm = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("form", selfProps, additionalProps)
export const renderAsHTMLLabel = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("label", selfProps, additionalProps)
export const renderAsHTMLNav = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("nav", selfProps, additionalProps)
export const renderAsHTMLSection = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("section", selfProps, additionalProps)
export const renderAsHTMLHeader = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("header", selfProps, additionalProps)
export const renderAsHTMLFooter = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("footer", selfProps, additionalProps)
export const renderAsHTMLAside = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("aside", selfProps, additionalProps)
export const renderAsHTMLH1 = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("h1", selfProps, additionalProps)
export const renderAsHTMLH2 = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("h2", selfProps, additionalProps)
export const renderAsHTMLH3 = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("h3", selfProps, additionalProps)
export const renderAsHTMLH4 = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("h4", selfProps, additionalProps)
export const renderAsHTMLH5 = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("h5", selfProps, additionalProps)
export const renderAsHTMLH6 = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("h6", selfProps, additionalProps)
export const renderAsHTMLUl = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("ul", selfProps, additionalProps)
export const renderAsHTMLOl = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("ol", selfProps, additionalProps)
export const renderAsHTMLLi = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("li", selfProps, additionalProps)
export const renderAsHTMLTable = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("table", selfProps, additionalProps)
export const renderAsHTMLTr = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("tr", selfProps, additionalProps)
export const renderAsHTMLTd = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("td", selfProps, additionalProps)
export const renderAsHTMLTh = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("th", selfProps, additionalProps)
export const renderAsHTMLTbody = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("tbody", selfProps, additionalProps)
export const renderAsHTMLThead = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("thead", selfProps, additionalProps)
export const renderAsHTMLTfoot = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("tfoot", selfProps, additionalProps)
export const renderAsHTMLA = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("a", selfProps, additionalProps)
export const renderAsHTMLImg = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("img", selfProps, additionalProps)
export const renderAsHTMLSelect = (selfProps: any, additionalProps?: Record<any, any>) =>
  renderHTMLDOM("select", selfProps, additionalProps)
