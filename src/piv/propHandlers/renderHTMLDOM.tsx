import { AnyObj, switchCase } from '@edsolater/fnkit'
import { JSX, JSXElement, Show } from 'solid-js'
import { PivProps } from '../Piv'
import { HTMLTag } from '../typeTools'
import { domMap } from './domMap'
import { NativeProps, parsePivProps } from './parsePivProps'

function getSolidJSXNode(type: HTMLTag, parsedProps: NativeProps, additionalProps?: AnyObj): JSX.Element | undefined {
  return switchCase(type, domMap(parsedProps, additionalProps))
}

/**
 * handle props:if and props:ifSelfShown
 */
export const renderHTMLDOM = (
  type: HTMLTag,
  rawProps: PivProps<any, any>,
  additionalProps?: Record<any, any>
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

export const renderAsHTMLMain = (selfProps: any) => renderHTMLDOM('main', selfProps)
export const renderAsHTMLDiv = (selfProps: any) => renderHTMLDOM('div', selfProps)
export const renderAsHTMLSpan = (selfProps: any) => renderHTMLDOM('span', selfProps)
export const renderAsHTMLP = (selfProps: any) => renderHTMLDOM('p', selfProps)
export const renderAsHTMLButton = (selfProps: any) => renderHTMLDOM('button', selfProps)
export const renderAsHTMLInput = (selfProps: any) => renderHTMLDOM('input', selfProps)
export const renderAsHTMLForm = (selfProps: any) => renderHTMLDOM('form', selfProps)
export const renderAsHTMLLabel = (selfProps: any) => renderHTMLDOM('label', selfProps)
export const renderAsHTMLNav = (selfProps: any) => renderHTMLDOM('nav', selfProps)
export const renderAsHTMLSection = (selfProps: any) => renderHTMLDOM('section', selfProps)
export const renderAsHTMLHeader = (selfProps: any) => renderHTMLDOM('header', selfProps)
export const renderAsHTMLFooter = (selfProps: any) => renderHTMLDOM('footer', selfProps)
export const renderAsHTMLAside = (selfProps: any) => renderHTMLDOM('aside', selfProps)
export const renderAsHTMLH1 = (selfProps: any) => renderHTMLDOM('h1', selfProps)
export const renderAsHTMLH2 = (selfProps: any) => renderHTMLDOM('h2', selfProps)
export const renderAsHTMLH3 = (selfProps: any) => renderHTMLDOM('h3', selfProps)
export const renderAsHTMLH4 = (selfProps: any) => renderHTMLDOM('h4', selfProps)
export const renderAsHTMLH5 = (selfProps: any) => renderHTMLDOM('h5', selfProps)
export const renderAsHTMLH6 = (selfProps: any) => renderHTMLDOM('h6', selfProps)
export const renderAsHTMLUl = (selfProps: any) => renderHTMLDOM('ul', selfProps)
export const renderAsHTMLOl = (selfProps: any) => renderHTMLDOM('ol', selfProps)
export const renderAsHTMLLi = (selfProps: any) => renderHTMLDOM('li', selfProps)
export const renderAsHTMLTable = (selfProps: any) => renderHTMLDOM('table', selfProps)
export const renderAsHTMLTr = (selfProps: any) => renderHTMLDOM('tr', selfProps)
export const renderAsHTMLTd = (selfProps: any) => renderHTMLDOM('td', selfProps)
export const renderAsHTMLTh = (selfProps: any) => renderHTMLDOM('th', selfProps)
export const renderAsHTMLTbody = (selfProps: any) => renderHTMLDOM('tbody', selfProps)
export const renderAsHTMLThead = (selfProps: any) => renderHTMLDOM('thead', selfProps)
export const renderAsHTMLTfoot = (selfProps: any) => renderHTMLDOM('tfoot', selfProps)
export const renderAsHTMLA = (selfProps: any) => renderHTMLDOM('a', selfProps)
export const renderAsHTMLImg = (selfProps: any) => renderHTMLDOM('img', selfProps)
export const renderAsHTMLSelect = (selfProps: any) => renderHTMLDOM('select', selfProps)
