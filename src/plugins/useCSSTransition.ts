import { arrify, MayArray, MayFn, shrinkFn, switchCase } from "@edsolater/fnkit"
import { Accessor, createEffect, createMemo, createSignal, on, onCleanup } from "solid-js"
import { listenDomEvent } from "../webTools"
import { runtimeObject } from "@edsolater/fnkit"
import { createDomRef } from "../hooks"
import { createRef } from "../hooks/createRef"
import { createPlugin, CSSObject, PivProps, type ICSS } from "../piv"
import { Accessify, accessifyProps } from "../utils/accessifyProps"
import { createController2 } from "../utils/createController"

type TransitionPhase =
  | "hidden" /* UI unvisible */
  | "shown" /* UI visible and stable(not in transition) */
  | "during-process"

type TransitionCurrentPhasePropsName = "enterFrom" | "enterTo" | "leaveFrom" | "leaveTo"

export interface CSSTransactionOptions {
  cssTransitionDurationMs?: Accessify<number | undefined, TransitionController>
  cssTransitionTimingFunction?: CSSObject["transitionTimingFunction"]

  /* detect transition should be turn on */
  show?: Accessify<boolean | undefined, TransitionController>

  /** will trigger props:onBeforeEnter() if init props:show  */
  appear?: Accessify<boolean | undefined, TransitionController>

  /** enterFrom + enterTo */
  enterIcss?: ICSS<TransitionController>
  /** leaveFrom + leaveTo */
  leaveIcss?: ICSS<TransitionController>

  enterFromIcss?: ICSS<TransitionController>
  enterToIcss?: ICSS<TransitionController>

  leaveFromIcss?: ICSS<TransitionController>
  leaveToIcss?: ICSS<TransitionController>

  /** enterFrom + leaveTo */
  hideIcss?: ICSS<TransitionController> // shortcut for both enterFrom and leaveTo
  /** enterTo + leaveFrom */
  showIcss?: ICSS<TransitionController> // shortcut for both enterTo and leaveFrom

  onBeforeEnter?: (payloads: {
    el: HTMLElement | undefined
    from: TransitionPhase
    to: "shown" | "hidden"
    isFromAbortted: boolean
  }) => void
  onAfterEnter?: (payloads: { el: HTMLElement | undefined; from: TransitionPhase; to: "shown" | "hidden" }) => void
  onBeforeLeave?: (payloads: {
    el: HTMLElement | undefined
    from: TransitionPhase
    to: "shown" | "hidden"
    isFromAbortted: boolean
  }) => void
  onAfterLeave?: (payloads: { el: HTMLElement | undefined; from: TransitionPhase; to: "shown" | "hidden" }) => void

  presets?: MayArray<MayFn<Omit<CSSTransactionOptions, "presets">>> //🤔 is it plugin? No, pluginHook can't have plugin prop
  // children?: ReactNode | ((state: { phase: TransitionPhase }) => ReactNode)
}

interface TransitionController {
  contentDom: Accessor<HTMLElement | undefined>
  from: Accessor<TransitionPhase>
  to: Accessor<TransitionPhase>
}

