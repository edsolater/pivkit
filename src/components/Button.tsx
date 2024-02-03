import { flap, isMeanfulArray, MayArray, MayFn, shrinkFn } from '@edsolater/fnkit'
import { createMemo } from 'solid-js'
import { mergeObjects } from '@edsolater/fnkit'
import { createRef } from '../hooks/createRef'
import { compressICSSToObj, ICSS, mergeProps, omit, parsePivChildren, Piv, PivChild } from '../piv'
import { renderHTMLDOM } from '../piv/propHandlers/renderHTMLDOM'
import { cssColors } from '../styles/cssColors'
import { CSSColorString, CSSStyle } from '../styles/type'
import { KitProps, useKitProps } from '../createKit'
type BooleanLike = unknown

export interface ButtonController {
  click?: () => void
  focus?: () => void
}

const cssTransitionTimeFnOutCubic = 'cubic-bezier(0.22, 0.61, 0.36, 1)'

export interface ButtonProps {
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
   * default {@link cssColors.component_button_bg_primary } when in darkMode
   */
  theme?: {
    mainBgColor?: MayFn<CSSColorString, [props: Omit<ButtonProps, 'theme' | 'validators'>]>
    mainTextColor?: MayFn<CSSColorString, [props: Omit<ButtonProps, 'theme' | 'validators'>]>
    contentGap?: MayFn<CSSStyle['gap'], [props: Omit<ButtonProps, 'theme' | 'validators'>]>
    disableOpacity?: MayFn<CSSStyle['opacity'], [props: Omit<ButtonProps, 'theme' | 'validators'>]>
    cssProps?: MayFn<ICSS, [props: Omit<ButtonProps, 'theme' | 'validators'>]>
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
  prefix?: PivChild
  /** normally, it's an icon  */
  suffix?: PivChild
}

export type ButtonKitProps = KitProps<ButtonProps, { controller: ButtonController }>

/**
 * feat: build-in click ui effect
 */
export function Button(kitProps: ButtonKitProps) {
  const innerController: ButtonController = {
    click: () => {
      ref()?.click()
    },
    focus: () => {
      ref()?.focus()
    },
  }
  /* ---------------------------------- props --------------------------------- */
  const { props } = useKitProps(kitProps, {
    controller: () => innerController,
    name: 'Button',
    defaultProps: { variant: 'solid', size: 'md' },
  })

  /* ------------------------------- validation ------------------------------- */
  const failedTestValidator = createMemo(() =>
    isMeanfulArray(props.validators) || props.validators
      ? flap(props.validators!).find(({ should }) => !shrinkFn(should))
      : undefined
  )
  const mergedProps = mergeProps(props, failedTestValidator()?.fallbackProps)

  const isActive = createMemo(
    () => failedTestValidator()?.forceActive || (!failedTestValidator() && !mergedProps.disabled)
  )

  const mainBgColor = props.theme?.mainBgColor ?? cssColors.component_button_bg_primary
  const mainTextColor = props.theme?.mainTextColor ?? cssColors.component_button_text_primary
  const contentGap = props.theme?.contentGap ?? 4
  const disableOpacity = props.theme?.disableOpacity ?? 0.3
  const cssProps = props.theme?.cssProps

  const [ref, setRef] = createRef<HTMLButtonElement>()

  const size = props.size
  const cssPadding = {
    lg: '14px 24px',
    md: '10px 16px',
    sm: '8px 16px',
    xs: '2px 6px',
  }[size]
  const cssFontSize = {
    lg: '16px',
    md: '16px',
    sm: '14px',
    xs: '12px',
  }[size]
  const cssBorderRadius = {
    lg: '12px',
    md: '8px',
    sm: '8px',
    xs: '4px',
  }[size]
  const cssOutlineWidth = {
    lg: '2px',
    md: '2px',
    sm: '1px',
    xs: '0.5px',
  }[size]

  const mergedController =
    'innerController' in props ? mergeObjects(props.innerController!, innerController) : innerController
  return (
    <Piv<'button'>
      render:self={(selfProps) => renderHTMLDOM('button', selfProps)}
      shadowProps={omit(props, 'onClick')} // omit onClick for need to invoke the function manually, see below 👇
      onClick={(...args) => isActive() && props.onClick?.(...args)}
      htmlProps={{ type: 'button' }}
      icss={[
        {
          transition: `50ms ${cssTransitionTimeFnOutCubic}`, // make it's change smooth
          border: 'none',
          color: shrinkFn(mainTextColor, [mergedProps]), // light mode
          cursor: 'pointer',
          userSelect: 'none',
          width: 'max-content',
        },
        {
          display: 'inline-flex',
          gap: shrinkFn(contentGap, [mergedProps]) + 'px',
          alignItems: 'center',
          justifyContent: 'center',
        }, // center the items
        !isActive() && {
          opacity: shrinkFn(disableOpacity, [mergedProps]),
          cursor: 'not-allowed',
        },
        {
          padding: cssPadding,
          fontSize: cssFontSize,
          borderRadius: cssBorderRadius,
          fontWeight: '500',
        },
        (!props.variant || props.variant === 'solid') && {
          backgroundColor: shrinkFn(mainBgColor, [mergedProps]),
          '&:hover': {
            filter: 'brightness(95%)',
          },
          '&:active': {
            transform: 'scale(0.98)',
            filter: 'brightness(90%)',
          },
        },
        props.variant === 'outline' && {
          background: cssColors.transparent,
          outline: `${cssOutlineWidth} solid ${mainBgColor}`,
          outlineOffset: `-${cssOutlineWidth}`,
        },
        props.variant === 'text' && {
          '&:hover': {
            backgroundColor: opacityCSSColor(shrinkFn(mainBgColor, [mergedProps]), 0.15),
          },
        },
        compressICSSToObj(shrinkFn(cssProps, [mergedProps])),
      ]}
      domRef={setRef}
    >
      {parsePivChildren(props.prefix, mergedController)}
      {/* TODO: no need. this is because kitProp don't support Access and Deaccess */}
      {parsePivChildren(props.children, mergedController)}
      {parsePivChildren(props.suffix, mergedController)}
    </Piv>
  )
}

/**
 * @todo TEMP, currently force it, should use NPM css color utils
 */
export function opacityCSSColor(cssColor: CSSColorString, /* 0~1 */ opacity: number) {
  return cssColor === cssColors.component_button_bg_primary ? '#7c859826' /* 0.15 */ : `${cssColor}${opacity}` //TODO: temp
}
