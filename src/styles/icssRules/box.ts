import { CSSObject, createICSS, createStaticICSS } from "../../piv"
import { cssColors } from "../cssColors"
import { cssOpacity, cssVar } from "../cssValues"
import { ICSSFontSize, icssFontSize } from "./fondation"

export interface ICSSRowOption {
  gap?: CSSObject["gap"]

  /** css: alignItems */
  align?: CSSObject["alignItems"]

  /** css: justifyContent */
  justify?: CSSObject["justifyContent"]

  alignContent?: CSSObject["alignContent"]
  alignItems?: CSSObject["alignItems"]
  justifyContent?: CSSObject["justifyContent"]
  justifyItems?: CSSObject["justifyItems"]

  //TODO
  presetEqualWidthChildren?: true

  /** only for children,  */
  childItems?: CSSObject["flex"]
}

export const icssRow = createICSS(
  ({
    gap,
    align,
    alignContent,
    alignItems = align,
    justify,
    justifyItems,
    justifyContent = justify,
    childItems,
  }: ICSSRowOption = {}) => ({
    display: "flex",
    alignItems,
    alignContent,
    justifyItems,
    justifyContent,
    gap,
    "& > *": childItems ? { flex: childItems } : undefined,
  }),
)

export interface ICSSColOption {
  gap?: CSSObject["gap"]
  /** css: alignItems */
  align?: CSSObject["alignItems"]
  /** css: justifyContent */
  justify?: CSSObject["justifyContent"]

  alignContent?: CSSObject["alignContent"]
  alignItems?: CSSObject["alignItems"]
  justifyContent?: CSSObject["justifyContent"]
  justifyItems?: CSSObject["justifyItems"]
  /** only for children,  */
  childItems?: CSSObject["flex"]
}

export const icssCol = createICSS(
  ({
    gap,
    align,
    alignContent,
    alignItems = align,
    justify,
    justifyItems,
    justifyContent = justify,
    childItems,
  }: ICSSColOption = {}) => ({
    display: "flex",
    flexDirection: "column",
    alignItems,
    alignContent,
    justifyItems,
    justifyContent,
    gap,
    "& > *": childItems ? { flex: childItems } : undefined,
  }),
)

//#region ------------------- grid -------------------
export interface ICSSGridOption {
  //#region ---------------- css base ----------------
  gap?: CSSObject["gap"]
  /** css: placeItems */
  placeItems?: CSSObject["placeItems"]
  /** css: placeContent */
  placeContent?: CSSObject["placeContent"]
  alignContent?: CSSObject["alignContent"]
  alignItems?: CSSObject["alignItems"]
  justifyContent?: CSSObject["justifyContent"]
  justifyItems?: CSSObject["justifyItems"]
  template?: CSSObject["gridTemplate"]
  templateRow?: CSSObject["gridTemplateRows"]
  templateColumn?: CSSObject["gridTemplateColumns"]
  //#endregion

  /** direction  */
  dir?: "x" | "y"

  /**
   *  divider: only when used in single row or signal column
   * can't have place/align/justify-items/content
   */
  dividerBackground?: CSSObject["background"] | [CSSObject["background"], CSSObject["background"]]
  dividerWidth?: CSSObject["width"]
  dividerHeight?: CSSObject["height"]
  dividerPadding?: string | [string, string]

  //#region ---------------- feature fixed slot ----------------
  slot?: number

  /**
   * only used when `options.slot` has set
   * e.g.
   * - 1 slot, if 1 child item;
   * - 2 slots, if 2 child items
   * - else will be 3 slots
   */
  autoTrim?: boolean
  //#endregion
}

export const icssGrid = createICSS(
  ({
    placeItems,
    placeContent,
    alignContent,
    alignItems,
    justifyContent,
    justifyItems,

    template,
    templateColumn,
    templateRow,
    gap,
    slot,
    autoTrim = true,
    dir = "y",
    dividerBackground = cssOpacity("currentColor", 0.5),
    dividerWidth,
    dividerHeight,
    dividerPadding,
  }: ICSSGridOption = {}) => {
    const rules = {
      display: "grid",
      placeItems,
      placeContent,
      alignContent,
      alignItems,
      justifyContent,
      justifyItems,
      gridTemplate: template,
      gridTemplateColumns: templateColumn,
      gridTemplateRows: templateRow,
      gap: gap,
      gridAutoFlow: dir === "x" ? "column" : "row",
    } as CSSObject

    if (dir === "x" && !templateColumn && slot != null) {
      rules.gridTemplateColumns = `repeat(${slot}, 1fr)`
      if (autoTrim) {
        // core of auto trim
        for (let i = 1; i <= slot; i++) {
          rules[`&:has(:nth-child(${i}))`] = {
            gridTemplateColumns: `repeat(${i}, 1fr)`,
          }
        }
      }
    } else if (dir === "y" && !templateRow && slot != null) {
      rules.gridTemplateRows = `repeat(${slot}, 1fr)`
      if (autoTrim) {
        // core of auto trim
        for (let i = 1; i <= slot; i++) {
          rules[`&:has(:nth-child(${i}))`] = {
            gridTemplateRows: `repeat(${i}, 1fr)`,
          }
        }
      }
    }

    // divider
    if (dividerWidth || dividerHeight) {
      if (dir === "x") {
        Object.assign(rules, {
          "> *": {
            position: "relative",
            "&:not(:last-child)::before": {
              content: "''",
              position: "absolute",
              right: `calc(-1 * ${gap} / 2)`,
              top: "0",
              bottom: "0",
              transform: "translateX(50%)",
              background: dividerBackground,
              width: dividerWidth,
              marginBlock: dividerPadding,
            },
          },
        })
      } else {
        Object.assign(rules, {
          "> *": {
            position: "relative",
            "&:not(:last-child)::before": {
              content: "''",
              position: "absolute",
              bottom: `calc(-1 * ${gap} / 2)`,
              left: "0",
              right: "0",
              transform: "translateY(50%)",
              background: dividerBackground,
              height: dividerHeight,
              marginInline: dividerPadding,
            },
          },
        })
      }
    }
    return rules
  },
)

