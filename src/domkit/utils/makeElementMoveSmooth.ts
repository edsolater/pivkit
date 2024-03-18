import { addDefault } from "@edsolater/fnkit"
import { Accessor, AccessorArray, createEffect, on, onCleanup } from "solid-js"
import { createRef } from "../../hooks/createRef"

/**
 * Animates an element's movement when its position changes.
 * @param options - The options for the animation.
 * @param options.animateOptions - The options for the animation, such as duration and easing.
 * @param options.observeOn - The accessor or accessor array to observe for changes in position.
 * @returns An object with a `setRef` function to set the element reference.
 */
// TODO: makeElementMoveSmooth should be a plugin instead of a hook
export function makeElementMoveSmooth(options: {
  animateOptions?: KeyframeEffectOptions
  observeOn: Accessor<any> | AccessorArray<any>
}) {
  // TODO: addDefault should also accept undefined
  // TODO: addDefault should also be solid-js friendly, that means it should not access object property
  const animateOptions = addDefault(options.animateOptions ?? {}, { duration: 200, easing: "linear" })

  const [squareRef, setSquareRef] = createRef<HTMLElement>()

  let fromX: DOMRect["x"] | undefined = undefined
  let fromY: DOMRect["y"] | undefined = undefined

  // position change
  createEffect(
    on(options.observeOn, () => {
      const el = squareRef()
      if (!el) return
      const to = el.getBoundingClientRect()
      const deltaX = fromX != null ? to.x - fromX : undefined
      const deltaY = fromY != null ? to.y - fromY : undefined
      const animationControl =
        deltaX != null &&
        deltaY != null &&
        el.animate(
          [{ transform: `translate(${-deltaX}px, ${-deltaY}px)` }, { transform: "", offset: 1 }],
          animateOptions, // iteration 1 can use to moke transition
        )

      onCleanup(() => {
        if (!animationControl || animationControl.playState === "finished") {
          // record for next frame
          fromX = to.x
          fromY = to.y
        } else {
          // record for next frame
          // FIXME: too late, next frame is start
          const time = animationControl.currentTime ?? undefined
          const percent = time && Number(time) / animateOptions.duration // if it's not linear, this time percent is not exact enough
          fromX = fromX && percent && fromX + deltaX * percent
          fromY = fromY && percent && fromY + deltaY * percent
          animationControl?.cancel()
        }
      })
    }),
  )

  return { setMotionTargetRef: setSquareRef }
}

/**
 * check whether position has changed
 *
 * @param from old element position
 * @param to new element position
 * @returns whether position has changed
 */
function hasPositionChanged(from: DOMRect, to: DOMRect) {
  return from.x !== to.x || from.y !== to.y
}
