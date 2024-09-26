import { ButtonCSSVariables, ButtonStateNames, ButtonVariantNames } from "./component"
import { addGlobalCSS } from "../../utils/cssGlobalStyle"
import { cssOpacity, cssVar, tailwindPaletteColors } from "../../styles"

let haveRenderVariantButtonPlain = false
export function variantButtonPlain() {
  if (haveRenderVariantButtonPlain) return
  haveRenderVariantButtonPlain = true
  addGlobalCSS(`
    @layer kit-theme {
     .Button {
       &.${ButtonVariantNames.plain} {
          background-color: transparent;
          color: currentcolor;
        }
      }
   }
  `)
}

/**
 * use global css to style basic button theme
 */

export function loadButtonDefaultICSS() {
  addGlobalCSS(`
    @layer kit-theme {
      .Button {
        /* transition: 50ms cubic-bezier(0.22, 0.61, 0.36, 1); */
        border: none;
        ${ButtonCSSVariables.mainTextColor}: ${cssOpacity(cssVar("--text-primary", tailwindPaletteColors.gray700), 0.75)};
        ${ButtonCSSVariables.mainBgColor}: ${cssVar("--secondary", tailwindPaletteColors.gray300)};
        color: ${cssVar(ButtonCSSVariables.mainTextColor)};
        cursor: pointer;
        user-select: none;
        width: max-content;
        display: inline-grid;
        gap: 4px;
        place-items: center;
        grid-auto-flow: column;
        font-size: 16px;
        border-radius: 8px;
        font-weight: 500;

        /* ---------- size ------------ */
        padding: 10px 16px;
        font-size: 16px;
        border-radius: 8px;
        ${ButtonCSSVariables.outlineWidth}: 2px;
        &.${ButtonVariantNames.xs} {
          padding: 2px 6px;
          font-size: 12px;
          border-radius: 4px;
          ${ButtonCSSVariables.outlineWidth}: 0.5px;
        }
        &.${ButtonVariantNames.sm} {
          padding: 6px 12px;
          font-size: 14px;
          border-radius: 8px;
          ${ButtonCSSVariables.outlineWidth}: 1px;
        }
        &.${ButtonVariantNames.md} {
          padding: 10px 16px;
          font-size: 16px;
          border-radius: 8px;
          ${ButtonCSSVariables.outlineWidth}: 2px;  
        }
        &.${ButtonVariantNames.lg} {
          padding: 14px 24px;
          font-size: 16px;
          border-radius: 12px;
          ${ButtonCSSVariables.outlineWidth}: 2px;
        }
        
        /* ---------- state ------------ */
        background-color: ${cssVar(ButtonCSSVariables.mainBgColor)};
        &:hover {
          filter: brightness(95%);
        }
        &:active {
          transform: scale(0.98);
          filter: brightness(90%);
        }

        /* solid */
        &.${ButtonVariantNames.solid} {
          background-color: ${cssVar(ButtonCSSVariables.mainBgColor)};
          &:hover {
            filter: brightness(95%);
          }
          &:active {
            transform: scale(0.98);
            filter: brightness(90%);
          }
        }
        &.${ButtonVariantNames.outline} {
          background-color: transparent;
          outline: ${cssVar(ButtonCSSVariables.outlineWidth)} solid ${cssVar(ButtonCSSVariables.mainBgColor)};
          outline-offset: calc(-1 * ${cssVar(ButtonCSSVariables.outlineWidth)});
          &:hover {
            background-color: ${cssVar(ButtonCSSVariables.hoverBgColor, cssOpacity(cssVar(ButtonCSSVariables.mainBgColor), 0.85))};
          }
        }
        &.${ButtonVariantNames.ghost} {
          background-color: transparent;
          &:hover {
            background-color: ${cssVar(ButtonCSSVariables.hoverBgColor, cssOpacity(cssVar(ButtonCSSVariables.mainBgColor), 0.4))};
          }
          color: currentcolor;
        }
        &.${ButtonVariantNames.plain} {
          background-color: transparent;
          color: currentcolor;
        }


        /* ---------- special ------------ */
        &.${ButtonStateNames.disabled} {
          opacity: .3;
          filter: grayscale(.8) brightness(.6);
          cursor: not-allowed;
        }
      }
    }
  `)
}
