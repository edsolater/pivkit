import { AnyFn, flap, mergeObjectsWithConfigs, switchCase, shakeNil } from '@edsolater/fnkit'
import { SignalizeProps, ValidProps } from '../typeTools'
import { mergeRefs } from './mergeRefs'

// TODO: mergeSignalProps should have right type tools, current is wrong

export function mergeSignalProps<P1 = SignalizeProps<ValidProps>, P2 = SignalizeProps<ValidProps>>(
  ...propsObjs: [P1, P2]
): Exclude<P1 & P2, undefined>
export function mergeSignalProps<
  P1 = SignalizeProps<ValidProps>,
  P2 = SignalizeProps<ValidProps>,
  P3 = SignalizeProps<ValidProps>,
>(...propsObjs: [P1, P2, P3]): Exclude<P1 & P2 & P3, undefined>
export function mergeSignalProps<
  P1 = SignalizeProps<ValidProps>,
  P2 = SignalizeProps<ValidProps>,
  P3 = SignalizeProps<ValidProps>,
  P4 = SignalizeProps<ValidProps>,
>(...propsObjs: [P1, P2, P3, P4]): Exclude<P1 & P2 & P3 & P4, undefined>
export function mergeSignalProps<
  P1 = SignalizeProps<ValidProps>,
  P2 = SignalizeProps<ValidProps>,
  P3 = SignalizeProps<ValidProps>,
  P4 = SignalizeProps<ValidProps>,
  P5 = SignalizeProps<ValidProps>,
>(...propsObjs: [P1, P2, P3, P4, P5]): Exclude<P1 & P2 & P3 & P4 & P5, undefined>
export function mergeSignalProps<P extends SignalizeProps<ValidProps> | undefined>(
  ...propsObjs: P[]
): Exclude<P, undefined>
export function mergeSignalProps<P extends SignalizeProps<ValidProps> | undefined>(
  ...propsObjs: P[]
): Exclude<P, undefined> {
  // @ts-ignore
  if (propsObjs.length <= 1) return propsObjs[0] ?? {}
  const trimedProps = shakeNil(flap(propsObjs))
  // @ts-ignore
  if (trimedProps.length <= 1) return trimedProps[0] ?? {}

  const mergedResult = mergeObjectsWithConfigs(trimedProps, ({ key, valueA: v1, valueB: v2 }) =>
    switchCase(
      key,
      [
        // special div props
        ['domRef', () => (v1 && v2 ? () => [v1(), v2()].flat() : v1 ?? v2)],
        ['class', () => (v1 && v2 ? () => [v1(), v2()].flat() : v1 ?? v2)],
        ['style', () => (v1 && v2 ? () => [v1(), v2()].flat() : v1 ?? v2)],
        ['icss', () => (v1 && v2 ? () => [v1(), v2()].flat() : v1 ?? v2)],
        ['htmlProps', () => (v1 && v2 ? () => [v1(), v2()].flat() : v1 ?? v2)],
        ['shadowProps', () => (v1 && v2 ? () => [v1(), v2()].flat() : v1 ?? v2)],
        ['plugin', () => (v1 && v2 ? () => [v1(), v2()].flat() : v1 ?? v2)],
        ['debugLog', () => (v1 && v2 ? () => [v1(), v2()].flat() : v1 ?? v2)],
        ['render:outWrapper', () => (v1 && v2 ? () => [v1(), v2()].flat() : v1 ?? v2)],
        ['render:firstChild', () => (v1 && v2 ? () => [v1(), v2()].flat() : v1 ?? v2)],
        ['render:lastChild', () => (v1 && v2 ? () => [v1(), v2()].flat() : v1 ?? v2)],
        ['controller', () => (v1 && v2 ? () => [v1(), v2()].flat() : v1 ?? v2)],
      ],
      v1 && v2 ? () => v2() ?? v1() : v2 ?? v1
    )
  )
  // @ts-ignore
  return mergedResult
}

type GetReturn<F extends AnyFn | undefined> = F extends AnyFn ? ReturnType<F> : undefined

type MergeData<T1, T2> = T1 & T2 extends never ? T2 : T1
type MergeOneSignalProps<P1 extends AnyFn | undefined, P2 extends AnyFn | undefined> = () => GetReturn<P1> &
  GetReturn<P2>