export interface ICSSGridItemOption {
  area?: CSSObject["gridArea"]
}

export const icssGridItem = createICSS((opts: ICSSGridItemOption = {}) => ({
  gridArea: opts?.area,
}))

//#endregion

export interface ICSSCardOption {
  styleType?: "big-card" | "ghost"
  gap?: CSSObject["gap"]
  items?: CSSObject["alignItems"]
  bg?: CSSObject["background"]
}

export const icssCard = createICSS((options?: ICSSCardOption) => ({
  display: "grid",
  // backgroundColor: 'color-mix(in srgb, currentColor, transparent 95%)',
  background: options?.bg ?? cssVar("--card-bg"),
  /* generate by https://shadows.brumm.af/ */
  boxShadow:
    options?.styleType === "ghost"
      ? undefined
      : `4.1px 4.1px 5.3px -23px rgba(0, 0, 0, 0.012),
           19.6px 19.6px 17.9px -23px rgba(0, 0, 0, 0.018),
           100px 100px 80px -23px rgba(0, 0, 0, 0.03)`,
  padding: "12px 24px",
  borderRadius: "16px",
}))

export interface ICSSClickableOption {}

/**
 * build-in icss for make element looks clickable
 */
export const icssClickable = createStaticICSS("clickable", () => ({
  cursor: "pointer",
  userSelect: "none",
  transition: "100ms",
  // backdropFilter: "brightness(1)", // backdrop-filter will cause render performance issue, avoid to use
  filter: "brightness(1)",
  ".dark &": { filter: "brightness(0.9)" },
  "&:is(:hover,:active,:focus)": { filter: "brightness(0.85)", ".dark &": { filter: "brightness(1.5)" } },
  "&:active": { transform: "scale(0.9)" },
}))

export const icssFocusDetector = createICSS(() => ({
  outline: "solid 1px",
  "&:focus": { outlineStyle: "solid", outlineWidth: "2px" },
  transition: "100ms",
}))

export const icssTitle = createICSS((options?: { w?: CSSObject["minWidth"]; h?: CSSObject["minHeight"] }) => ({
  fontSize: "1.5em",
  fontWeight: "bold",
}))

export const icssLabel = createICSS((options?: { w?: CSSObject["minWidth"]; h?: CSSObject["minHeight"] }) => ({
  minWidth: options?.w ?? "5em",
  minHeight: options?.h ?? "calc(2em)",
  textAlign: "center",
  paddingBlock: ".25em",
  paddingInline: ".5em",
  borderRadius: "4px",
  background: cssColors.component_label_bg_default,
}))

export const icssLabelTitle = createICSS((options?: { fontSize?: ICSSFontSize }) => [
  icssFontSize({ fontSize: options?.fontSize ?? "sm" }),
  { fontWeight: "500", color: "#abc4ff88" },
])

export const icssSubContent = createICSS((options?: { fontSize?: ICSSFontSize }) => [
  icssFontSize({ fontSize: options?.fontSize ?? "sm" }),
  { color: "#abc4ff88" },
])

export const icssInputType = createICSS((options?: { w?: CSSObject["minWidth"]; h?: CSSObject["minHeight"] }) => ({
  minWidth: "12em",
  paddingBlock: ".25em",
  paddingInline: ".5em",
  // borderRadius: '4px',
  // background: cssColors.component_input_bg_default,
  // outlineColor: cssColors.dodgerBlue,
  borderBottom: "solid",
}))

export const icssCenter = createICSS((options?: {}) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}))
export const icssCenterY = createICSS((options?: {}) => ({
  display: "flex",
  alignItems: "center",
}))
export const icssCenterX = createICSS((options?: {}) => ({
  display: "flex",
  justifyContent: "center",
}))

export const icssThreeSlotGrid = createICSS((opts: { gap?: CSSObject["gap"] } = {}) => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: opts.gap ?? "8px",
  alignItems: "center",
  "& > *:nth-child(1)": { justifySelf: "start" },
  "& > *:nth-child(2)": { justifySelf: "center" },
  "& > *:nth-child(3)": { justifySelf: "end" },
}))
