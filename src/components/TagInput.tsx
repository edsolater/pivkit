import { Booleanable, MayArray, MayFn } from "@edsolater/fnkit"
import { glob } from "goober"
import { KitProps, useKitProps } from "../createKit"
import { cssOpacity, cssVar } from "../styles"
import { cssColors } from "../styles/cssColors"
import { Input } from "./Input"

export interface TagInputController {
  click?: () => void
  focus?: () => void
}

export const TagInputCSSVariables = {
  mainBgColor: "--TagInput-main-bg-color",
  mainTextColor: "--TagInput-main-text-color",
  outlineWidth: "--TagInput-outline-width",
}

export const TagInputState = {
  interactive: "_interactive",
  disabled: "_disabled",
}

export const TagInputSize = {
  lg: "_lg",
  md: "_md",
  sm: "_sm",
  xs: "_xs",
}

export const TagInputVariant = {
  solid: "_solid",
  outline: "_outline",
  text: "_text",
}

export interface TagInputProps {
  /**
   * @default 'solid'
   */
  variant?: "solid" | "outline" | "text"
  /**
   * @default 'md'
   */
  size?: "xs" | "sm" | "md" | "lg"

  /** a short cut for validator */
  disabled?: boolean
  enabled?: boolean
  /** must all condition passed */
  validators?: MayArray<{
    /** must return true to pass this validator */
    should: MayFn<Booleanable>
    // used in "connect wallet" tagInput, it's order is over props: disabled
    forceInteractive?: boolean
    /**  items are tagInput's setting which will apply when corresponding validator has failed */
    fallbackProps?: Omit<TagInputProps, "validators" | "disabled" | "enabled">
  }>
}

export type TagInputKitProps = KitProps<TagInputProps, { controller: TagInputController }>

/**
 * feat: build-in click ui effect
 */
export function TagInput(kitProps: TagInputKitProps) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "TagInput" })
  return <Input shadowProps={shadowProps}></Input>
}

let hasLoadTagInputDefaultICSS = false

/**
 * use global css to style basic tagInput theme
 */
function loadTagInputDefaultICSS() {
  if (!hasLoadTagInputDefaultICSS) {
    glob({
      "@layer kit-theme": {
        ".TagInput": {
          transition: "50ms cubic-bezier(0.22, 0.61, 0.36, 1)", // make it's change smooth
          border: "none",
          color: cssColors.component_button_text_primary, // light mode
          cursor: "pointer",
          userSelect: "none",
          width: "max-content",
          display: "inline-grid",
          gap: "4px",
          placeContent: "center",
          fontSize: "16px",
          borderRadius: "8px",
          fontWeight: "500",
          [`&.${TagInputState.disabled}`]: {
            opacity: ".3",
            cursor: "not-allowed",
          },
          [`&.${TagInputSize.xs}`]: {
            padding: "2px 6px",
            fontSize: "12px",
            borderRadius: "4px",
            [TagInputCSSVariables.outlineWidth]: "0.5px",
          },
          [`&.${TagInputSize.sm}`]: {
            padding: "8px 16px",
            fontSize: "14px",
            borderRadius: "8px",
            [TagInputCSSVariables.outlineWidth]: "1px",
          },
          [`&.${TagInputSize.md}`]: {
            padding: "10px 16px",
            fontSize: "16px",
            borderRadius: "8px",
            [TagInputCSSVariables.outlineWidth]: "2px",
          },
          [`&.${TagInputSize.xs}`]: {
            padding: "2px 6px",
            fontSize: "12px",
            borderRadius: "4px",
            [TagInputCSSVariables.outlineWidth]: "0.5px",
          },
          [`&.${TagInputVariant.solid}`]: {
            backgroundColor: cssColors.component_button_bg_primary,
            "&:hover": {
              filter: "brightness(95%)",
            },
            "&:active": {
              transform: "scale(0.98)",
              filter: "brightness(90%)",
            },
          },
          [`&.${TagInputVariant.outline}`]: {
            backgroundColor: cssColors.transparent,
            outline: `${cssVar(TagInputCSSVariables.outlineWidth)} solid ${cssColors.component_button_bg_primary}`,
            outlineOffset: `calc(-1 * ${cssVar(TagInputCSSVariables.outlineWidth)})`,
            "&:hover": {
              backgroundColor: cssOpacity(cssColors.component_button_bg_primary, 0.85),
            },
          },
          [`&.${TagInputVariant.text}`]: {
            backgroundColor: cssColors.transparent,
            "&:hover": {
              backgroundColor: cssOpacity(cssColors.component_button_bg_primary, 0.85),
            },
          },
        },
      },
    })
    hasLoadTagInputDefaultICSS = true
  }
}
