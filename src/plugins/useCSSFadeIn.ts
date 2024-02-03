import { createEffect, createSignal } from 'solid-js'
import { createRef } from '../hooks/createRef'
import { AccessifyProps, accessifyProps } from '../utils/accessifyProps'
import { useCSSTransition } from './useCSSTransition'

type UseFadeInOptions = AccessifyProps<{
  type?: 'collapse-type'

  show?: boolean
  appear?: boolean
}>

// TODO: should be plugin
export function useCSSFadeIn(additionalOpts: UseFadeInOptions) {
  const options = accessifyProps(additionalOpts)

  // TODO: should have util 👉 covert from getter to signal
  const [show, setShow] = createSignal(options.show ?? false)
  createEffect(() => {
    setShow(options.show ?? false)
  })

  const [innerContentRef, innerContentRefSetter] = createRef<HTMLElement>()
  const haveInitTransition = () => options.show && options.appear

  const styleMethods = useFadeInPaddingEffect({ heightOrWidth: 'height' })

  const { setDom, transitionProps } = useCSSTransition({
    show,
    hideProps: { icss: { position: 'absolute', opacity: 0, overflow: 'hidden' } },
    onBeforeEnter({ el }) {
      if (!el) return

      el.style.removeProperty('position')
      el.style.removeProperty('opacity')
      // if (status.from === 'during-process') {
      //   styleMethods.toOriginalStyle(el)
      // } else {
      //   el.style.setProperty('transition-property', 'none') // if element self has width(224px for example), it will have no effect to set width 0 then set with 224px
      //   styleMethods.toGhostStyle(el, { recordValue: true })
      //   el.clientHeight // force GPU to reflow this frame
      //   el.style.removeProperty('transition-property')
      //   styleMethods.toOriginalStyle(el)
      // }
    },
    onAfterEnter({ el }) {
      if (!el) return

      // if (init && !haveInitTransition) {
      if (!haveInitTransition()) {
        el.style.removeProperty('position')
        el.style.removeProperty('opacity')
      }
      styleMethods.applyClearUselessStyle(el)
      // onAfterEnter?.()
    },
    onBeforeLeave({ el, from }) {
      if (!el) return
      if (from === 'during-process') {
        styleMethods.toGhostStyle(el)
      } else {
        styleMethods.toOriginalStyle(el, { recordValue: true })
        el.clientHeight
        styleMethods.toGhostStyle(el)
      }
    },
    onAfterLeave(status) {
      console.log('3: ', 3)
      // const el = status.contentRef
      // if (!el) return
      // styleMethods.applyClearUselessStyle(el)
      // el.style.setProperty('position', 'absolute')
      // el.style.setProperty('opacity', '0')
      //TODO: complete it
      // innerStyle.current = [baseTransitionStyle, { position: 'absolute', opacity: '0' }] as DivProps['style']
      // onAfterLeave?.()
    },
  })

  return {
    refSetter: setDom,
    transitionProps,
  }
}

function useFadeInPaddingEffect({ heightOrWidth }: { heightOrWidth: 'height' | 'width' }) {
  let contentCachedTrueHeightOrWidth: number | undefined
  let contentCachedTruePadding: string | undefined
  return {
    toGhostStyle: (el: HTMLElement, options?: { recordValue?: boolean }) => {
      if (options?.recordValue) {
        contentCachedTrueHeightOrWidth = el[heightOrWidth === 'height' ? 'clientHeight' : 'clientWidth'] // cache for from 'during-process' fade in can't get true height
        // cache for from 'during-process' fade in can't get true padding
        contentCachedTruePadding = getComputedStyle(el).padding
      }
      console.log('1: ', 1)
      el.style.setProperty(heightOrWidth, '0')
      el.style.setProperty('padding', '0')
    },
    toOriginalStyle: (el: HTMLElement, options?: { recordValue?: boolean }) => {
      if (options?.recordValue) {
        contentCachedTrueHeightOrWidth = el[heightOrWidth === 'height' ? 'clientHeight' : 'clientWidth'] // cache for from 'during-process' fade in can't get true height
        // cache for from 'during-process' fade in can't get true padding
        contentCachedTruePadding = getComputedStyle(el).padding
      }
      contentCachedTrueHeightOrWidth && el.style.setProperty(heightOrWidth, `${contentCachedTrueHeightOrWidth}px`)
      contentCachedTruePadding && el.style.setProperty('padding', contentCachedTruePadding)
    },
    applyClearUselessStyle: (el: HTMLElement) => {
      el.style.removeProperty(heightOrWidth)
      el.style.removeProperty('padding')
    },
  }
}