export function useCSSTransition(additionalOpts: CSSTransactionOptions = {}) {
  const controller: TransitionController = createController2(() => ({
    from: currentPhase,
    to: targetPhase,
    contentDom,
  }))
  const opts = accessifyProps(additionalOpts, controller)
  const [contentDom, setContentDom] = createRef<HTMLElement>()
  const transitionPhaseIcss = () => {
    const basic = {
      transition: `${opts.cssTransitionDurationMs ?? 250}ms`,
      transitionTimingFunction: opts.cssTransitionTimingFunction,
    }
    const presets = arrify(opts.presets)
    return {
      enterFrom: [
        presets.map((i) => shrinkFn(i)?.enterFromIcss),
        opts.enterIcss,
        opts.enterFromIcss ?? opts.hideIcss,
        basic,
      ],
      enterTo: [presets.map((i) => shrinkFn(i)?.enterToIcss), opts.enterIcss, opts.enterToIcss ?? opts.showIcss, basic],
      leaveFrom: [
        presets.map((i) => shrinkFn(i)?.leaveFromIcss),
        opts.leaveIcss,
        opts.leaveFromIcss ?? opts.showIcss,
        basic,
      ],
      leaveTo: [presets.map((i) => shrinkFn(i)?.leaveToIcss), opts.leaveIcss, opts.leaveToIcss ?? opts.hideIcss, basic],
    } as Record<TransitionCurrentPhasePropsName, PivProps>
  }

  const [currentPhase, setCurrentPhase] = createSignal<TransitionPhase>(opts.show && !opts.appear ? "shown" : "hidden")
  const targetPhase = createMemo(() => (opts.show ? "shown" : "hidden"))
  // this accessor is to hold collapse state
  const opened = createMemo(() => targetPhase() === "shown")
  const currentPhasePropsName = createMemo<TransitionCurrentPhasePropsName>(() =>
    targetPhase() === "shown"
      ? currentPhase() === "hidden"
        ? "enterFrom"
        : "enterTo"
      : currentPhase() === "shown"
        ? "leaveFrom"
        : "leaveTo",
  )

  // set data-** to element for semantic
  createEffect(() => {
    const el = contentDom()
    if (el) {
      el.dataset["from"] = currentPhase()
      el.dataset["to"] = targetPhase()
    }
  })

  // make inTransition during state sync with UI event
  // const hasSetOnChangeCallback = useRef(false)
  createEffect(() => {
    const el = contentDom()
    if (!el) return
    const subscription = listenDomEvent(
      el,
      "transitionend",
      () => {
        setCurrentPhase(targetPhase())
      },
      { onlyTargetIsSelf: true /* not event fired by bubbled */ },
    )
    // const subscription2 = listenDomEvent(
    //   el,
    //   'transitioncancel',
    //   () => {
    //     setCurrentPhase(targetPhase())
    //   },
    //   { onlyTargetIsSelf: true /* not event fired by bubbled */ },
    // )
    onCleanup(() => {
      subscription.cancel()
      // subscription2.abort()
    })
  })

  // change current phase by target phase
  createEffect(() => {
    if (targetPhase() !== currentPhase() && currentPhase() !== "during-process") {
      setCurrentPhase("during-process")
    }
  })

  // invoke callbacks
  createEffect(
    on(
      [currentPhase, targetPhase],
      ([currentPhase, targetPhase], prev) => {
        const el = contentDom()
        const [prevCurrentPhase, prevTargetPhase]: [phase?: TransitionPhase, to?: "hidden" | "shown"] = prev ?? []

        const status = {
          el,
          from: currentPhase,
          to: targetPhase,
          prevPhase: prevCurrentPhase,
          isFromAbortted: currentPhase === "during-process" && prevCurrentPhase === "during-process", // not right
        } as const
        // -------- process judgers --------
        const isFirstRender = prevCurrentPhase === undefined
        const isCurrentPhaseShown = currentPhase === "shown"
        const isCurrentPhaseHidden = currentPhase === "hidden"
        const isCurrentPhaseDuringProcess = currentPhase === "during-process"
        const isPreviousPhaseDuringProcess = prevCurrentPhase === "during-process"
        const isTargetShown = targetPhase === "shown"
        const isTargetHidden = targetPhase === "hidden"

        // -------- lifecycle judgers --------
        const isAfterEnter = isCurrentPhaseShown && isTargetShown
        const isAfterLeave = isCurrentPhaseHidden && isTargetHidden
        const isBeforeEnter =
          (isCurrentPhaseHidden || (isCurrentPhaseDuringProcess && isPreviousPhaseDuringProcess) || isFirstRender) &&
          isTargetShown
        const isBeforeLeave =
          (isCurrentPhaseShown || (isCurrentPhaseDuringProcess && isPreviousPhaseDuringProcess) || isFirstRender) &&
          isTargetHidden

        switchCase(true, [
          [isAfterEnter, () => opts.onAfterEnter?.(status)],
          [isAfterLeave, () => opts.onAfterLeave?.(status)],
          [isBeforeEnter, () => opts.onBeforeEnter?.(status)],
          [isBeforeLeave, () => opts.onBeforeLeave?.(status)],
        ])
      },
      { defer: true },
    ),
  )

  const transitionIcss = createMemo(() => transitionPhaseIcss()[currentPhasePropsName()])

  return { dom: contentDom, setDom: setContentDom, transitionIcss, opened }
}

export function loadModuleTransition(options?: Omit<CSSTransactionOptions, "show">) {
  const [show, setShow] = createSignal(false)

  function toggle() {
    setShow((b) => !b)
  }
  function close() {
    setShow(false)
  }
  function open() {
    setShow(true)
  }

  const { setDom, transitionIcss, opened, dom } = useCSSTransition({
    show,
    ...options,
  })

  const controller = {
    opened,
    toggle,
    open,
    close,
  }

  return {
    /**
     * @deprecated prefer just use shadowProps directly
     */
    plugin: createPlugin(
      () => () =>
        // does must use a high function ?
        runtimeObject<PivProps>({
          // if not use runtimeObject, the props will be consumed too early
          shadowProps: () => transitionIcss(),
          domRef: () => setDom,
        }),
    ),
    shadowProps: {
      get icss() {
        return transitionIcss()
      },
      domRef: setDom,
    },
    el: dom,
    controller,
  }
}
export type FeatureCSSCollapseOption = {
  ignoreEnterTransition?: boolean
  ignoreLeaveTransition?: boolean
  durationMs?: number
}

