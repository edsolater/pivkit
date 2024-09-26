import { ButtonCSSVariables, ButtonState, ButtonVariants } from "./component"
import { addGlobalCSS } from "../../utils/cssGlobalStyle"
import { cssOpacity, cssVar, tailwindPaletteColors } from "../../styles"

let haveRenderVariantButtonPlain = false
export function variantButtonPlain() {
  if (haveRenderVariantButtonPlain) return
  haveRenderVariantButtonPlain = true
  addGlobalCSS(`
    @layer kit-theme {
     .Button {
       &.${ButtonVariants.plain} {
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
        &.${ButtonVariants.xs} {
          padding: 2px 6px;
          font-size: 12px;
          border-radius: 4px;
          ${ButtonCSSVariables.outlineWidth}: 0.5px;
        }
        &.${ButtonVariants.sm} {
          padding: 6px 12px;
          font-size: 14px;
          border-radius: 8px;
          ${ButtonCSSVariables.outlineWidth}: 1px;
        }
        &.${ButtonVariants.md} {
          padding: 10px 16px;
          font-size: 16px;
          border-radius: 8px;
          ${ButtonCSSVariables.outlineWidth}: 2px;  
        }
        &.${ButtonVariants.lg} {
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
        &.${ButtonVariants.solid} {
          background-color: ${cssVar(ButtonCSSVariables.mainBgColor)};
          &:hover {
            filter: brightness(95%);
          }
          &:active {
            transform: scale(0.98);
            filter: brightness(90%);
          }
        }
        &.${ButtonVariants.outline} {
          background-color: transparent;
          outline: ${cssVar(ButtonCSSVariables.outlineWidth)} solid ${cssVar(ButtonCSSVariables.mainBgColor)};
          outline-offset: calc(-1 * ${cssVar(ButtonCSSVariables.outlineWidth)});
          &:hover {
            background-color: ${cssVar(ButtonCSSVariables.hoverBgColor, cssOpacity(cssVar(ButtonCSSVariables.mainBgColor), 0.85))};
          }
        }
        &.${ButtonVariants.ghost} {
          background-color: transparent;
          &:hover {
            background-color: ${cssVar(ButtonCSSVariables.hoverBgColor, cssOpacity(cssVar(ButtonCSSVariables.mainBgColor), 0.4))};
          }
          color: currentcolor;
        }
        &.${ButtonVariants.plain} {
          background-color: transparent;
          color: currentcolor;
        }


        /* ---------- special ------------ */
        &.${ButtonState.disabled} {
          opacity: .3;
          filter: grayscale(.8) brightness(.6);
          cursor: not-allowed;
        }
      }
    }
  `)
}
