import { arrify, isString, mergeObjectsWithConfigs, shakeNil, switchCase } from "@edsolater/fnkit"
import { SignalizeProps, ValidProps } from "../typeTools"
import { arriablePivPropsNames } from "../Piv"

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
  const trimedProps = shakeNil(arrify(propsObjs))
  // @ts-ignore
  if (trimedProps.length <= 1) return trimedProps[0] ?? {}

  const mergedResult = mergeObjectsWithConfigs(trimedProps, ({ key, valueA: v1, valueB: v2 }) => {
    return switchCase(
      key,
      [
        // special div props
        [
          (s) => isString(s) && (arriablePivPropsNames.includes(s as any) || s.startsWith("on")),
          () => (v1 && v2 ? [v1, v2].flat() : v1 ?? v2),
        ],
      ],
      v2 ?? v1,
    )
  })
  // @ts-ignore
  return mergedResult
}