/** will dynamic collapse element height from 'auto' */
// could it from auto to auto? 🤔
export function loadModuleCSSCollapse(options?: FeatureCSSCollapseOption) {
  let inTransitionDuration = false // flag for transition is start from transition cancel
  let cachedElementHeight: number | undefined = undefined // for transition start may start from transition cancel, which height is not correct
  const { plugin, controller, el, shadowProps } = loadModuleTransition({
    cssTransitionDurationMs: options?.durationMs ?? 170,
    cssTransitionTimingFunction: "ease-out",
    enterIcss: {
      userSelect: "none",
    },
    leaveIcss: {
      userSelect: "none",
    },
    hideIcss: {
      opacity: 0,
      userSelect: "auto",
      // position: 'absolute',
      // pointerEvents: 'none',
    },
    showIcss: {
      opacity: 1,
      userSelect: "auto",
    },
    onBeforeEnter({ el }) {
      //why not invoked? 🤔
      if (options?.ignoreEnterTransition) {
        resumeDOMCache(el)
        el?.style.removeProperty("position")
        el?.style.removeProperty("visibility")
        return
      }

      window.requestAnimationFrame(() => {
        if (!el) return
        el.style.removeProperty("position")
        el.style.removeProperty("visibility")

        if (inTransitionDuration) {
          if (cachedElementHeight) el.style.setProperty("height", cachedElementHeight + "px")
        } else {
          const { height } = el.getBoundingClientRect()

          cachedElementHeight = height
          const originalTransitionProps = getComputedStyle(el).transition
          el.style.setProperty("transition", "none")

          el.clientHeight

          // frequent ui action may cause element havn't attach to DOM yet, when occors, just ignore it.
          el.style.setProperty("height", "0")
          el.clientHeight
          el.style.setProperty("transition", originalTransitionProps)
          /// Force bowser to paint the frame  🤯🤯🤯🤯
          el.style.setProperty("height", height + "px")
        }
        inTransitionDuration = true
      })
    },
    onAfterEnter({ el }) {
      el?.style.removeProperty("height")
      inTransitionDuration = false
    },
    onBeforeLeave({ el }) {
      if (!el) return
      if (options?.ignoreLeaveTransition) return
      if (inTransitionDuration) {
        el.style.setProperty("height", `0`)
      } else {
        const { height } = el.getBoundingClientRect()
        cachedElementHeight = height

        el.style.setProperty("height", height + "px")
        // Force bowser to paint the frame  🤯🤯🤯🤯
        el.clientHeight
        el.style.setProperty("height", "0")
      }
      inTransitionDuration = true
    },
    onAfterLeave({ el }) {
      el?.style.removeProperty("height")
      el?.style.setProperty("position", "absolute")
      el?.style.setProperty("visibility", "hidden")
      destoryDOMCache(el)
      inTransitionDuration = false
    },
  })

  // init collapse
  createEffect(() => {
    el()?.style.setProperty("position", "absolute")
  })

  function resumeDOMCache(element: HTMLElement | undefined) {}

  // innerChildren.current = null // clean from internal storage to avoid still render dom
  function destoryDOMCache(element: HTMLElement | undefined) {}

  return {
    /** @deprecated just use shadowProps is ok */
    plugin,
    shadowProps,
    el,
    controller,
  }
}

/**
 * can create transition from one height:auto to another height:auto
 */
export function loadModuleAutoSizeTransition(options?: {
  ignoreEnterTransition?: boolean
  ignoreLeaveTransition?: boolean
}) {
  const { dom, setDom } = createDomRef()
  //! can't use useResizeObserver, because it resizeObserver callback is invoked after dom render
  // let contentHeight: undefined | number = undefined
  // const { destory } = useResizeObserver({
  //   ref: dom,
  //   callback: ({ entry, el }, observer) => {
  //     console.log('change')
  //     const currentHeight = entry.contentRect.height
  //     const prevHeight = contentHeight
  //     contentHeight = currentHeight
  //     console.log('currentHeight: ', { currentHeight, prevHeight })
  //     el.style.setProperty('transition', 'unset')
  //     // el.style.setProperty('height', prevHeight + 'px')
  //     el.style.setProperty('visibility', currentHeight > 150 ? 'hidden' : 'unset')
  //     observer.unobserve(el)
  //     el.clientHeight
  //     el.style.setProperty('transition', 'height 250ms ease-out')
  //     // el.style.setProperty('height', currentHeight + 'px')
  //     if (prevHeight === undefined) {
  //       el.style.removeProperty('height')
  //       observer.observe(el)
  //     }
  //     el.listenDomEvent('transitionend', () => {
  //       console.log('end')
  //       el.style.removeProperty('height')
  //       observer.observe(el)
  //     })
  //   },
  // })
  return {
    plugin: () => ({
      domRef: setDom,
    }),
  }
}

// const cssTransitionPlugin = createPlugin<CSSTransactionOptions, any, any>((options: CSSTransactionOptions = {}) => () => {
//   const { refSetter, transitionIcss, isInnervisible } = useCSSTransition(options)
//   return {
//     ref: refSetter,
//     ...transitionIcss,
//     show: isInnervisible,
//   }
// })
