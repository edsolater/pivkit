import { MayArray, MayFn, flap, shrinkFn } from "@edsolater/fnkit"
import { Accessor, createEffect, createMemo, createSignal, on, onCleanup } from "solid-js"
import { addEventListener } from "../domkit"
import { CSSObject, PivProps, createPlugin, mergeProps } from "../piv"

export type TransitionDetectorActionPhase = "before-going" | "on-going" | "finish"
type TransitionTowards = "enter" | "leave"

export type TransitionDetectorController = {
  targetDom: Accessor<HTMLElement | undefined>
  phase: Accessor<TransitionDetectorActionPhase>
  towards: Accessor<TransitionTowards>
}
/**
 * detect by JS, drive by JS
 */
export interface TransitionOptions {
  cssTransitionDuration?: CSSObject["transitionDuration"]
  cssTransitionTimingFunction?: CSSObject["transitionTimingFunction"]

  /** will trigger props:onBeforeEnter() if init props:show  */
  appear?: boolean

  /** shortcut for both enterFrom and leaveTo */
  fromProps?: PivProps
  /** shortcut for both enterFrom and leaveTo */
  toProps?: PivProps
  /** normaly don't use this, just from and to is enough */
  progressProps?: PivProps

  onBeforeTransition?: (
    payload: { from: TransitionDetectorActionPhase; to: TransitionDetectorActionPhase } & TransitionDetectorController,
  ) => void
  onAfterTransition?: (
    payload: { from: TransitionDetectorActionPhase; to: TransitionDetectorActionPhase } & TransitionDetectorController,
  ) => void

  presets?: MayArray<MayFn<Omit<TransitionOptions, "presets">>>
}

export const transitionDetectorPlugin = createPlugin(
  ({
    cssTransitionDuration = "300ms",
    cssTransitionTimingFunction,

    appear,

    fromProps,
    toProps,
    /** normaly don't use this */
    progressProps,

    onBeforeTransition,
    onAfterTransition,

    presets,
  }: TransitionOptions = {}) =>
    (props, { dom }) => {
      const transitionPhaseProps = createMemo(() => {
        const basic = {
          transition: cssTransitionDuration,
          transitionTimingFunction: cssTransitionTimingFunction,
        }
        return {
          from: mergeProps(
            flap(presets).map((i) => shrinkFn(i)?.fromProps), // not readable
            progressProps,
            fromProps,
            { style: basic } as PivProps,
          ),
          to: mergeProps(
            flap(presets).map((i) => shrinkFn(i)?.toProps), // not readable
            progressProps,
            toProps,
            { style: basic } as PivProps,
          ),
        } as Record<"from" | "to", PivProps>
      })

      const [currentPhase, setCurrentPhase] = createSignal<TransitionDetectorActionPhase>(
        appear ? "before-going" : "finish",
      )
      const [currentTowards, setCurrentTowards] = createSignal<TransitionTowards>("enter")

      const controller: TransitionDetectorController = {
        targetDom: dom,
        phase: currentPhase,
        towards: currentTowards,
      }

      // set data-** to element DOM for semantic
      createEffect(() => {
        const el = dom()
        if (el) {
          el.dataset["phase"] = currentPhase()
        }
      })

      // make inTransition during state sync with CSS event
      createEffect(() => {
        const el = dom()
        if (!el) return
        const { abort } = addEventListener(el, "transitionend", () => setCurrentPhase("finish"), {
          onlyTargetIsSelf: true /* TODO - add feature: attach max one time  */,
        }) // not event fired by bubbled
        onCleanup(abort)
        const { abort: abort2 } = addEventListener(el, "transitionstart", () => setCurrentPhase("on-going"), {
          onlyTargetIsSelf: true /* TODO - add feature: attach max one time  */,
        })
        onCleanup(abort2)
      })

      // invoke callbacks
      createEffect(
        on(currentPhase, (currentPhase, prevPhase = "finish") => {
          const payload = Object.assign({ from: prevPhase, to: currentPhase }, controller)
          if (prevPhase === "on-going" && currentPhase === "finish") {
            dom()?.clientHeight // force GPU render frame
            onAfterTransition?.(payload)
          }

          if (prevPhase === "finish" && currentPhase === "before-going") {
            dom()?.clientHeight // force GPU render frame
            onBeforeTransition?.(payload)
          }
        }),
      )

      return createMemo(() => transitionPhaseProps()[currentPhase() === "before-going" ? "from" : "to"])
    },
)
