import { ButtonStateNames } from "./component"
import { addGlobalCSS } from "../../utils/cssGlobalStyle"
import { cssOpacity, cssVar, tailwindPaletteColors } from "../../styles"
import { asyncInvoke } from "@edsolater/fnkit"

const ButtonCSSVariables = {
  mainBgColor: "--Button-bg",
  mainTextColor: "--Button-text",
  hoverBgColor: "--Button-hover-bg",
  outlineWidth: "--Button-outline-width",
}

const ButtonVariantNames = {
  solid: "solid", // default
  outline: "outline",
  ghost: "ghost",
  plain: "plain", // have button's feature but no outside appearance

  // ---------------- size ----------------
  lg: "lg",
  md: "md", // default
  sm: "sm",
  xs: "xs",
}
/**
 * @example
 * <Button icss={[buttonVariantPlain]}>Hi</Button>
 */
export const buttonVariantPlain = createVariantIcssFunction(
  ButtonVariantNames.plain,
  `
  @layer kit-theme {
    .Button {
      &.${ButtonVariantNames.plain} {
        background-color: transparent;
        color: currentcolor;
      }
    }
  }
  `,
)

export const buttonVariantSolid = createVariantIcssFunction(
  ButtonVariantNames.solid,
  `
  @layer kit-theme {
    .Button {
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
    }
  }
  `,
)

export const buttonVariantOutline = createVariantIcssFunction(
  ButtonVariantNames.outline,
  `
  @layer kit-theme {
    .Button {
      &.${ButtonVariantNames.outline} {
        background-color: transparent;
        outline: ${cssVar(ButtonCSSVariables.outlineWidth)} solid ${cssVar(ButtonCSSVariables.mainBgColor)};
        outline-offset: calc(-1 * ${cssVar(ButtonCSSVariables.outlineWidth)});
        &:hover {
          background-color: ${cssVar(ButtonCSSVariables.hoverBgColor, cssOpacity(cssVar(ButtonCSSVariables.mainBgColor), 0.85))};
        }
      }
    }
  }
  `,
)

export const buttonVariantGhost = createVariantIcssFunction(
  ButtonVariantNames.ghost,
  `
  @layer kit-theme {
    .Button {
      &.${ButtonVariantNames.ghost} {
        background-color: transparent;
        &:hover {
          background-color: ${cssVar(ButtonCSSVariables.hoverBgColor, cssOpacity(cssVar(ButtonCSSVariables.mainBgColor), 0.4))};
        }
        color: currentcolor;
      }
    }
  }
  `,
)

export const buttonSizeXS = createVariantIcssFunction(
  ButtonVariantNames.xs,
  `
  @layer kit-theme {
    .Button {
      &.${ButtonVariantNames.xs} {
        padding: 2px 6px;
        font-size: 12px;
        border-radius: 4px;
        ${ButtonCSSVariables.outlineWidth}: 0.5px;
      }
    }
  }
  `,
)

export const buttonSizeSM = createVariantIcssFunction(
  ButtonVariantNames.sm,
  `
  @layer kit-theme {
    .Button {
      &.${ButtonVariantNames.sm} {
        padding: 6px 12px;
        font-size: 14px;
        border-radius: 8px;
        ${ButtonCSSVariables.outlineWidth}: 1px;
      }
    }
  }
  `,
)

export const buttonSizeMD = createVariantIcssFunction(
  ButtonVariantNames.md,
  `
  @layer kit-theme {
    .Button {
      &.${ButtonVariantNames.md} {
        padding: 10px 16px;
        font-size: 16px;
        border-radius: 8px;
        ${ButtonCSSVariables.outlineWidth}: 2px;
      }
    }
  }
  `,
)

export const buttonSizeLG = createVariantIcssFunction(
  ButtonVariantNames.lg,
  `
  @layer kit-theme {
    .Button {
      &.${ButtonVariantNames.lg} {
        padding: 14px 24px;
        font-size: 16px;
        border-radius: 12px;
        ${ButtonCSSVariables.outlineWidth}: 2px;
      }
    }
  }
  `,
)

/**
 * a variant helper function
 *
 * @param className
 * @param cssRule
 * @returns
 */
function createVariantIcssFunction(className: string, cssRule: string) {
  let haveRenderCSSRule = false
  return (params: { el: () => HTMLElement | undefined }) => {
    asyncInvoke(() => {
      // ensure el is loaded on screen
      params.el()?.classList.add(className)
    })

    if (!haveRenderCSSRule) {
      haveRenderCSSRule = true
      addGlobalCSS(cssRule)
    }
  }
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
        font-weight: 500;ButtonCSSVariables

        /* ---------- default size ------------ */
        padding: 10px 16px;
        font-size: 16px;
        border-radius: 8px;
        ${ButtonCSSVariables.outlineWidth}: 2px;

        /* ---------- default variant ------------ */
        background-color: ${cssVar(ButtonCSSVariables.mainBgColor)};
        &:hover {
          filter: brightness(95%);
        }
        &:active {
          transform: scale(0.98);
          filter: brightness(90%);
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
