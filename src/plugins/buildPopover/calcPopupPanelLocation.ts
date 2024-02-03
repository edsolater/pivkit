import { IStyle } from '../../piv'
import { PopoverPlacement } from './type'
export type PopupLocationInfo = {
  // relative to viewport
  panelLeft: number
  // relative to viewport
  panelTop: number
  // relative to screen. arrow bottom center
  arrowLeftRelativeToPanel: number
  arrowTopRelativeToPanel: number
}

/**
 * ASK: What's the difference from <Tooltip>?
 * ANS: 1. <Tooltip> is just a sigle wrapper, but <Popover> is more  complex
 * 2. <Tooltip> should just show some infomation, but <Popover>'s content can interactive
 */
const POPOVER_GAP = 8
const POPOVER_VIEWPORT_BOUNDARY_INSET = 6

export const calcPopupPanelLocation = ({
  buttonElement,
  panelElement,
  placement = 'top',
  cornerOffset = 0,
  popoverGap = POPOVER_GAP,
  viewportBoundaryInset = POPOVER_VIEWPORT_BOUNDARY_INSET,
}: {
  buttonElement: HTMLElement
  panelElement: HTMLElement
  placement?: PopoverPlacement

  /** for corner placement like 'top-left' 'top-right etc. */
  cornerOffset?: number
  /** gap between `<PopoverButton>` and `<PopoverPanel>`*/
  popoverGap?: number
  /** to leave some space when touch the viewport boundary */
  viewportBoundaryInset?: number
}): PopupLocationInfo | undefined => {
  // must in some computer
  if (!globalThis.document) return undefined
  const rect = panelElement.getBoundingClientRect()
  const panelWidth = rect.width
  const panelHeight = rect.height

  const customizedViewportWidth = globalThis.document.documentElement.clientWidth - viewportBoundaryInset * 2
  const customizedViewportHeight = globalThis.document.documentElement.clientHeight - viewportBoundaryInset * 2
  const customizedViewportTop = viewportBoundaryInset
  const customizedViewportLeft = viewportBoundaryInset
  const customizedViewportRight = customizedViewportLeft + customizedViewportWidth
  const customizedViewportBottom = customizedViewportTop + customizedViewportHeight

  const {
    left: buttonLeft,
    top: buttonTop,
    right: buttonRight,
    bottom: buttonBottom,
    width: buttonWidth,
    height: buttonHeight,
  } = buttonElement.getBoundingClientRect()
  const buttonCenterX = buttonLeft + buttonWidth / 2
  const buttonCenterY = buttonTop + buttonHeight / 2

  const calcPanel = (placement: PopoverPlacement): [left: number, top: number] | undefined => {
    const rules: Record<PopoverPlacement, () => [panelLeft: number, panelTop: number]> = {
      left: () => [buttonLeft - popoverGap - panelWidth, buttonCenterY - panelHeight / 2],
      'left-top': () => [buttonLeft - popoverGap - panelWidth, buttonTop - cornerOffset],
      'left-bottom': () => [buttonLeft - popoverGap - panelWidth, buttonBottom - panelHeight + cornerOffset],
      right: () => [buttonRight + popoverGap, buttonCenterY - panelHeight / 2],
      'right-top': () => [buttonRight + popoverGap, buttonTop - cornerOffset],
      'right-bottom': () => [buttonRight + popoverGap, buttonBottom - panelHeight + cornerOffset],
      top: () => [buttonCenterX - panelWidth / 2, buttonTop - popoverGap - panelHeight],
      'top-left': () => [buttonLeft - cornerOffset, buttonTop - popoverGap - panelHeight],
      'top-right': () => [buttonRight - panelWidth + cornerOffset, buttonTop - popoverGap - panelHeight],
      bottom: () => [buttonCenterX - panelWidth / 2, buttonBottom + popoverGap],
      'bottom-left': () => [buttonLeft - cornerOffset, buttonBottom + popoverGap],
      'bottom-right': () => [buttonRight - panelWidth + cornerOffset, buttonBottom + popoverGap],
    }
    return rules[placement]?.()
  }
  // calc panel
  const [offsetRectPanelLeft, offsetRectPanelTop] = calcPanel(placement) ?? [0, 0]
  const theoreticallyPanelBottom = offsetRectPanelTop + panelHeight
  const theoreticallyPanelRight = offsetRectPanelLeft + panelWidth

  const idealPanelOffsetY =
    theoreticallyPanelBottom > customizedViewportBottom
      ? customizedViewportBottom - theoreticallyPanelBottom
      : offsetRectPanelTop < customizedViewportTop
        ? customizedViewportTop - offsetRectPanelTop
        : 0

  const idealPanelOffsetX =
    theoreticallyPanelRight > customizedViewportRight
      ? customizedViewportRight - theoreticallyPanelRight
      : offsetRectPanelLeft < customizedViewportLeft
        ? customizedViewportLeft - offsetRectPanelLeft
        : 0

  const panelLeft = offsetRectPanelLeft + idealPanelOffsetX
  const panelTop = offsetRectPanelTop + idealPanelOffsetY

  // calc arrow
  const arrowTop = clamp(buttonCenterY, { min: panelTop, max: panelTop + panelHeight }) - panelTop
  const arrowLeft = clamp(buttonCenterX, { min: panelLeft, max: panelLeft + panelWidth }) - panelLeft

  return {
    panelLeft: panelLeft,
    panelTop: panelTop,
    arrowLeftRelativeToPanel: arrowLeft,
    arrowTopRelativeToPanel: arrowTop,
  }
}

const clamp = (current: number, payload: { min: number; max: number }) =>
  Math.max(payload.min, Math.min(payload.max, current))
