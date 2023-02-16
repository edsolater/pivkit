import { isArray, MayArray, MayFn, shrinkFn } from '@edsolater/fnkit'
import { compressICSSToObj, ICSS, KitProps, mergeProps, Piv, useKitProps } from '@edsolater/piv'
import { CRef, PivProps } from '@edsolater/piv/src/types/piv'
import { JSX } from 'solid-js'
import { createRef } from '../hooks/createRef'
import { useGlobalKitTheme } from '../hooks/useGlobalKitTheme'
import { useStatusRef } from '../hooks/useStatusRef'
import { cssColors } from '../styles/cssColors'
import { CSSColorString, CSSStyle } from '../styles/type'
type BooleanLike = unknown

export interface ButtonStatus {
  click?: () => void
  focus?: () => void
}

const cssTransitionTimeFnOutCubic = 'cubic-bezier(0.22, 0.61, 0.36, 1)'

export type ButtonProps = KitProps<{
  /**
   * @default 'solid'
   */
  variant?: 'solid' | 'outline' | 'text'
  /**
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg'

  /**
   * !only for app's uikit <Button>
   * button's mean  color (apply to all variant of button)
   * default {@link cssColors.buttonPrimaryColor } when in darkMode
   */
  theme?: {
    mainColor?: MayFn<CSSColorString, [props: Readonly<Omit<ButtonProps, 'theme'>>]>
    mainTextColor?: MayFn<CSSColorString, [props: Readonly<Omit<ButtonProps, 'theme'>>]>
    contentGap?: MayFn<CSSStyle['gap'], [props: Readonly<Omit<ButtonProps, 'theme'>>]>
    disableOpacity?: MayFn<CSSStyle['opacity'], [props: Readonly<Omit<ButtonProps, 'theme'>>]>
    cssProps?: MayFn<ICSS, [props: Readonly<Omit<ButtonProps, 'theme'>>]>
  }

  /** a short cut for validator */
  disabled?: boolean
  /** must all condition passed */
  validators?: MayArray<{
    /** must return true to pass this validator */
    should: MayFn<BooleanLike>
    // used in "connect wallet" button, it's order is over props: disabled
    forceActive?: boolean
    /**  items are button's setting which will apply when corresponding validator has failed */
    fallbackProps?: Omit<ButtonProps, 'validators' | 'disabled'>
  }>
  /** normally, it's an icon  */
  prefix?: MayFn<JSX.Element, [utils: ButtonStatus]>
  /** normally, it's an icon  */
  suffix?: MayFn<JSX.Element, [utils: ButtonStatus]>
  statusRef?: CRef<ButtonStatus>
  clildren?: MayFn<JSX.Element, [utils: ButtonStatus]>
}>

/**
 * feat: build-in click ui effect
 */
export function Button(props: ButtonProps) {
  /* ---------------------------------- props --------------------------------- */
  const themeProps = useGlobalKitTheme<ButtonProps>(Button.name)
  const { validators, ...otherButtonProps } = mergeProps(themeProps, props)

  /* ------------------------------- validation ------------------------------- */
  const failedValidator = (isArray(validators) ? validators.length > 0 : validators)
    ? [validators!].flat().find(({ should }) => !shrinkFn(should))
    : undefined
  const mergedProps = {
    ...otherButtonProps,
    ...failedValidator?.fallbackProps
  }
  const isActive = failedValidator?.forceActive || (!failedValidator && !mergedProps.disabled)
  const disable = !isActive

  /* ------------------------------ detail props ------------------------------ */
  const [
    { variant = 'solid', size = 'md', theme, prefix, suffix, statusRef, children, onClick: originalOnClick },
    pivProps
  ] = useKitProps(mergedProps)

  const {
    mainColor = cssColors.buttonPrimaryColor,
    mainTextColor = variant === 'solid' ? 'white' : shrinkFn(mainColor, [mergedProps]),
    contentGap = 4,
    disableOpacity = 0.3,
    cssProps
  } = theme ?? {}

  const [ref, setRef] = createRef<HTMLButtonElement>()

  const innerStatus = {
    click: () => {
      ref()?.click()
    },
    focus: () => {
      ref()?.focus()
    }
  }

  useStatusRef(statusRef, innerStatus)

  const cssPadding = {
    lg: '14px 24px',
    md: '10px 16px',
    sm: '8px 16px',
    xs: '2px 6px'
  }[size]
  const cssFontSize = {
    lg: 16,
    md: 16,
    sm: 14,
    xs: 12
  }[size]
  const cssBorderRadius = {
    lg: 12,
    md: 8,
    sm: 8,
    xs: 4
  }[size]
  const cssOutlineWidth = {
    lg: 2,
    md: 2,
    sm: 1,
    xs: 0.5
  }[size]
  return (
    <Piv<'button'>
      shadowProps={pivProps}
      class={Button.name}
      as={(parsedPivProps) => <button {...parsedPivProps} />}
      onClick={(...args) => !disable && originalOnClick?.(...args)}
      htmlProps={{ type: 'button' }}
      icss={[
        { transition: `200ms ${cssTransitionTimeFnOutCubic}` }, // make it's change smooth
        { border: 'none' }, // initialize
        { color: shrinkFn(mainTextColor, [mergedProps]) }, // light mode
        {
          display: 'inline-flex',
          gap: shrinkFn(contentGap, [mergedProps]),
          alignItems: 'center',
          justifyContent: 'center'
        }, // center the items
        {
          cursor: 'pointer',
          userSelect: 'none',
          width: 'max-content'
        },
        disable && {
          opacity: shrinkFn(disableOpacity, [mergedProps]),
          cursor: 'not-allowed'
        },
        {
          padding: cssPadding,
          fontSize: cssFontSize,
          borderRadius: cssBorderRadius,
          fontWeight: 500
        },
        variant === 'solid' && {
          backgroundColor: shrinkFn(mainColor, [mergedProps]),
          ':hover': {
            filter: 'brightness(95%)'
          },
          ':active': {
            transform: 'scale(0.96)',
            filter: 'brightness(90%)'
          }
        },
        variant === 'outline' && {
          background: cssColors.transparent,
          outline: `${cssOutlineWidth} solid ${mainColor}`,
          outlineOffset: `-${cssOutlineWidth}`
        },
        variant === 'text' && {
          ':hover': {
            backgroundColor: opacityCSSColor(shrinkFn(mainColor, [mergedProps]), 0.15)
          }
        },
        compressICSSToObj(shrinkFn(cssProps, [mergedProps]))
      ]}
      ref={setRef}
    >
      {shrinkFn(prefix, [innerStatus])}
      {children}
      {shrinkFn(suffix, [innerStatus])}
    </Piv>
  )
}

/**
 * @todo TEMP, currently force it, should use NPM css color utils
 */
export function opacityCSSColor(cssColor: CSSColorString, /* 0~1 */ opacity: number) {
  return cssColor === cssColors.buttonPrimaryColor ? '#7c859826' /* 0.15 */ : `${cssColor}${opacity}` //TODO: temp
}
